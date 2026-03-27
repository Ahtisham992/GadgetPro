import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useUserStore from '../store/userStore';
import ProductCard from '../components/ProductCard';
import { Heart } from 'lucide-react';

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useUserStore();

  const fetchWishlist = async () => {
    if (!userInfo) return;
    try {
      const res = await fetch('/api/wishlist', { headers: { Authorization: `Bearer ${userInfo.token}` } });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchWishlist(); }, [userInfo]);

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <Heart size={24} style={{ color: '#EF4444', fill: '#EF4444' }} />
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800 }}>My Wishlist</h1>
        {products.length > 0 && (
          <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '20px', padding: '0.125rem 0.625rem', fontSize: '0.875rem', fontWeight: 700 }}>
            {products.length}
          </span>
        )}
      </div>

      {!userInfo ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ marginBottom: '1rem' }}>Please sign in to view your wishlist.</p>
          <Link to="/login"><button className="btn btn-primary">Sign In</button></Link>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-4 grid-cols-2-sm">
          {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '16px' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>💝</div>
          <h3 style={{ marginBottom: '0.75rem' }}>Your wishlist is empty</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Heart products you love to save them here.</p>
          <Link to="/"><button className="btn btn-primary">Browse Products</button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 grid-cols-2-sm">
          {products.map(p => <ProductCard key={p._id} product={p} onWishlistChange={fetchWishlist} />)}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
