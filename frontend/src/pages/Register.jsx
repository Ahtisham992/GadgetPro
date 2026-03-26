import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useUserStore from '../store/userStore';
import { ShieldCheck, Mail, ArrowLeft, RefreshCw } from 'lucide-react';

const COUNTRY_CODES = ['+1', '+44', '+92', '+91', '+971', '+966', '+61', '+49', '+33', '+81'];

const Register = () => {
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useUserStore();
  const navigate = useNavigate();

  // Step 1 — Submit registration, trigger OTP email
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 6) return setError('Password must be at least 6 characters');
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
      setSuccess('A 6-digit verification code has been sent to your inbox!');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify the OTP, complete login
  const verifyHandler = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Please enter the full 6-digit code');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP — re-run registration to get new OTP
  const resendOtp = async () => {
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not resend OTP');
      setSuccess('New code sent! Check your inbox.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const DarkPanel = () => (
    <div style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '3rem', position: 'relative', overflow: 'hidden', order: -1,
    }}>
      <div style={{ position: 'absolute', top: '10%', left: '-60px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)', borderRadius: '50%' }} />
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>{step === 1 ? '🚀' : '📬'}</div>
        <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          {step === 1 ? <>Join 10,000+<br />Happy Shoppers</> : <>Check Your<br />Email</>}
        </h2>
        <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.7, maxWidth: '300px', margin: '0 auto 2rem' }}>
          {step === 1
            ? "Create your free account and start exploring Pakistan's largest premium gadget store."
            : `We sent a 6-digit code to ${email}. Enter it to verify your identity and activate your account.`}
        </p>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '280px', margin: '0 auto' }}>
            {['✓  Exclusive member-only deals', '✓  Order history & tracking', '✓  Priority customer support'].map(t => (
              <div key={t} style={{ color: '#94A3B8', fontSize: '0.875rem', textAlign: 'left' }}>{t}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 120px)' }}>
      <DarkPanel />

      {/* Form Panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', background: 'var(--color-surface)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }} className="fade-in">

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <>
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
                  <input type="password" className="form-control" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm password</label>
                  <input type="password" className="form-control" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
                  {loading ? 'Sending Code...' : 'Continue'}
                </button>
              </form>

              <p style={{ textAlign: 'center', marginTop: '1.75rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in</Link>
              </p>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <button
                onClick={() => { setStep(1); setError(''); setOtp(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.875rem', fontFamily: 'inherit', padding: '0', marginBottom: '2rem' }}
              >
                <ArrowLeft size={14} /> Back to Edit Info
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <ShieldCheck size={24} style={{ color: 'var(--color-primary)' }} />
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Verify your email</h2>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  We sent a 6-digit code to <strong style={{ color: 'var(--color-text)' }}>{email}</strong>
                </p>
              </div>

              {error && <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>{error}</div>}
              {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

              <form onSubmit={verifyHandler}>
                <div className="form-group">
                  <label className="form-label">Verification code</label>
                  <input
                    id="otp-input"
                    type="text"
                    className="form-control"
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    style={{ textAlign: 'center', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '0.35em' }}
                    required
                    autoFocus
                  />
                  <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Expires in 10 minutes
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading || otp.length !== 6} style={{ marginTop: '0.5rem' }}>
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Didn't get a code?{' '}
                <button
                  onClick={resendOtp}
                  disabled={resending}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                >
                  {resending ? <><RefreshCw size={12} /> Sending...</> : 'Resend'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
