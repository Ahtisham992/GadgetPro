import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useUserStore from '../store/userStore';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product, onWishlistChange }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check if already wishlisted on mount
  useEffect(() => {
    if (!userInfo) return;
    const checkWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist', { headers: { Authorization: `Bearer ${userInfo.token}` } });
        const data = await res.json();
        setWishlisted(Array.isArray(data) && data.some(p => p._id === product._id));
      } catch { /* silent */ }
    };
    checkWishlist();
  }, [userInfo, product._id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
    toast(`${product.name} added to cart!`, 'success');
    navigate('/cart');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!userInfo) { toast('Sign in to use your wishlist', 'info'); navigate('/login'); return; }
    setWishlistLoading(true);
    try {
      const method = wishlisted ? 'DELETE' : 'POST';
      await fetch(`/api/wishlist/${product._id}`, {
        method,
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setWishlisted(!wishlisted);
      toast(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist!', wishlisted ? 'info' : 'success');
      if (onWishlistChange) onWishlistChange();
    } catch { toast('Failed to update wishlist', 'error'); }
    finally { setWishlistLoading(false); }
  };

  const isOutOfStock = product.countInStock === 0;

  return (
    <div className="product-card">
      {/* Out of Stock Badge */}
      {isOutOfStock && (
        <div style={{
          position: 'absolute', top: '0.75rem', left: '0.75rem',
          background: 'var(--color-danger)', color: '#fff',
          fontSize: '0.6875rem', fontWeight: 700, padding: '0.2rem 0.625rem',
          borderRadius: '20px', letterSpacing: '0.05em', zIndex: 2,
          textTransform: 'uppercase',
        }}>Out of Stock</div>
      )}

      {/* Wishlist Heart Button */}
      <button
        onClick={handleWishlist}
        disabled={wishlistLoading}
        style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 2,
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: '34px', height: '34px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Heart size={16} style={{ color: wishlisted ? '#EF4444' : '#9CA3AF', fill: wishlisted ? '#EF4444' : 'none', transition: 'all 0.15s' }} />
      </button>

      <Link to={`/product/${product._id}`} style={{ display: 'block' }}>
        <div className="product-card-img-wrap">
          <img src={product.image} alt={product.name} className="product-card-img" />
          {!isOutOfStock && (
            <button
              className="btn btn-primary product-card-add-btn"
              onClick={handleAddToCart}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
            >
              <ShoppingCart size={14} /> Add to Cart
            </button>
          )}
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-card-brand">{product.brand}</div>
        <Link to={`/product/${product._id}`}>
          <div className="product-card-title">{product.name}</div>
        </Link>
        <div className="product-card-rating">
          <span className="stars" style={{ fontSize: '0.75rem' }}>
            {'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}
          </span>
          <span style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>
            ({product.numReviews || 0})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="product-card-price">PKR {product.price?.toLocaleString()}</div>
          <Link to={`/product/${product._id}`}>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', color: 'var(--color-text-muted)' }}>
              View →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
