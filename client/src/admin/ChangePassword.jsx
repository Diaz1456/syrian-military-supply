import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ChangePassword() {
  const { admin, changePassword } = useAuth();
  const { t } = useLanguage();
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
    if (newPassword.length < 8) return setError(t('admin_err_pw_len'));
    if (newPassword !== confirm) return setError(t('admin_err_pw_match'));
    setBusy(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || t('admin_err_pw_fail'));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <>
        <div className="admin-topbar"><h1>{t('admin_pw_updated')}</h1></div>
        <div className="panel">
          <p style={{ color: 'var(--good)' }}>{t('admin_pw_active')}</p>
          <button className="btn primary mt-16" onClick={() => navigate('/admin')}>{t('admin_go_dashboard')}</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="admin-topbar">
        <h1>{mustChange ? t('admin_set_new_pw') : t('admin_change_pw_title')}</h1>
      </div>
      {mustChange && (
        <div className="status-banner" style={{ borderLeftColor: 'var(--flag-red)', maxWidth: 560 }}>
          {t('admin_must_change')}
        </div>
      )}
      <form onSubmit={submit} className="panel" style={{ maxWidth: 480 }}>
        <div className="form-grid">
          <div className="form-group full">
            <label>{t('admin_current_pw')}</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoFocus />
          </div>
          <div className="form-group full">
            <label>{t('admin_new_pw')}</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="form-group full">
            <label>{t('admin_confirm_pw')}</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
        </div>
        {error && <div className="field-error mt-8">{error}</div>}
        <button className="btn primary mt-16" type="submit" disabled={busy}>
          {busy ? t('admin_updating') : mustChange ? t('admin_set_pw') : t('admin_update_pw')}
        </button>
      </form>
    </>
  );
}