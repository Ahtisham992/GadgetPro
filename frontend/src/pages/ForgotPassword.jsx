import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="fade-in" style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 style={{ marginBottom: '0.875rem' }}>Check your email</h2>
          <p style={{ marginBottom: '0.5rem' }}>
            We've sent a password reset link to:
          </p>
          <p style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '2rem', fontSize: '1rem' }}>{email}</p>
          <div style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', margin: '0 0 0.5rem', fontWeight: 600, color: 'var(--color-text)' }}>Didn't receive the email?</p>
            <ul style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
              <li>Check your spam / junk folder</li>
              <li>Make sure you entered the right email</li>
              <li>The link expires in 15 minutes</li>
            </ul>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="btn btn-outline btn-block"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Try a different email
            </button>
            <Link to="/login" className="btn btn-primary btn-block">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-bg)' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        {/* Card */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Icon */}
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Mail size={26} style={{ color: 'var(--color-primary)' }} />
          </div>

          <h2 style={{ marginBottom: '0.5rem' }}>Forgot your password?</h2>
          <p style={{ marginBottom: '2rem' }}>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>

          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
              style={{ marginTop: '0.25rem' }}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>

          <Link
            to="/login"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <ArrowLeft size={15} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;