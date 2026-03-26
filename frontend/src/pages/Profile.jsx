import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { Package, Clock, CheckCircle, Truck, Star, X, MapPin, Trash2, Plus } from 'lucide-react';

const STATUS_CONFIG = {
  delivered: { label: 'Delivered', color: 'var(--color-success)', bg: 'var(--color-success-bg)', icon: <CheckCircle size={13} /> },
  shipped:   { label: 'In Transit', color: 'var(--color-info)', bg: '#EFF6FF', icon: <Truck size={13} /> },
  processing:{ label: 'Processing', color: 'var(--color-warning)', bg: '#FFFBEB', icon: <Clock size={13} /> },
};

const getOrderStatus = (order) => {
  if (order.isDelivered) return 'delivered';
  if (order.isPaid) return 'shipped';
  return 'processing';
};

/* ─── Review Modal ─── */
const ReviewModal = ({ item, orderId, userInfo, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewImage, setReviewImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      setReviewImage(data.image);
    } catch { /* ignore */ }
    finally { setUploading(false); }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${item.product}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ rating, comment, image: reviewImage, orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fade-in" style={{ background: 'var(--color-surface)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--color-bg-alt)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem', paddingRight: '2rem' }}>
          <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '10px', background: 'var(--color-bg-alt)', padding: '4px', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>{item.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Write your review</div>
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={submitHandler}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: '0.5rem', cursor: 'pointer' }} onMouseLeave={() => setHoverRating(0)}>
              {[1,2,3,4,5].map(star => (
                <Star
                  key={star}
                  size={32}
                  fill={(hoverRating || rating) >= star ? '#FBBF24' : 'none'}
                  color={(hoverRating || rating) >= star ? '#FBBF24' : 'var(--color-border)'}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                  style={{ transition: 'all 0.15s' }}
                />
              ))}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>
              {rating === 0 ? 'Select a rating' : ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title/Summary (Optional)</label>
            <input type="text" className="form-control" placeholder="e.g. Great product!" />
          </div>

          <div className="form-group">
            <label className="form-label">Your Review</label>
            <textarea
              className="form-control" rows={4} style={{ resize: 'vertical' }}
              placeholder="What did you like or dislike? What should other shoppers know?"
              value={comment} onChange={e => setComment(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Add a Photo (Optional)</span>
              {uploading && <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Uploading...</span>}
            </label>
            {!reviewImage ? (
              <div style={{ border: '2px dashed var(--color-border)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: 'var(--color-bg-alt)', transition: 'border-color 0.2s', position: 'relative' }}>
                <input type="file" onChange={uploadFileHandler} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} accept="image/*" />
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary)' }}>Click to upload</span> or drag and drop
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={reviewImage} alt="Review attachment" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--color-border)' }} />
                <button type="button" onClick={() => setReviewImage('')}
                  style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--color-danger)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-outline btn-block" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-block" disabled={rating === 0 || !comment.trim() || submitting || uploading}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Order Card ─── */
const OrderCard = ({ order, userInfo, onRefresh }) => {
  const status = getOrderStatus(order);
  const { color, bg, label, icon } = STATUS_CONFIG[status];
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedKeys, setReviewedKeys] = useState(new Set());
  const [checkingReviews, setCheckingReviews] = useState(false);

  useEffect(() => {
    if (!order.isDelivered || !userInfo) return;
    const checkReviewed = async () => {
      setCheckingReviews(true);
      const keys = new Set();
      await Promise.all(
        (order.orderItems || []).map(async (item) => {
          try {
            const res = await fetch(`/api/products/${item.product}`);
            const data = await res.json();
            const alreadyReviewed = data.reviews?.some(
              (r) => (r.user === userInfo._id || r.user === userInfo._id?.toString())
                     && r.orderId === order._id
            );
            if (alreadyReviewed) keys.add(`${order._id}:${item.product}`);
          } catch { /* ignore */ }
        })
      );
      setReviewedKeys(keys);
      setCheckingReviews(false);
    };
    checkReviewed();
  }, [order, userInfo]);

  const totalItems = order.orderItems?.length || 0;
  const allReviewed = totalItems > 0 && reviewedKeys.size >= totalItems;

  const handleReviewSuccess = (productId) => {
    setReviewTarget(null);
    setReviewedKeys(prev => new Set([...prev, `${order._id}:${productId}`]));
    if (onRefresh) onRefresh();
  };

  const handleRequestReturn = async (orderId, reason) => {
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ orderId, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit return request');
      alert('Return request submitted successfully. Our team will review it shortly.');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Order ID</div>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.01em' }}>#{order._id.slice(-8).toUpperCase()}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{order.createdAt?.substring(0, 10)}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>
            {icon} {label}
          </span>
          <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--color-primary)' }}>
            PKR {order.totalPrice?.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 1.25rem 1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {order.orderItems?.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'var(--color-bg-alt)', borderRadius: '8px', padding: '0.3rem 0.625rem' }}>
            <img src={item.image} alt={item.name} style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-alt)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {order.isPaid || order.paymentMethod === 'Credit Card'
            ? <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Paid</span>
            : <span style={{ color: 'var(--color-warning)' }}>⏳ Payment Pending</span>
          }
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {order.isDelivered && (
            <button
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
              onClick={() => {
                const reason = window.prompt('Please enter a reason for returning this order:');
                if (reason && reason.trim()) handleRequestReturn(order._id, reason.trim());
              }}
            >
              Request Return
            </button>
          )}

          {order.isDelivered && allReviewed && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <CheckCircle size={13} /> All Reviewed
            </span>
          )}
        </div>
      </div>

      {order.isDelivered && (
        <div className="fade-in" style={{ padding: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
          {checkingReviews ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0.5rem' }}>Checking review status...</div>
          ) : (
            <>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.875rem' }}>
                {allReviewed ? '✓ You have reviewed all items in this order.' : 'Rate your purchased items:'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {order.orderItems?.map((item, i) => {
                  const reviewKey = `${order._id}:${item.product}`;
                  const alreadyReviewed = reviewedKeys.has(reviewKey);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--color-bg-alt)', borderRadius: '12px', border: `1px solid ${alreadyReviewed ? 'var(--color-success)' : 'var(--color-border)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
                        <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', background: 'var(--color-surface)', padding: '3px', flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Qty: {item.qty}</div>
                        </div>
                      </div>

                      {alreadyReviewed ? (
                        <span style={{ flexShrink: 0, marginLeft: '1rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={14} /> Reviewed
                        </span>
                      ) : (
                        <button className="btn btn-sm btn-primary" style={{ flexShrink: 0, marginLeft: '1rem', fontSize: '0.8125rem' }} onClick={() => setReviewTarget(item)}>
                          <Star size={12} /> Write Review
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          orderId={order._id}
          userInfo={userInfo}
          onClose={() => setReviewTarget(null)}
          onSuccess={() => handleReviewSuccess(reviewTarget.product)}
        />
      )}
    </div>
  );
};

/* ─── Profile Page ─── */
const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'addresses'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo, updateUserInfo } = useUserStore();
  const navigate = useNavigate();

  // Address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCountry, setNewCountry] = useState('Pakistan');
  const [newPhone, setNewPhone] = useState('');

  const fetchMyOrders = useCallback(async () => {
    if (!userInfo) return;
    try {
      const res = await fetch('/api/orders/mine', { headers: { Authorization: `Bearer ${userInfo.token}` } });
      const data = await res.json();
      setOrders(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [userInfo]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/users/profile', { headers: { Authorization: `Bearer ${userInfo.token}` } });
      const data = await res.json();
      updateUserInfo({ ...userInfo, addresses: data.addresses });
    } catch { /* ignore */ }
  }, [userInfo, updateUserInfo]);

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }
    fetchMyOrders();
    fetchProfile();
  }, [userInfo?.token, navigate, fetchMyOrders, fetchProfile]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ label: newLabel, address: newAddress, city: newCity, postalCode: newPostalCode, country: newCountry, phone: newPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      updateUserInfo({ ...userInfo, addresses: data });
      setShowAddForm(false);
      setNewLabel('Home'); setNewAddress(''); setNewCity(''); setNewPostalCode(''); setNewPhone('');
    } catch (err) { alert('Failed to add address'); }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const res = await fetch(`/api/users/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      updateUserInfo({ ...userInfo, addresses: data });
    } catch (err) { alert('Failed to delete address'); }
  };

  if (!userInfo) return null;

  const activeOrders = orders.filter(o => !o.isDelivered);
  const pastOrders = orders.filter(o => o.isDelivered);

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>My Account</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar */}
        <div>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.875rem' }}>
                {userInfo?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.25rem' }}>{userInfo?.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{userInfo?.email}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button
                onClick={() => setActiveTab('orders')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: activeTab === 'orders' ? 'var(--color-primary-light)' : 'transparent', border: 'none', color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
              >
                <Package size={18} /> My Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', background: activeTab === 'addresses' ? 'var(--color-primary-light)' : 'transparent', border: 'none', color: activeTab === 'addresses' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left' }}
              >
                <MapPin size={18} /> Address Book
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div>
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="fade-in">
              {loading ? (
                <div className="loader" />
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
                  <h3 style={{ marginBottom: '0.75rem' }}>No orders yet</h3>
                  <p style={{ marginBottom: '1.5rem' }}>Start shopping and your orders will appear here.</p>
                  <Link to="/"><button className="btn btn-primary">Browse Products</button></Link>
                </div>
              ) : (
                <>
                  {activeOrders.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} style={{ color: 'var(--color-warning)' }} /> Active Orders
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeOrders.map(order => <OrderCard key={order._id} order={order} userInfo={userInfo} onRefresh={fetchMyOrders} />)}
                      </div>
                    </div>
                  )}
                  {pastOrders.length > 0 && (
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={18} style={{ color: 'var(--color-success)' }} /> Delivered Orders
                      </h3>
                      <p style={{ fontSize: '0.875rem', margin: '0 0 1rem', color: 'var(--color-text-muted)' }}>
                        Click <strong>Leave Reviews</strong> on any delivered order to rate your purchased items.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {pastOrders.map(order => <OrderCard key={order._id} order={order} userInfo={userInfo} onRefresh={fetchMyOrders} />)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Saved Addresses</h3>
                {!showAddForm && (
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Add New
                  </button>
                )}
              </div>

              {showAddForm && (
                <div className="fade-in" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 1.25rem' }}>Add New Address</h4>
                  <form onSubmit={handleAddAddress}>
                    <div className="form-group">
                      <label className="form-label">Label (e.g., Home, Office)</label>
                      <input type="text" className="form-control" value={newLabel} onChange={e => setNewLabel(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number (with country code)</label>
                      <input type="tel" className="form-control" placeholder="+92 300 1234567" value={newPhone} onChange={e => setNewPhone(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Street Address</label>
                      <input type="text" className="form-control" value={newAddress} onChange={e => setNewAddress(e.target.value)} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input type="text" className="form-control" value={newCity} onChange={e => setNewCity(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Postal Code</label>
                        <input type="text" className="form-control" value={newPostalCode} onChange={e => setNewPostalCode(e.target.value)} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input type="text" className="form-control" value={newCountry} onChange={e => setNewCountry(e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary">Save Address</button>
                    </div>
                  </form>
                </div>
              )}

              {userInfo?.addresses?.length === 0 ? (
                !showAddForm && <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-xl)', color: 'var(--color-text-muted)' }}>No saved addresses.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  {userInfo?.addresses?.map(addr => (
                    <div key={addr._id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', position: 'relative' }}>
                      <button 
                        onClick={() => handleDeleteAddress(addr._id)}
                        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'var(--color-bg-alt)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                        {addr.label}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{addr.phone || 'No phone added'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        {addr.address}<br />
                        {addr.city}, {addr.postalCode}<br />
                        {addr.country}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;