import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strengthChecks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains uppercase letter', pass: /[A-Z]/.test(password) },
  ];
  const strengthScore = strengthChecks.filter(c => c.pass).length;
  const strengthColors = ['var(--color-danger)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-success)'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed. The link may have expired.');
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="fade-in" style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} style={{ color: 'var(--color-success)' }} />
          </div>
          <h2 style={{ marginBottom: '0.875rem' }}>Password reset!</h2>
          <p style={{ marginBottom: '2rem' }}>Your password has been updated successfully. Redirecting you to sign in...</p>
          <Link to="/login" className="btn btn-primary btn-block btn-lg">Sign In Now</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--color-bg)' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
          {/* Icon */}
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <KeyRound size={26} style={{ color: 'var(--color-primary)' }} />
          </div>

          <h2 style={{ marginBottom: '0.5rem' }}>Set new password</h2>
          <p style={{ marginBottom: '2rem' }}>
            Choose a strong password that you haven't used before.
          </p>

          {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}

          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strengthScore ? strengthColors[strengthScore] : 'var(--color-border)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: strengthColors[strengthScore] }}>
                    {strengthLabels[strengthScore]}
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {strengthChecks.map(({ label, pass }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: pass ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                        <span>{pass ? '✓' : '○'}</span> {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="password-input-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  style={{ borderColor: confirmPassword && confirmPassword !== password ? 'var(--color-danger)' : undefined }}
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginTop: '0.375rem', fontWeight: 500 }}>Passwords don't match</div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || (confirmPassword && confirmPassword !== password)}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', marginTop: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;