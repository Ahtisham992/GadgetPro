import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE" # Fix for Windows DLL load issues with torch/mkl
from fastapi import FastAPI, HTTPException, Body
from pymongo import MongoClient
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import IsolationForest
from transformers import pipeline
from prophet import Prophet
from dotenv import load_dotenv
from datetime import datetime, timedelta
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variable from parent directory
load_dotenv(dotenv_path=".env")

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI not found. Please ensure backend/.env exists.")

app = FastAPI(title="GadgetPro AI Analytics")

# ─── ML Initialization ──────────────────────────────────────────

# Initialize Sentiment Analyzer (distilbert is fast and accurate enough for reviews)
# We load it globally so it stays in memory
try:
    logger.info("Loading Sentiment Analysis model...")
    sentiment_task = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    logger.info("Sentiment Analysis model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load sentiment model: {e}")
    sentiment_task = None

# Database Connection Helper
def get_db():
    client = MongoClient(MONGO_URI)
    return client.get_default_database()

# ─── Recommendations (Existing) ──────────────────────────────────

@app.get("/recommend/{user_id}")
def recommend_products(user_id: str, limit: int = 4):
    db = get_db()
    orders = list(db.orders.find({}))
    if not orders:
        return fallback_recommendations(db, limit)

    records = []
    for order in orders:
        uid = str(order.get('user', 'unknown'))
        if uid == 'unknown': continue
        for item in order.get('orderItems', []):
            pid = str(item.get('product'))
            qty = item.get('qty', 1)
            records.append({'user_id': uid, 'product_id': pid, 'qty': qty})

    df = pd.DataFrame(records)
    if df.empty or user_id not in df['user_id'].values:
        return fallback_recommendations(db, limit)

    user_item_matrix = df.groupby(['user_id', 'product_id'])['qty'].sum().unstack(fill_value=0)
    if len(user_item_matrix) <= 1:
        return fallback_recommendations(db, limit)

    user_similarity = cosine_similarity(user_item_matrix)
    user_similarity_df = pd.DataFrame(user_similarity, index=user_item_matrix.index, columns=user_item_matrix.index)
    similar_users = user_similarity_df[user_id].sort_values(ascending=False).drop(user_id)
    
    if similar_users.empty or similar_users.max() == 0:
         return fallback_recommendations(db, limit)

    target_user_items = set(user_item_matrix.loc[user_id][user_item_matrix.loc[user_id] > 0].index)
    recommendations = {}
    top_similar_users = similar_users.head(5)
    
    for sim_user_id, sim_score in top_similar_users.items():
        if sim_score == 0: continue
        sim_user_bought = user_item_matrix.loc[sim_user_id]
        for pid, qty in sim_user_bought.items():
            if qty > 0 and pid not in target_user_items:
                if pid not in recommendations:
                    recommendations[pid] = 0
                recommendations[pid] += qty * sim_score

    sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
    rec_product_ids = [pid for pid, score in sorted_recs][:limit]

    if len(rec_product_ids) < limit:
        needed = limit - len(rec_product_ids)
        fallbacks = fallback_recommendations(db, needed + len(target_user_items))
        for f_pid in fallbacks['recommendations']:
            if f_pid not in rec_product_ids and f_pid not in target_user_items:
                rec_product_ids.append(f_pid)
                if len(rec_product_ids) == limit:
                    break

    return {"recommendations": rec_product_ids}

def fallback_recommendations(db, limit: int):
    top_products = list(db.products.find({"countInStock": {"$gt": 0}}).sort("numReviews", -1).limit(limit))
    return {"recommendations": [str(p["_id"]) for p in top_products]}

# ─── Sentiment Analysis (New) ──────────────────────────────────

@app.post("/analyze/sentiment")
def analyze_sentiment(data: dict = Body(...)):
    """
    Takes text and returns sentiment score (0-1) and label.
    """
    if not sentiment_task:
        raise HTTPException(status_code=503, detail="Sentiment model not loaded")
    
    text = data.get("text", "")
    if not text:
        return {"label": "NEUTRAL", "score": 0.5}

    try:
        result = sentiment_task(text)[0]
        # label is 'POSITIVE' or 'NEGATIVE', score is confidence
        label = result['label']
        confidence = result['score']
        
        # We normalize to a 0-1 score where 1 is absolute positive
        final_score = confidence if label == 'POSITIVE' else (1 - confidence)
        
        return {
            "label": label,
            "score": round(final_score, 4),
            "confidence": round(confidence, 4)
        }
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return {"label": "NEUTRAL", "score": 0.5}

