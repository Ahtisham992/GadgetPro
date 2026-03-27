import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useUserStore from '../store/userStore';
import { CreditCard, Truck, MapPin, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');

  const navigate = useNavigate();
  const cartItems = useCartStore(s => s.cartItems);
  const userInfo = useUserStore(s => s.userInfo);

  // Guard: redirect unauthenticated users
  if (!userInfo) return <Navigate to="/login" replace />;

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountAmount = appliedCoupon ? Math.round((itemsPrice * appliedCoupon.discountPercent) / 100) : 0;
  const discountedItemsPrice = itemsPrice - discountAmount;
  const shippingPrice = discountedItemsPrice > 100000 ? 0 : 1500;
  const taxPrice = Number((0.15 * discountedItemsPrice).toFixed(0));
  const totalPrice = discountedItemsPrice + shippingPrice + taxPrice;

  const applyCouponHandler = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAppliedCoupon(data);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (paymentMethod === 'Credit Card' && (!cardNumber || !expiry || !cvc)) {
      setError('Please provide complete credit card details.');
      setLoading(false);
      return;
    }
    try {
      if (saveAddress && addressLabel.trim()) {
        try {
          await fetch('/api/users/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
            body: JSON.stringify({ label: addressLabel, address, city, postalCode, country, phone })
          });
        } catch (err) {
          console.warn('Silent address save fail:', err);
        }
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({
          orderItems: cartItems,
          shippingAddress: { address, city, postalCode, country, phone },
          paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice,
          discountAmount, couponCode: appliedCoupon?.code
        }),
      });
      if (!res.ok) throw new Error('Order could not be placed');
      const createdOrder = await res.json();
      if (paymentMethod === 'Credit Card') {
        await fetch(`/api/orders/${createdOrder._id}/pay`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: 'mock_card', status: 'COMPLETED', update_time: Date.now().toString(), email_address: userInfo.email }),
        });
      }
      localStorage.removeItem('cartItems');
      useCartStore.setState({ cartItems: [] });
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--color-success-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
        </div>
        <h2 style={{ marginBottom: '0.75rem' }}>Order Placed Successfully!</h2>
        <p style={{ maxWidth: '400px' }}>Thank you for shopping at GadgetPro. Your order has been confirmed and is being processed. Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '2.5rem 1.5rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Checkout</h2>

      <div className="sidebar-layout">
        {/* Form */}
        <form onSubmit={placeOrderHandler}>
          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          {/* Shipping */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--color-primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <MapPin size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>Shipping Address</h3>
            </div>
            
            {userInfo?.addresses?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Use a Saved Address</label>
                <select 
                  className="form-control" 
                  onChange={(e) => {
                    const selected = userInfo.addresses.find(a => a._id === e.target.value);
                    if (selected) {
                      setAddress(selected.address); setCity(selected.city);
                      setPostalCode(selected.postalCode); setCountry(selected.country);
                      setPhone(selected.phone || '');
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select an address...</option>
                  {userInfo.addresses.map(addr => (
                    <option key={addr._id} value={addr._id}>{addr.label} — {addr.address}, {addr.city}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input type="text" className="form-control" placeholder="e.g. House 12, Block B, Gulshan" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number (with Country Code)</label>
              <input type="tel" className="form-control" placeholder="+92 300 1234567" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input type="text" className="form-control" placeholder="Karachi" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Postal Code</label>
                <input type="text" className="form-control" placeholder="75300" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1rem', marginBottom: 0 }}>
              <label className="form-label">Country</label>
              <input type="text" className="form-control" value={country} onChange={e => setCountry(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', marginBottom: saveAddress ? '1rem' : 0 }}>
              <input type="checkbox" id="saveAddr" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)} style={{ cursor: 'pointer' }} />
              <label htmlFor="saveAddr" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', color: 'var(--color-text)' }}>Save this address to my Address Book</label>
            </div>
            {saveAddress && (
              <div className="form-group" style={{ marginBottom: 0, marginTop: '0.5rem' }}>
                 <label className="form-label">Save as (e.g., Home, Office)</label>
                 <input type="text" className="form-control" placeholder="Home" value={addressLabel} onChange={e => setAddressLabel(e.target.value)} required={saveAddress} />
              </div>
            )}
          </div>

          {/* Payment */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--color-primary-light)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                <CreditCard size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>Payment Method</h3>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['Credit Card', 'Cash On Delivery'].map(method => (
                <label key={method} style={{
                  flex: 1, border: `2px solid ${paymentMethod === method ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-lg)', padding: '1rem',
                  cursor: 'pointer', background: paymentMethod === method ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'all 0.15s',
                }}>
                  <input type="radio" value={method} checked={paymentMethod === method} onChange={e => setPaymentMethod(e.target.value)} style={{ marginRight: '0.625rem' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: paymentMethod === method ? 'var(--color-primary)' : 'var(--color-text)' }}>
                    {method === 'Credit Card' ? '💳 Credit Card' : '💵 Cash on Delivery'}
                  </span>
                </label>
              ))}
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="fade-in" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Card Number</label>
                  <input type="text" className="form-control" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                </div>
                <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input type="text" className="form-control" placeholder="12/27" value={expiry} onChange={e => setExpiry(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">CVC</label>
                    <input type="text" className="form-control" placeholder="123" value={cvc} onChange={e => setCvc(e.target.value)} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || cartItems.length === 0} style={{ marginTop: '1.5rem' }}>
            {loading ? 'Processing...' : paymentMethod === 'Credit Card' ? 'Pay & Place Order' : 'Place Order'}
          </button>
        </form>

        {/* Summary */}
        <div className="checkout-summary" style={{ position: 'relative' }}>
          <style>{`
            @media (min-width: 1025px) {
              .checkout-summary { position: sticky !important; top: 90px !important; }
            }
          `}</style>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
            <h3 style={{ marginBottom: '1.375rem', fontSize: '1.0625rem' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {cartItems.map((item, i) => (
                <div key={item.product || item._id || i} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name} <span style={{ color: 'var(--color-text-light)' }}>×{item.qty}</span>
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', flexShrink: 0 }}>PKR {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }} />
            {[
              { label: 'Subtotal', val: `PKR ${itemsPrice.toLocaleString()}` },
              ...(appliedCoupon ? [{ label: `Discount (${appliedCoupon.discountPercent}%)`, val: `-PKR ${discountAmount.toLocaleString()}`, color: 'var(--color-success)' }] : []),
              { label: 'Shipping', val: shippingPrice === 0 ? 'Free' : `PKR ${shippingPrice.toLocaleString()}` },
              { label: 'Tax (15%)', val: `PKR ${taxPrice.toLocaleString()}` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.625rem', color: row.color || 'var(--color-text-muted)' }}>
                <span>{row.label}</span>
                <span style={{ color: row.color || 'var(--color-text)', fontWeight: row.color ? 700 : 500 }}>{row.val}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: '1.1875rem', color: 'var(--color-primary)' }}>PKR {totalPrice.toLocaleString()}</span>
            </div>

            {/* Coupon Code Section */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Have a coupon code?</div>
              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-success-bg)', padding: '0.625rem', borderRadius: '8px', border: '1px solid var(--color-success)' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-success)' }}>✓ Applied: {appliedCoupon.code}</span>
                  <button type="button" onClick={() => setAppliedCoupon(null)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="form-control" placeholder="Enter code" value={couponInput} onChange={e => setCouponInput(e.target.value)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }} />
                    <button type="button" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={applyCouponHandler} disabled={applyingCoupon || !couponInput}>
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <div style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: '0.375rem' }}>{couponError}</div>}
                </>
              )}
            </div>

            {shippingPrice === 0 && (
              <div style={{ marginTop: '1rem', background: 'var(--color-success-bg)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#065F46', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Truck size={13} /> Free shipping applied!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
