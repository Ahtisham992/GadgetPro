import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';   // ← Fix #4
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import CategoryPage from './pages/CategoryPage';
import WishlistPage from './pages/WishlistPage';

import DashboardOverview from './pages/admin/DashboardOverview';
import ProductList from './pages/admin/ProductList';
import ProductEdit from './pages/admin/ProductEdit';
import OrderList from './pages/admin/OrderList';
import OrderManage from './pages/admin/OrderManage';
import OrderInvoice from './pages/admin/OrderInvoice';
import CouponList from './pages/admin/CouponList';
import ReturnList from './pages/admin/ReturnList';
import ReviewManager from './pages/admin/ReviewManager';
import TrendingPage from './pages/admin/TrendingPage';
import { usePushNotifications } from './hooks/usePushNotifications';

function App() {
  usePushNotifications();

  return (
    <Router>
      <ScrollToTop />   {/* ← scrolls to top on every route change */}
      <Routes>
        {/* Public Storefront */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
        <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
        <Route path="/category/:cat" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/wishlist" element={<PublicLayout><WishlistPage /></PublicLayout>} />

        {/* Admin Dashboard Suite */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductEdit />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderManage />} />
          <Route path="coupons" element={<CouponList />} />
          <Route path="returns" element={<ReturnList />} />
          <Route path="reviews" element={<ReviewManager />} />
          <Route path="trending" element={<TrendingPage />} />
        </Route>

        {/* Standalone Printable Routes */}
        <Route path="/admin/orders/:id/invoice" element={<OrderInvoice />} />
      </Routes>
    </Router>
  );
}

export default App;