# ─── Demand Forecasting (New) ──────────────────────────────────

@app.get("/forecast/demand")
def forecast_demand(days: int = 30):
    """
    Uses Prophet to predict total shop demand for the next N days based on order history.
    """
    db = get_db()
    orders = list(db.orders.find({}, {"createdAt": 1, "orderItems": 1}))
    
    if len(orders) < 5:
        return {"error": "Not enough data for forecasting (min 5 orders)"}

    # Flatten order items into time series
    data = []
    for order in orders:
        date = order['createdAt'].date()
        total_qty = sum(item.get('qty', 1) for item in order.get('orderItems', []))
        data.append({'ds': date, 'y': total_qty})

    df = pd.DataFrame(data)
    # Aggregate by day
    df = df.groupby('ds').sum().reset_index()
    df['ds'] = pd.to_datetime(df['ds'])

    try:
        # Prophet model
        m = Prophet(yearly_seasonality=False, weekly_seasonality=True, daily_seasonality=False)
        m.fit(df)
        
        future = m.make_future_dataframe(periods=days)
        forecast = m.predict(future)
        
        # Get only future predictions
        predictions = forecast[forecast['ds'] > df['ds'].max()]
        
        result = []
        for _, row in predictions.iterrows():
            result.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "expected_sales": max(0, round(row['yhat'], 2)),
                "lower_bound": max(0, round(row['yhat_lower'], 2)),
                "upper_bound": max(0, round(row['yhat_upper'], 2))
            })
            
        return {
            "forecast": result,
            "total_predicted_sales": round(sum(p['expected_sales'] for p in result), 0)
        }
    except Exception as e:
        logger.error(f"Forecasting error: {e}")
        return {"error": str(e)}

# ─── Fraud Detection (New) ─────────────────────────────────────

@app.post("/analyze/fraud")
def analyze_fraud(current_order: dict = Body(...)):
    """
    Unsupervised Anomaly Detection using Isolation Forest.
    Compares current order against history to flag outliers.
    """
    db = get_db()
    # Get recent history for baseline (limit to last 1000 orders)
    history = list(db.orders.find({}, {"totalPrice": 1, "shippingAddress": 1, "user": 1}).sort("createdAt", -1).limit(1000))
    
    if len(history) < 10:
        return {"riskScore": 0.1, "reason": "Insufficient history for baseline"}

    # Feature Engineering
    # 1. Total Price
    # 2. Number of items (if available) - current order usually passed as dict
    # 3. User history (is this a new user?)
    
    def extract_features(o):
        return [
            float(o.get('totalPrice', 0)),
            len(o.get('orderItems', [])) if 'orderItems' in o else 1
        ]

    baseline_data = [extract_features(o) for o in history]
    current_features = extract_features(current_order)
    
    X = pd.DataFrame(baseline_data, columns=['price', 'items'])
    
    try:
        # Isolation Forest
        # -1 = anomaly, 1 = normal
        iso = IsolationForest(contamination=0.05, random_state=42)
        iso.fit(X)
        
        prediction = iso.predict([current_features])[0]
        decision_score = iso.decision_function([current_features])[0]
        
        # Normalize decision score (lower is more anomalous)
        # decision_function returns float in [-0.5, 0.5] usually
        # We want riskScore 0 (safe) to 1 (fraud)
        risk_score = 0.5 - decision_score # 0.5 becomes 0, -0.5 becomes 1
        risk_score = max(0, min(1, risk_score))

        return {
            "riskScore": round(risk_score, 2),
            "isAnomaly": bool(prediction == -1),
            "reason": "Anomalous order pattern" if prediction == -1 else "Normal pattern"
        }
    except Exception as e:
        logger.error(f"Fraud analysis error: {e}")
        return {"riskScore": 0.5, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Make sure to run on a different port than Node.js (5000) and React (5173)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
