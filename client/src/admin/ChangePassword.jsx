import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const { admin, changePassword } = useAuth();
  const navigate = useNavigate();
  const mustChange = admin?.forcePasswordChange;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) return setError('New password must be at least 8 characters.');
    if (newPassword !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <>
        <div className="admin-topbar"><h1>Password Updated</h1></div>
        <div className="panel">
          <p style={{ color: 'var(--good)' }}>✔ New passphrase is active. Your session has been refreshed.</p>
          <button className="btn primary mt-16" onClick={() => navigate('/admin')}>Go to Dashboard</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <h1>{mustChange ? 'Set Your New Password' : 'Change Password'}</h1>
      </div>
      {mustChange && (
        <div className="status-banner" style={{ borderLeftColor: 'var(--flag-red)', maxWidth: 560 }}>
          You must replace the default password before continuing.
        </div>
      )}
      <form onSubmit={submit} className="panel" style={{ maxWidth: 480 }}>
        <div className="form-grid">
          <div className="form-group full">
            <label>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoFocus />
          </div>
          <div className="form-group full">
            <label>New Password (min 8 chars)</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group full">
            <label>Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
        </div>
        {error && <div className="field-error mt-8">{error}</div>}
        <button className="btn primary mt-16" type="submit" disabled={busy}>
          {busy ? 'Updating…' : mustChange ? 'Set Passphrase' : 'Update Passphrase'}
        </button>
      </form>
    </>
  );
}