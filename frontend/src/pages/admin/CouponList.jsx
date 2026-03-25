import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/userStore';
import { useToast } from '../../context/ToastContext';
import { Trash2, Plus } from 'lucide-react';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discountPercent: 10, isActive: true, expiresAt: '', usageLimit: 0 });
  const [saving, setSaving] = useState(false);
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const toast = useToast();

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons', { headers: { Authorization: `Bearer ${userInfo.token}` } });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch { setCoupons([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!userInfo?.isAdmin) { navigate('/login'); return; }
    fetchCoupons();
  }, [userInfo]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      toast('Coupon created!', 'success');
      setShowForm(false);
      setForm({ code: '', discountPercent: 10, isActive: true, expiresAt: '', usageLimit: 0 });
      fetchCoupons();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${userInfo.token}` } });
      toast('Coupon deleted', 'info');
      fetchCoupons();
    } catch { toast('Failed to delete', 'error'); }
  };

  const toggleActive = async (coupon) => {
    try {
      await fetch(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      fetchCoupons();
    } catch { toast('Failed to update', 'error'); }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Coupon Codes</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create Coupon</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Code (e.g. SAVE20)</label>
              <input className="form-control" value={form.code} onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))} required placeholder="PROMO10" />
            </div>
            <div className="form-group">
              <label className="form-label">Discount %</label>
              <input type="number" className="form-control" value={form.discountPercent} min={1} max={100} onChange={e => setForm(p => ({...p, discountPercent: Number(e.target.value)}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Expires At (optional)</label>
              <input type="date" className="form-control" value={form.expiresAt} onChange={e => setForm(p => ({...p, expiresAt: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Usage Limit (0 = unlimited)</label>
              <input type="number" className="form-control" value={form.usageLimit} min={0} onChange={e => setForm(p => ({...p, usageLimit: Number(e.target.value)}))} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({...p, isActive: e.target.checked}))} />
                Active
              </label>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-alt)' }}>
              {['CODE', 'DISCOUNT', 'USED', 'LIMIT', 'EXPIRES', 'STATUS', 'ACTIONS'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>{c.code}</td>
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>{c.discountPercent}%</td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)' }}>{c.usedCount}</td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)' }}>{c.usageLimit === 0 ? '∞' : c.usageLimit}</td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—'}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span
                    style={{ cursor: 'pointer', padding: '0.2rem 0.625rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: c.isActive ? 'var(--color-success-bg)' : '#f3f4f6', color: c.isActive ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                    onClick={() => toggleActive(c)}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <button onClick={() => handleDelete(c._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '0.25rem' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No coupons yet. Create your first one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponList;
