import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await login(username, password);
      if (data?.admin?.forcePasswordChange) navigate('/admin/change-password');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="brand" style={{ justifyContent: 'center' }}>
          <span className="logo">⛨</span>
        </div>
        <h1>Admin Log In</h1>
        <p className="hint">Syrian Military Supply control panel.</p>

        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="field-error" style={{ marginBottom: 10 }}>{error}</div>}
          <button className="btn primary block" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="muted mt-16" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
          Default login: <code>admin</code> / <code>changeme123</code> — you'll be asked to change it.
        </p>
        <Link to="/" className="muted" style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: '0.85rem' }}>
          › Back to store
        </Link>
      </div>
    </div>
  );
}