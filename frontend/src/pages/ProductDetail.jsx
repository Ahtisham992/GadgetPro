import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { ShoppingCart, ChevronRight, Plus, Minus, Star } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  const addToCart = useCartStore(s => s.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProduct(data);
        setSelectedImage(data.images?.length > 0 ? data.images[0] : data.image);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCartHandler = () => { addToCart(product, qty); navigate('/cart'); };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        <div className="grid grid-cols-2" style={{ gap: '3rem' }}>
          <div className="skeleton" style={{ height: '420px', borderRadius: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '20px', width: '30%' }} />
            <div className="skeleton" style={{ height: '36px', width: '90%' }} />
            <div className="skeleton" style={{ height: '28px', width: '40%' }} />
            <div className="skeleton" style={{ height: '100px' }} />
            <div className="skeleton" style={{ height: '52px', marginTop: '1rem' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link to="/"><button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Back to Home</button></Link>
    </div>
  );

  const maxQty = Math.min(product.countInStock || 0, 10);
  const isOutOfStock = product.countInStock === 0;
  const lowStock = product.countInStock > 0 && product.countInStock <= 9;

  const starBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: product.reviews?.filter(r => r.rating === star).length || 0,
    pct: product.reviews?.length > 0 ? Math.round((product.reviews.filter(r => r.rating === star).length / product.reviews.length) * 100) : 0,
  }));

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '0.75rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <Link to="/" style={{ color: 'var(--color-text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--color-primary)'} onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Home</Link>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--color-text-muted)' }}>{product.category}</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        {/* Top: Image + Info */}
        <div className="grid grid-cols-2" style={{ gap: '3.5rem', marginBottom: '3rem' }}>
          {/* Image Gallery */}
          <div>
            <div style={{ background: 'var(--color-bg-alt)', borderRadius: '20px', overflow: 'hidden', padding: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', aspectRatio: '1/1', marginBottom: '1rem' }}>
              <img src={selectedImage || product.image} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    style={{ 
                      width: '70px', height: '70px', flexShrink: 0, 
                      borderRadius: '12px', border: `2px solid ${selectedImage === img ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: 'var(--color-bg-alt)', padding: '0.25rem', cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <img src={img} alt={`Thumbnail ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Brand + Category */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
              <span className="badge badge-primary">{product.brand}</span>
              <span className="badge badge-neutral">{product.category}</span>
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', letterSpacing: '-0.025em' }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={16} fill={i <= Math.round(product.rating || 0) ? '#FBBF24' : 'none'} color={i <= Math.round(product.rating || 0) ? '#FBBF24' : '#D1D5DB'} />
                ))}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {product.rating?.toFixed(1) || '0.0'} ({product.numReviews || 0} review{product.numReviews !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Price */}
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
              PKR {product.price?.toLocaleString()}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: '1.75rem' }}>
              {isOutOfStock ? (
                <span className="badge badge-danger" style={{ fontSize: '0.875rem', padding: '0.3rem 0.75rem' }}>Out of Stock</span>
              ) : lowStock ? (
                <span className="badge badge-warning" style={{ fontSize: '0.875rem', padding: '0.3rem 0.75rem' }}>
                  Only {product.countInStock} left!
                </span>
              ) : (
                <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '0.3rem 0.75rem' }}>In Stock</span>
              )}
            </div>

            {/* Quantity */}
            {!isOutOfStock && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.625rem', color: 'var(--color-text)' }}>Quantity</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0', border: '1.5px solid var(--color-border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    style={{ width: '40px', height: '40px', border: 'none', background: 'var(--color-bg-alt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-border)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-alt)'}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '48px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    style={{ width: '40px', height: '40px', border: 'none', background: 'var(--color-bg-alt)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-border)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-alt)'}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              className="btn btn-primary btn-lg"
              onClick={addToCartHandler}
              disabled={isOutOfStock}
              style={{ gap: '0.625rem' }}
            >
              <ShoppingCart size={18} />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
          <div className="tabs" style={{ padding: '0 1.5rem', margin: 0, borderRadius: 0 }}>
            {[
              { key: 'description', label: 'Description' },
              { key: 'reviews', label: `Reviews (${product.numReviews || 0})` },
            ].map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '2rem' }}>
            {activeTab === 'description' && (
              <div className="fade-in">
                <p style={{ fontSize: '1rem', lineHeight: 1.8, color: 'var(--color-text-muted)' }}>{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="fade-in">
                {/* Rating Overview */}
                {product.reviews?.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--color-bg-alt)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1 }}>{(product.rating || 0).toFixed(1)}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', margin: '0.5rem 0' }}>
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={16} fill={i <= Math.round(product.rating || 0) ? '#FBBF24' : 'none'} color={i <= Math.round(product.rating || 0) ? '#FBBF24' : '#D1D5DB'} />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{product.numReviews} reviews</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                      {starBreakdown.map(({ star, count, pct }) => (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', width: '40px', flexShrink: 0 }}>{star} ★</span>
                          <div style={{ flex: 1, height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#FBBF24', borderRadius: '4px', transition: 'width 0.5s' }} />
                          </div>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', width: '36px', textAlign: 'right' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review List */}
                {product.reviews?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                    <p>No reviews yet. Be the first to share your experience!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
                    {product.reviews?.map(review => (
                      <div key={review._id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{review.name}</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{review.createdAt?.substring(0, 10)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '0.625rem' }}>
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={13} fill={i <= review.rating ? '#FBBF24' : 'none'} color={i <= review.rating ? '#FBBF24' : '#D1D5DB'} />
                          ))}
                        </div>
                        <p style={{ fontSize: '0.9375rem', margin: 0 }}>{review.comment}</p>
                        {review.image && (
                          <img src={review.image} alt="Review" style={{ maxWidth: '180px', borderRadius: '10px', marginTop: '0.875rem', border: '1px solid var(--color-border)' }} />
                        )}
                        {review.adminReply && (
                          <div style={{ marginTop: '1rem', background: 'var(--color-primary-light)', padding: '0.875rem 1rem', borderRadius: '10px', borderLeft: '3px solid var(--color-primary)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>💬 GadgetPro Response</div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>{review.adminReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
