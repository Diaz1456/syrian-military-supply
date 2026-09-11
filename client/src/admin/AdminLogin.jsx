import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const { t, isRTL, toggleLang } = useLanguage();
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
      setError(err.response?.data?.message || t('admin_login_failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
          <div className="brand">
            <span className="logo">⛨</span>
          </div>
          <button type="button" className="lang-toggle" onClick={toggleLang} title={isRTL ? 'English' : 'العربية'}>
            {isRTL ? 'EN' : 'ع'}
          </button>
        </div>
        <h1>{t('admin_login_title')}</h1>
        <p className="hint">{t('admin_login_hint')}</p>

        <form onSubmit={submit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>{t('admin_username')}</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>{t('admin_password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="field-error" style={{ marginBottom: 10 }}>{error}</div>}
          <button className="btn primary block" type="submit" disabled={busy}>
            {busy ? t('admin_signing_in') : t('admin_login_btn')}
          </button>
        </form>

        <p className="muted mt-16" style={{ fontSize: '0.8rem', textAlign: 'center' }}>
          {t('admin_login_default')} <code>admin</code> / <code>changeme123</code> {t('admin_login_changed')}
        </p>
        <Link to="/" className="muted" style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: '0.85rem' }}>
          {t('admin_back_store')}
        </Link>
      </div>
    </div>
  );
}