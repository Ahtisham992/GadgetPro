# GadgetPro 🚀

GadgetPro is a premium, full-stack MERN (MongoDB, Express, React, Node.js) ecommerce platform designed exclusively for high-end tech gadgets. Featuring a sleek, Apple-inspired user interface and a robust administrative backend, GadgetPro acts as a complete end-to-end shopping solution.

live demo : https://thegadgetpro.netlify.app/
---

## ✨ Key Features

### For Customers
* **Modern & Responsive UI**: Cinematic homepage, slick product galleries, and seamless mobile-to-desktop transitions.
* **Smart Search & Pagination**: Find products instantly via the global search bar, backed by fast server-side pagination.
* **Rich Product Details**: Multi-image galleries, detailed specifications, and interactive star-rating reviews.
* **Persistent Wishlists**: Save favorite items for later via the intuitive heart toggle system.
* **Advanced Checkout**: Manage multiple saved shipping addresses and apply promotional coupon codes dynamically.
* **Order Management & Returns**: Track order statuses in real-time. Once delivered, easily submit Return Requests or write reviews for individual items right from the Profile dashboard.
* **Global Toast Notifications**: Instant, elegant alerts for all cart actions, wishlist changes, and profile updates.

### For Administrators
* **Analytics Dashboard**: Comprehensive `Chart.js` visualizations detailing Revenue (Last 7 Days), Order Status breakdowns, and Top 5 Best-Selling Products.
* **Inventory Mastery**: Full CRUD capabilities for the product catalog with easy stock adjustments.
* **Order Fulfillment Pipeline**: Step-by-step order progression (Accept -> Deliver -> Paid) with automatic Email Notifications dispatched to customers.
* **Returns & Coupons**: Dedicated hubs to review customer refund requests and generate active discount promotional codes.

---

## 🛠 Tech Stack

* **Frontend**: React (Vite), React Router DOM, Zustand (State Management), Lucide-React (Icons), Chart.js (Analytics)
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), JSON Web Tokens (JWT Auth), Nodemailer (Emails)
* **Design/CSS**: Dedicated Vanilla CSS modules built using modern flexbox, CSS Grid, and responsive variables. No heavy frameworks required.

---

## ⚙️ Local Development Quick Start

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+) and [MongoDB](https://www.mongodb.com/) installed or provisioned via MongoDB Atlas.

### 2. Install Dependencies
Execute the following from the root directory to install packages for both client and server:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables
In the `backend/` folder, create a `.env` file with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password
```

### 4. Seed the Database
Initialize the database with sample products and an Admin user:
```bash
cd backend
npm run data:import
```
*(Default Admin Login: `admin@gadget.com` / `123456`)*

### 5. Start the Application
You'll need two terminal windows to run both development servers concurrently.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
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
│   ├── controllers/          # Endpoint logic (products, orders, wishlist)
│   ├── data/                 # Seeding data
│   ├── middleware/           # Auth guards & error handlers
│   ├── models/               # Mongoose DB schemas
│   ├── routes/               # Express routing
│   └── utils/                # Nodemailer config & helpers
├── frontend/                 # React client
│   ├── src/
│   │   ├── components/       # Reusable UI (Header, Footer, ProductCard)
│   │   ├── pages/            # View components (Home, Cart, Admin)
│   │   ├── store/            # Zustand global state (Cart, User, Wishlist)
│   │   ├── App.jsx           # Routing definition
│   │   └── index.css         # Global design system & utility classes
└── README.md
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
