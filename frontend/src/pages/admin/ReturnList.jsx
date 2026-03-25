import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import { useToast } from '../../context/ToastContext';

const ReturnList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchReturns = async () => {
    try {
      const res = await fetch('/api/returns', { headers: { Authorization: `Bearer ${userInfo.token}` } });
      const data = await res.json();
      setReturns(Array.isArray(data) ? data : []);
    } catch { setReturns([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!userInfo?.isAdmin) { navigate('/login'); return; }
    fetchReturns();
  }, [userInfo]);

  const handleUpdate = async (id, status, adminNote) => {
    try {
      const res = await fetch(`/api/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ status, adminNote }),
      });
      if (!res.ok) throw new Error();
      toast(status === 'approved' ? 'Return approved' : 'Return rejected', status === 'approved' ? 'success' : 'warning');
      fetchReturns();
    } catch { toast('Failed to update', 'error'); }
  };

  const filtered = filter === 'all' ? returns : returns.filter(r => r.status === filter);

  const STATUS_BADGE = {
    pending:  { bg: '#FFFBEB', color: '#92400E', label: 'Pending' },
    approved: { bg: 'var(--color-success-bg)', color: 'var(--color-success)', label: 'Approved' },
    rejected: { bg: '#FFF1F2', color: '#9F1239', label: 'Rejected' },
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Return Requests</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ padding: '0.375rem 0.875rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'inherit', background: filter === f ? 'var(--color-primary)' : 'var(--color-bg-alt)', color: filter === f ? '#fff' : 'var(--color-text-muted)', transition: 'all 0.15s' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(r => {
          const { bg, color, label } = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
          return (
            <div key={r._id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{r.user?.name}</span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>{r.user?.email}</span>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>{label}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                    Order: <strong>#{r.order?._id?.slice(-8).toUpperCase()}</strong> &bull; PKR {r.order?.totalPrice?.toLocaleString()} &bull; {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontStyle: 'italic' }}>
                    "{r.reason}"
                  </div>
                  {r.adminNote && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Admin note: {r.adminNote}
                    </div>
                  )}
                </div>

                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm" style={{ background: '#16A34A', color: '#fff', border: 'none' }} onClick={() => handleUpdate(r._id, 'approved', 'Approved by admin')}>
                      Approve
                    </button>
                    <button className="btn btn-sm btn-outline" style={{ color: '#EF4444', borderColor: '#EF4444' }} onClick={() => handleUpdate(r._id, 'rejected', 'Rejected by admin')}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
            No {filter !== 'all' ? filter : ''} return requests.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnList;
