import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useUserStore from '../../store/userStore';

const OrderInvoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const userInfo = useUserStore((state) => state.userInfo);

  useEffect(() => {
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
    fetchOrder();
  }, [id, userInfo]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading invoice...</div>;
  if (!order) return <div style={{ padding: '2rem', textAlign: 'center' }}>Order not found.</div>;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <style>
        {`
          @media print {
            body { background: #fff; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .invoice-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; }
          }
        `}
      </style>

      {/* Action Bar */}
      <div className="no-print" style={{ maxWidth: '800px', margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <Link to={`/admin/orders/${id}`} className="btn btn-outline">← Back to Order</Link>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ Print Invoice</button>
      </div>

      {/* Invoice Document */}
      <div className="invoice-container" style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #f3f4f6', paddingBottom: '2rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: '0', fontSize: '2rem', color: '#f97316', fontWeight: 900, letterSpacing: '-0.02em' }}>GadgetPro</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>The Ultimate Tech Store</p>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>hello@gadgetpro.com | +92 300 0000000</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: '#111827' }}>INVOICE</h2>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}><strong>Order ID:</strong> #{order._id.slice(-8).toUpperCase()}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}><strong>Payment:</strong> {order.paymentMethod} {order.isPaid ? '(PAID)' : '(COD - PENDING)'}</div>
          </div>
        </div>

        {/* Addresses */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div style={{ width: '48%' }}>
            <h3 style={{ fontSize: '1rem', color: '#111827', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billed To:</h3>
            <p style={{ margin: '0 0 0.25rem', color: '#4b5563', fontWeight: 600 }}>{order.user.name}</p>
            <p style={{ margin: '0 0 0.25rem', color: '#4b5563' }}>{order.user.email}</p>
          </div>
          <div style={{ width: '48%' }}>
            <h3 style={{ fontSize: '1rem', color: '#111827', margin: '0 0 0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ship To:</h3>
            <p style={{ margin: '0 0 0.25rem', color: '#4b5563', fontWeight: 600 }}>{order.user.name}</p>
            <p style={{ margin: '0 0 0.25rem', color: '#4b5563' }}>{order.shippingAddress.address}</p>
            <p style={{ margin: '0 0 0.25rem', color: '#4b5563' }}>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p style={{ margin: '0 0 0.25rem', color: '#4b5563' }}>{order.shippingAddress.country}</p>
            <p style={{ margin: '0.5rem 0 0', color: '#111827', fontWeight: 700 }}>Phone: {order.shippingAddress.phone || 'N/A'}</p>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#374151', fontSize: '0.875rem' }}>Item</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#374151', fontSize: '0.875rem' }}>Qty</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#374151', fontSize: '0.875rem' }}>Unit Price</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#374151', fontSize: '0.875rem' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem', color: '#111827', fontSize: '0.875rem' }}>{item.name}</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#4b5563', fontSize: '0.875rem' }}>{item.qty}</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#4b5563', fontSize: '0.875rem' }}>PKR {item.price.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: '#111827', fontWeight: 600, fontSize: '0.875rem' }}>PKR {(item.price * item.qty).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
              <span>Subtotal:</span>
              <span>PKR {(order.totalPrice - order.shippingPrice - order.taxPrice).toLocaleString()}</span>
            </div>
            {order.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#16a34a', fontSize: '0.875rem' }}>
                <span>Discount:</span>
                <span>-PKR {order.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#4b5563', fontSize: '0.875rem' }}>
              <span>Shipping:</span>
              <span>PKR {order.shippingPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#4b5563', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
              <span>Tax (15%):</span>
              <span>PKR {order.taxPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0 0', color: '#111827', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Total:</span>
              <span style={{ color: '#f97316' }}>PKR {order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '4rem', paddingTop: '1.5rem', borderTop: '2px solid #f3f4f6', textAlign: 'center', color: '#6b7280', fontSize: '0.8125rem' }}>
          Thank you for shopping at GadgetPro!<br/>
          If you have any questions concerning this invoice, contact our support team at hello@gadgetpro.com.
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;
