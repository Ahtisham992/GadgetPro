import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useUserStore from '../../store/userStore';

const OrderManage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = useUserStore((state) => state.userInfo);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const acceptHandler = async () => {
    try {
      const res = await fetch(`/api/orders/${id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({})
      });
      if (res.ok) fetchOrder();
    } catch (err) { console.error(err); }
  };

  const deliverHandler = async () => {
    try {
      const res = await fetch(`/api/orders/${id}/deliver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({})
      });
      if (res.ok) fetchOrder();
    } catch (err) { console.error(err); }
  };

  const payHandler = async () => {
    try {
      const res = await fetch(`/api/orders/${id}/pay`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ status: 'MANUAL_CASH_PAID' })
      });
      if (res.ok) fetchOrder();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loader"></div>;
  if (!order) return <h2>Order not found</h2>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/admin/orders" className="btn btn-outline">Back to Orders</Link>
        {order.isAccepted && (
          <Link to={`/admin/orders/${order._id}/invoice`} target="_blank" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🖨️ Print Invoice
          </Link>
        )}
      </div>
      <h2 style={{ marginBottom: '2rem' }}>Order {order._id}</h2>

      <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Shipping</h3>
            <p><strong>Name: </strong> {order.user.name}</p>
            <p><strong>Email: </strong> {order.user.email}</p>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Address: </strong>
              {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
            <p style={{ marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              <strong>Phone: </strong> {order.shippingAddress.phone || 'Not Provided'}
            </p>
            {order.isDelivered ? (
              <div className="badge badge-success" style={{ padding: '1rem', display: 'block' }}>Delivered on {new Date(order.deliveredAt).toLocaleString()}</div>
            ) : (
              <div className="badge badge-danger" style={{ padding: '1rem', display: 'block' }}>Not Delivered</div>
            )}
          </div>

          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Payment Method</h3>
            <p style={{ marginBottom: '1rem' }}><strong>Method: </strong> {order.paymentMethod}</p>
            {order.isPaid || order.paymentMethod === 'Credit Card' ? (
              <div className="badge badge-success" style={{ padding: '1rem', display: 'block' }}>Paid on {new Date(order.paidAt || order.createdAt).toLocaleString()}</div>
            ) : (
              <div className="badge badge-danger" style={{ padding: '1rem', display: 'block' }}>Not Paid (Cash on Delivery)</div>
            )}
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Order Items</h3>
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center" style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} style={{ width: '50px', borderRadius: '4px' }} />
                  <Link to={`/product/${item.product}`} className="hover-text-primary">{item.name}</Link>
                </div>
                <div>
                  {item.qty} x PKR {item.price.toLocaleString()} = PKR {(item.qty * item.price).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>Order Summary</h3>
            {[
              { label: 'Items', val: `PKR ${(order.totalPrice - order.shippingPrice - order.taxPrice).toLocaleString()}` },
              { label: 'Shipping', val: `PKR ${order.shippingPrice.toLocaleString()}` },
              { label: 'Tax (15%)', val: `PKR ${order.taxPrice.toLocaleString()}` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                <span>{r.label}</span><span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1.75rem' }}>
              <span>Total</span><span style={{ color: 'var(--color-primary)' }}>PKR {order.totalPrice.toLocaleString()}</span>
            </div>

            {/* ── Step-wise Workflow ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Order Actions</div>

              {/* Step 1: Accept */}
              {order.isAccepted ? (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 600 }}>
                  ✓ Order Accepted — {new Date(order.acceptedAt).toLocaleDateString()}
                </div>
              ) : (
                <button className="btn btn-primary btn-block" onClick={acceptHandler}>
                  ✅ Accept Order
                </button>
              )}

              {/* Step 2: Deliver */}
              {order.isDelivered ? (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 600 }}>
                  ✓ Delivered — {new Date(order.deliveredAt).toLocaleDateString()}
                </div>
              ) : (
                <button
                  className="btn btn-block"
                  style={{ background: order.isAccepted ? 'var(--color-primary)' : 'var(--color-bg-alt)', color: order.isAccepted ? '#fff' : 'var(--color-text-muted)', border: '1px solid', borderColor: order.isAccepted ? 'var(--color-primary)' : 'var(--color-border)', cursor: order.isAccepted ? 'pointer' : 'not-allowed' }}
                  onClick={deliverHandler}
                  disabled={!order.isAccepted}
                >
                  {order.isAccepted ? '🚚 Mark as Delivered' : '🔒 Accept Order First'}
                </button>
              )}

              {/* Step 3: Pay (COD only) */}
              {order.paymentMethod !== 'Credit Card' && (
                order.isPaid ? (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 600 }}>
                    ✓ Paid — {new Date(order.paidAt).toLocaleDateString()}
                  </div>
                ) : (
                  <button
                    className="btn btn-block"
                    style={{ background: order.isDelivered ? '#16A34A' : 'var(--color-bg-alt)', color: order.isDelivered ? '#fff' : 'var(--color-text-muted)', border: '1px solid', borderColor: order.isDelivered ? '#16A34A' : 'var(--color-border)', cursor: order.isDelivered ? 'pointer' : 'not-allowed' }}
                    onClick={payHandler}
                    disabled={!order.isDelivered}
                  >
                    {order.isDelivered ? '💵 Mark as Paid (COD)' : '🔒 Deliver First'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManage;
