import os
from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

# Load environment variable from parent directory
load_dotenv(dotenv_path=".env")

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI not found. Please ensure backend/.env exists.")

app = FastAPI(title="GadgetPro AI Recommendations")

# Database Connection Helper
def get_db():
    client = MongoClient(MONGO_URI)
    return client.get_default_database()

@app.get("/recommend/{user_id}")
def recommend_products(user_id: str, limit: int = 4):
    """
    Returns a list of recommended product IDs for a given user using Collaborative Filtering.
    """
    db = get_db()
    
    # 1. Fetch Orders to build the User-Item matrix
    # We only care about delivered or paid orders to indicate actual purchase intent
    orders = list(db.orders.find({}))
    
    if not orders:
        # Fallback: No orders yet, just return trending products
        return fallback_recommendations(db, limit)

    # Transform orders into a flat list of user-product interactions
    records = []
    for order in orders:
        uid = str(order.get('user', 'unknown'))
        # If the order lacks a user, skip
        if uid == 'unknown': continue
        
        for item in order.get('orderItems', []):
            pid = str(item.get('product'))
            qty = item.get('qty', 1)
            records.append({'user_id': uid, 'product_id': pid, 'qty': qty})

    df = pd.DataFrame(records)

    # If the dataframe is empty or this specific user has never bought anything
    if df.empty or user_id not in df['user_id'].values:
        return fallback_recommendations(db, limit)

    # 2. Build User-Item Matrix
    # rows: users, columns: products, values: total qty bought
    user_item_matrix = df.groupby(['user_id', 'product_id'])['qty'].sum().unstack(fill_value=0)
    
    # If the matrix is too small (e.g., only 1 user has ever made a purchase), CF won't work well
    if len(user_item_matrix) <= 1:
        return fallback_recommendations(db, limit)

    # 3. Calculate Cosine Similarity between users
    user_similarity = cosine_similarity(user_item_matrix)
    user_similarity_df = pd.DataFrame(user_similarity, index=user_item_matrix.index, columns=user_item_matrix.index)

    # 4. Find similar users
    # Get the target user's similarity scores against all other users, sort descending
    similar_users = user_similarity_df[user_id].sort_values(ascending=False)
    
    # Drop the user themselves
    similar_users = similar_users.drop(user_id)
    
    if similar_users.empty or similar_users.max() == 0:
         return fallback_recommendations(db, limit)

    # Get items bought by the target user
    target_user_items = set(user_item_matrix.loc[user_id][user_item_matrix.loc[user_id] > 0].index)

    # 5. Generate Recommendations
    recommendations = {}
    
    # Only consider the top 5 most similar users to weight recommendations
    top_similar_users = similar_users.head(5)
    
    for sim_user_id, sim_score in top_similar_users.items():
        if sim_score == 0: continue
        
        # Get items bought by this similar user
        sim_user_bought = user_item_matrix.loc[sim_user_id]
        
        for pid, qty in sim_user_bought.items():
            if qty > 0 and pid not in target_user_items:
                # Weight the recommendation by the similarity of the user who bought it
                if pid not in recommendations:
                    recommendations[pid] = 0
                recommendations[pid] += qty * sim_score

    # Sort recommended items by weighted score
    sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
    
    rec_product_ids = [pid for pid, score in sorted_recs][:limit]

    # If CF couldn't find enough recommendations, pad with fallback
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
    """
    Returns the most popular products globally based on reviews if CF data is sparse.
    """
    top_products = list(db.products.find({"countInStock": {"$gt": 0}}).sort("numReviews", -1).limit(limit))
    return {"recommendations": [str(p["_id"]) for p in top_products]}

if __name__ == "__main__":
    import uvicorn
    # Make sure to run on a different port than Node.js (5000) and React (5173)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
