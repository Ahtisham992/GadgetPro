# GadgetPro 🚀🤖

GadgetPro is a next-generation, AI-powered full-stack MERN (MongoDB, Express, React, Node.js) eCommerce platform. Designed exclusively for high-end tech gadgets, it combines a sleek, Apple-inspired user interface with state-of-the-art Artificial Intelligence to deliver a premium, personalized shopping experience.

**Live Demo**: https://thegadgetpro.netlify.app/

---

## ✨ Key Features

### 🤖 AI-Powered Capabilities
* **Smart Semantic Search (NLP)**: Unlike traditional keyword matching, GadgetPro uses mathematical vector embeddings (generated locally via `@xenova/transformers`) and MongoDB Atlas Vector Search. Users can search for abstract concepts like "high performance gaming machine" and the system will intelligently surface relevant gaming laptops and monitors.
* **Intelligent Chat Assistant**: A globally persistent, glassmorphism chat widget powered by the **xAI Grok API**. Utilizing Retrieval-Augmented Generation (RAG), the chatbot is constantly aware of the store's current live inventory and the user's active shopping cart, allowing it to provide highly contextual product recommendations and support.
* **Personalized Recommendations Engine**: A dedicated **Python FastAPI Microservice** analyzes user purchase histories to build a User-Item interaction matrix. Using Collaborative Filtering (`scikit-learn`), it dynamically populates the "Frequently Bought Together" and "You Might Also Like" sections with hyper-personalized suggestions.
* **Sentiment Analysis**: Processes customer reviews using `distilbert` to determine sentiment, rendering helpful badges and an overall sentiment summary in the Admin Review Manager.
* **Demand Forecasting**: Analyzes past order data using Meta's **Prophet** algorithm to provide a 30-day projected sales forecast in the Admin Dashboard.
* **Fraud Detection Anomaly Engine**: Evaluates individual orders using an Isolation Forest model to flag high-risk anomalies automatically in the order queue.

### 📱 Mobile Experience
* **React Native App**: In addition to the responsive web app, GadgetPro includes a fully-functional ecosystem via a companion React Native application, empowering customers to seamlessly browse, order, and track gadgets on the go.

### 🛒 For Customers
* **Modern & Responsive UI**: Cinematic hero sections, beautiful CSS Grid layouts, and seamless mobile-to-desktop transitions built entirely with custom CSS modules.
* **Persistent Wishlists**: Save favorite items for later via the intuitive heart toggle system on product cards.
* **Advanced Checkout & Coupons**: Manage multiple saved shipping addresses and apply promotional discount codes dynamically during checkout.
* **Order Management & Returns**: Track order statuses in real-time. Easily submit Return Requests or write verified reviews for individual items right from your Profile dashboard.
* **Stock Notifications**: Out-of-stock items feature a "Notify Me" button that sends an automated email when the admin replenishes inventory.
* **Global Toast Notifications**: Instant, elegant alerts for all cart actions, wishlist changes, and profile updates.

### 💼 For Administrators
* **Analytics Dashboard**: Comprehensive `Chart.js` visualizations detailing Revenue (Last 7 Days), Order Status breakdowns, and Top Best-Selling Products.
* **Inventory & Order Mastery**: Full CRUD capabilities for the product catalog with easy stock adjustments. Step-by-step order progression (Accept -> Deliver -> Paid) with automatic Email Notifications dispatched to customers at every step.
* **Returns & Promotional Hub**: Dedicated views to review and process customer refund requests and generate active discount promotional codes.

---

## 🛠 Tech Stack

### Web Application (MERN)
* **Frontend**: React (Vite), React Router DOM, Zustand (State Management), Lucide-React (Icons), Chart.js
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT), Nodemailer

### Mobile Application
* **Framework**: React Native, React Navigation

### Artificial Intelligence Infrastructure
* **Vector Embeddings**: `@xenova/transformers` (Local Node.js execution via `Xenova/all-MiniLM-L6-v2`)
* **Vector Database**: MongoDB Atlas `$vectorSearch`
* **Large Language Model**: xAI Grok API (`grok-2-latest`) via OpenAI SDK
* **Recommendation Microservice**: Python 3.10+, FastAPI, `scikit-learn`, `pandas`, `pymongo`

---

## ⚙️ Local Development Quick Start

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.9+)
* [MongoDB Atlas](https://www.mongodb.com/) Account (Free tier works perfectly)

### 2. Install Dependencies
Execute the following from the root directory to install packages for both client and server:

```bash
# Install Node.js backend dependencies
cd backend
npm install

# Install React frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
In the `backend/` folder, create a `.env` file with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key

# Email Server Config (For Order & Restock Notifications)
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password

# xAI API Key for the Chatbot
GROK_API_KEY=your_xai_api_key
```

### 4. Configure MongoDB Vector Search
To enable the Smart Search feature, you must create a Vector Index in your Atlas Dashboard:
1. Go to **Atlas Search** > **Create Index** > **JSON Editor**.
2. Select your `gadgetpro` database and `products` collection.
3. Name the index exactly: `vector_index`
4. Paste this configuration:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

### 5. Seed the Database
Initialize the database with sample products and generate their vector embeddings:
```bash
cd backend
npm run data:import
node generateEmbeddings.js
```
*(Default Admin Login: `admin@gadget.com` / `123456`)*

### 6. Start the Application
You will need three terminal windows to run all microservices concurrently.

**Terminal 1 (Backend Node.js Server):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Python AI Recommendation Service):**
```bash
cd ai_service
.\setup.bat
# (For Mac/Linux, run: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn main:app --port 8000)
```

**Terminal 3 (Frontend React Server):**
```bash
cd frontend
npm run dev
```

Browse to `http://localhost:5173` to see GadgetPro in action!

---

## 🏗 Architecture & Folder Structure

```
Nextgen/
├── backend/                  # Express server & APIs
│   ├── config/               # Database config
│   ├── controllers/          # Endpoint logic (products, chat, orders)
│   ├── data/                 # Seeding data
│   ├── middleware/           # Auth guards & error handlers
│   ├── models/               # Mongoose DB schemas
│   ├── routes/               # Express routing
│   └── utils/                # Nodemailer config & local Embedding generators
├── frontend/                 # React client
│   ├── src/
│   │   ├── components/       # Reusable UI (Header, ChatWidget, ProductCard)
│   │   ├── pages/            # View components (Home, Cart, Admin)
│   │   ├── store/            # Zustand global state (Cart, User, Wishlist)
│   │   ├── App.jsx           # Routing definition
│   │   └── index.css         # Global styling & CSS variables
├── mobile/                   # React Native mobile client
│   └── src/                  # Screens, components, and navigation
├── ai_service/               # Python FastAPI Recommendation Engine
│   ├── main.py
│   ├── requirements.txt
│   └── setup.bat
└── README.md
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
