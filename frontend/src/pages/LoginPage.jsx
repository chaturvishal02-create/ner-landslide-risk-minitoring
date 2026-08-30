import { useState } from 'react';

const DEMO_EMAIL = 'admin@landslide.ai';
const DEMO_PASSWORD = 'demo123';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate auth
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      onLogin({ name: 'Administrator', email });
    } else {
      setError('Invalid credentials. Use Demo Login below.');
    }
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    await new Promise(r => setTimeout(r, 600));
    onLogin({ name: 'Administrator', email: DEMO_EMAIL });
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-bg-glow" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏔</div>
          <h1 className="login-title">LandslideAI</h1>
          <p className="login-subtitle">AI-Based Early Warning System — North Eastern India</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>SIH Problem Statement 26001</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="admin@landslide.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary login-btn-full"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">or</div>

        <button
          id="demo-login-btn"
          className="btn login-demo-btn"
          onClick={handleDemoLogin}
          disabled={loading}
        >
          ⚡ Demo Login (admin@landslide.ai / demo123)
        </button>

        <div style={{ marginTop: 24, padding: '14px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>DEMO SYSTEM</strong><br/>
            This system uses synthetic/demo data for hackathon demonstration.<br/>
            Not for real-world operational deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
