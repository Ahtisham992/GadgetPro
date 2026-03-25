import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useUserStore();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 120px)' }}>
      {/* Right panel first (reversed order visually) */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
        order: -1,
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '-60px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🚀</div>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Join 10,000+<br />Happy Shoppers
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '300px', margin: '0 auto 2rem' }}>
            Create your free account today and start exploring Pakistan's largest premium gadget store.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '280px', margin: '0 auto' }}>
            {['✓  Exclusive member-only deals', '✓  Order history & tracking', '✓  Priority customer support'].map(t => (
              <div key={t} style={{ color: '#94A3B8', fontSize: '0.875rem', textAlign: 'left' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: 'var(--color-surface)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="fade-in">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Create account</h2>
            <p style={{ margin: 0 }}>Start shopping in under 2 minutes</p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input type="text" className="form-control" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm password</label>
              <input type="password" className="form-control" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
