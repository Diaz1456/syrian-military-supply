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
      if (data.forcePasswordChange) navigate('/admin/change-password');
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
        <h1>Command Access</h1>
        <p className="hint">Restricted sector — authorized personnel only.</p>

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
            {busy ? 'Verifying credentials…' : 'Authenticate'}
          </button>
        </form>

        <p className="muted mt-16" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
          Default: <code>admin</code> / <code>changeme123</code> — you'll be forced to change it.
        </p>
        <Link to="/" className="muted" style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: '0.85rem' }}>
          ← Back to public site
        </Link>
      </div>
    </div>
  );
}