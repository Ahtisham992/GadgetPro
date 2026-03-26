import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';

/* ─── tiny Google button component ─── */
const GoogleSignInButton = ({ onSuccess, onError }) => {
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return; // skip if not configured

    // Load the GSI script once
    if (!document.getElementById('gsi-script')) {
      const script = document.createElement('script');
      script.id = 'gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const init = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const res = await fetch('/api/users/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
            onSuccess(data);
          } catch (err) {
            onError(err.message);
          }
        },
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-btn-login'),
        { theme: 'outline', size: 'large', width: 360, logo_alignment: 'center' }
      );
    };

    // Wait for script to load
    const interval = setInterval(() => { if (window.google) { init(); clearInterval(interval); } }, 200);
    return () => clearInterval(interval);
  }, [onSuccess, onError]);

  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        <span>or continue with</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      </div>
      <div id="google-btn-login" style={{ display: 'flex', justifyContent: 'center' }} />
    </div>
  );
};

/* ─── Login page ─── */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useUserStore();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data);
      navigate(data.isAdmin ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = useCallback((data) => {
    login(data);
    navigate(data.isAdmin ? '/admin' : '/');
  }, [login, navigate]);

  const handleGoogleError = useCallback((msg) => setError(msg), []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 120px)' }}>
      {/* Left: Form */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: 'var(--color-surface)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="fade-in">
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Welcome back</h2>
            <p style={{ margin: 0 }}>Sign in to your GadgetPro account</p>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input type="email" className="form-control" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Google Sign-In */}
          <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

          <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>

      {/* Right: Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)', borderRadius: '50%' }} />
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>🛍️</div>
          <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Your Premier<br />Tech Destination
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '300px', margin: '0 auto 2rem' }}>
            Access exclusive deals, track your orders, and explore the latest tech from top brands.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '280px', margin: '0 auto' }}>
            {['✓  Free shipping on 100K+ orders', '✓  Authentic product guarantee', '✓  30-day easy returns'].map(t => (
              <div key={t} style={{ color: '#94A3B8', fontSize: '0.875rem', textAlign: 'left' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;