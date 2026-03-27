import { useState, useEffect } from 'react';
import useUserStore from '../../store/userStore';
import { MessageCircle, Star, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const ReviewManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState({});
  const [saving, setSaving] = useState({});
  const [expanded, setExpanded] = useState({});
  const userInfo = useUserStore(state => state.userInfo);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/products?limit=1000');
        const data = await res.json();
        const withReviews = (data.products || []).filter(p => p.reviews && p.reviews.length > 0);
        setProducts(withReviews);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const totalReviews = products.reduce((acc, p) => acc + p.reviews.length, 0);

  const handleReply = async (productId, reviewId) => {
    const reply = replyTexts[reviewId] || '';
    if (!reply.trim()) return;
    setSaving(s => ({ ...s, [reviewId]: true }));
    try {
      const res = await fetch(`/api/products/${productId}/reviews/${reviewId}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ reply }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p._id === productId
          ? { ...p, reviews: p.reviews.map(r => r._id === reviewId ? { ...r, adminReply: reply } : r) }
          : p
        ));
        setReplyTexts(t => ({ ...t, [reviewId]: '' }));
      }
    } catch (err) { console.error(err); }
    finally { setSaving(s => ({ ...s, [reviewId]: false })); }
  };

  const handleDelete = async (productId, reviewId) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const res = await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p._id === productId
          ? { ...p, reviews: p.reviews.filter(r => r._id !== reviewId) }
          : p
        ).filter(p => p.reviews.length > 0));
      }
    } catch (err) { console.error(err); }
  };

  const starColor = (rating) => rating >= 4 ? 'var(--color-success)' : rating >= 3 ? 'var(--color-warning)' : 'var(--color-danger)';

  if (loading) return <div className="loader" />;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Review Manager</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {totalReviews} total review{totalReviews !== 1 ? 's' : ''} across {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No reviews yet. Come back once customers start leaving feedback!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {products.map(product => (
            <div key={product._id} className="card" style={{ overflow: 'hidden' }}>
              {/* Product Header */}
              <div
                style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderBottom: expanded[product._id] ? '1px solid var(--color-border)' : 'none', flexWrap: 'wrap' }}
                onClick={() => setExpanded(e => ({ ...e, [product._id]: !e[product._id] }))}
              >
                <img src={product.image} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', background: 'var(--color-bg-alt)', padding: '4px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{product.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''} • Avg {product.rating.toFixed(1)} ★</div>
                </div>
                {expanded[product._id] ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />}
              </div>

              {/* Reviews List */}
              {expanded[product._id] && (
                <div>
                  {product.reviews.map((review, i) => (
                    <div key={review._id} style={{ padding: '1.25rem', borderBottom: i < product.reviews.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      {/* Review Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{review.name}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8125rem', fontWeight: 700, color: starColor(review.rating) }}>
                              <Star size={12} fill={starColor(review.rating)} color={starColor(review.rating)} /> {review.rating}/5
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(product._id, review._id)}
                          style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '0.375rem 0.5rem', cursor: 'pointer', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', transition: 'all 0.15s', height: 'fit-content' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-danger-bg)'; e.currentTarget.style.borderColor = 'var(--color-danger)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>

                      {/* Review Body */}
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: 1.6 }}>{review.comment}</p>
                      {review.image && <img src={review.image} alt="Review" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '0.75rem' }} />}

                      {/* Existing Admin Reply */}
                      {review.adminReply && (
                        <div style={{ background: 'var(--color-primary-light)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.75rem', borderLeft: '3px solid var(--color-primary)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>💬 Official GadgetPro Response</div>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)' }}>{review.adminReply}</p>
                        </div>
                      )}

                      {/* Reply Input */}
                      <div className="admin-reply-input" style={{ display: 'flex', gap: '0.625rem' }}>
                        <style>{`
                          @media (max-width: 480px) {
                            .admin-reply-input { flex-direction: column; }
                            .admin-reply-input button { width: 100%; }
                          }
                        `}</style>
                        <textarea
                          placeholder={review.adminReply ? 'Update your reply...' : 'Write an official reply...'}
                          value={replyTexts[review._id] || ''}
                          onChange={e => setReplyTexts(t => ({ ...t, [review._id]: e.target.value }))}
                          className="form-control"
                          rows={2}
                          style={{ flex: 1, resize: 'vertical', fontSize: '0.875rem' }}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => handleReply(product._id, review._id)}
                          disabled={saving[review._id] || !replyTexts[review._id]?.trim()}
                          style={{ alignSelf: 'flex-end', flexShrink: 0 }}
                        >
                          {saving[review._id] ? 'Saving...' : review.adminReply ? 'Update Reply' : 'Reply'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewManager;
