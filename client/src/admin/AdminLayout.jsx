import React, { useMemo } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/slides', label: 'Slideshow' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/feedback', label: 'Feedback Log' },
  { to: '/admin/visitors', label: 'Visitor Log' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/change-password', label: 'Change Password' },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
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
            <div style={{ fontFamily: 'var(--font-head)', letterSpacing: '0.06em', fontWeight: 700 }}>Admin</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Syrian Military Supply</div>
          </div>
        </div>
        <nav className="admin-nav">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
          <a
            href="#!logout"
            onClick={(e) => { e.preventDefault(); logout(); navigate('/admin/login'); }}
            style={{ color: 'var(--bad)', marginTop: 10 }}
          >
            ⏻ Sign Out
          </a>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <Link to="/" className="muted" style={{ fontSize: '0.85rem' }}>← View storefront</Link>
          <div className="row" style={{ gap: 10 }}>
            <span className="rank-badge">🪖 {admin?.username || 'admin'}</span>
            <button className="btn small danger" onClick={() => { logout(); navigate('/admin/login'); }}>Sign Out</button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}