import React, { useMemo } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LINKS = [
  { to: '/admin', label: 'admin_dashboard', end: true },
  { to: '/admin/products', label: 'admin_products' },
  { to: '/admin/categories', label: 'admin_categories' },
  { to: '/admin/slides', label: 'admin_slideshow' },
  { to: '/admin/orders', label: 'admin_orders' },
  { to: '/admin/feedback', label: 'admin_feedback' },
  { to: '/admin/visitors', label: 'admin_visitors' },
  { to: '/admin/settings', label: 'admin_settings' },
  { to: '/admin/change-password', label: 'admin_change_pw' },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const { t, isRTL, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const initials = useMemo(() => {
    if (!admin) return 'CO';
    return admin.username.slice(0, 2).toUpperCase();
  }, [admin]);

  return (
    <div className="admin-wrap">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="logo">⛨</span>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', letterSpacing: '0.06em', fontWeight: 700 }}>{t('admin_panel')}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Syrian Military Supply</div>
          </div>
        </div>
        <nav className="admin-nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {t(l.label)}
            </NavLink>
          ))}
          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLang}
            title={isRTL ? 'English' : 'العربية'}
            style={{ marginTop: 10, cursor: 'pointer' }}
          >
            {isRTL ? 'EN' : 'ع'}
          </button>
          <a
            href="#!logout"
            onClick={(e) => { e.preventDefault(); logout(); navigate('/admin/login'); }}
            style={{ color: 'var(--bad)', marginTop: 10 }}
          >
            ⏻ {t('admin_sign_out')}
          </a>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <Link to="/" className="muted" style={{ fontSize: '0.85rem' }}>{t('admin_view_store')}</Link>
          <div className="row" style={{ gap: 10 }}>
            <span className="rank-badge">🪖 {admin?.username || 'admin'}</span>
            <button className="btn small danger" onClick={() => { logout(); navigate('/admin/login'); }}>{t('admin_sign_out')}</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}