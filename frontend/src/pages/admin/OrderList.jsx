import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import { Filter } from 'lucide-react';

const STATUS_FILTERS = ['All', 'New Orders', 'Pending Delivery', 'Completed'];

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const userInfo = useUserStore((state) => state.userInfo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) { navigate('/login'); return; }
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${userInfo.token}` } });
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [userInfo, navigate]);

  const isCompleted = (order) => order.isDelivered && (order.isPaid || order.paymentMethod === 'Credit Card');

  const filtered = orders.filter(order => {
    if (search) {
      const q = search.toLowerCase();
      const matchId = order._id.toLowerCase().includes(q);
      const matchUser = order.user?.name?.toLowerCase().includes(q);
      if (!matchId && !matchUser) return false;
    }
    if (filter === 'All') return true;
    if (filter === 'New Orders') return !order.isAccepted;
    if (filter === 'Pending Delivery') return order.isAccepted && !order.isDelivered;
    if (filter === 'Completed') return isCompleted(order);
    return true;
  });

  const countFor = (f) => orders.filter(o => {
    if (f === 'New Orders') return !o.isAccepted;
    if (f === 'Pending Delivery') return o.isAccepted && !o.isDelivered;
    if (f === 'Completed') return isCompleted(o);
    return true;
  }).length;

  const getStatusBadge = (order) => {
    if (isCompleted(order)) return { label: 'Completed', bg: 'var(--color-success-bg)', color: 'var(--color-success)' };
    if (order.isDelivered) return { label: 'Delivered', bg: '#EFF6FF', color: 'var(--color-info)' };
    if (order.isAccepted) return { label: 'Pending Delivery', bg: '#FFF7ED', color: '#EA580C' };
    return { label: 'New Order', bg: '#FFFBEB', color: 'var(--color-warning)' };
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Orders Dashboard</h2>
          <input 
            type="text"
            className="form-control"
            placeholder="Search by ID or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '250px' }}
          />
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {filtered.length} of {orders.length} orders
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', width: 'fit-content', border: '1px solid var(--color-border)' }}>
        <Filter size={16} style={{ alignSelf: 'center', marginLeft: '0.25rem', color: 'var(--color-text-muted)' }} />
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.8125rem',
              fontFamily: 'inherit',
              background: filter === f ? 'var(--color-primary)' : 'transparent',
              color: filter === f ? '#fff' : 'var(--color-text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {f}
            {f !== 'All' && (
              <span style={{ marginLeft: '0.375rem', opacity: 0.75 }}>
                ({countFor(f)})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>ORDER ID</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>CUSTOMER</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>DATE</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TOTAL</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>STATUS</th>
              <th style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const { label, bg, color } = getStatusBadge(order);
              return (
                <tr key={order._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-alt)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{order.user?.name || '—'}</td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{order.createdAt?.substring(0, 10)}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>PKR {order.totalPrice?.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.625rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>
                      {label}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No {filter !== 'All' ? filter.toLowerCase() : ''} orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderList;
