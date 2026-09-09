import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVisit } from '../context/VisitContext';
import SearchBar from './SearchBar';

export default function Header({ settings }) {
  const { totalCount } = useCart();
  const { rank, visits } = useVisit();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const threshold = settings?.freeShippingThreshold ?? 150;
  const storeName = settings?.storeName || 'Syrian Military Supply';

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container">
          <span className="topbar-left">Free shipping ${threshold}+</span>
          <span className="topbar-right">
            <span className="muted" style={{ color: '#6f756e' }}>{rank.icon}</span>
            {rank.name} · {visits} visits
          </span>
        </div>
      </div>

      <div className="container header-main">
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>

        <Link to="/" className="brand" onClick={close}>
          <div className="brand-name">{storeName}</div>
          <svg className="brand-star" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2.6 14.4 8l5.9.6-4.5 4 1.6 5.7L12 15.2 6.6 18.3l1.6-5.7-4.5-4 5.9-.6z" />
          </svg>
        </Link>

        <nav className={`main-nav ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/shop" end onClick={close}>Shop</NavLink>
          <NavLink to="/about" onClick={close}>About</NavLink>
          <NavLink to="/contact" onClick={close}>Contact</NavLink>
        </nav>

        <div className="header-actions">
          <SearchBar onNavigate={close} />
          <Link to="/cart" className="icon-link" title="Cart" onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" aria-hidden>
              <path d="M3 3h2l.6 2.5M6 6h13l-1.8 8.2a2 2 0 0 1-2 1.6H8.6a2 2 0 0 1-2-1.6L4.6 6z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="20.5" r="1.3" fill="currentColor" />
              <circle cx="16.5" cy="20.5" r="1.3" fill="currentColor" />
            </svg>
            {totalCount > 0 && <span className="cart-count">{totalCount}</span>}
          </Link>
          <button className="icon-link" title="Search gear" onClick={() => navigate('/shop')}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="18" cy="5" r="3" strokeWidth="1.7" />
              <circle cx="6" cy="18" r="3" strokeWidth="1.7" />
              <path d="M5 21L19 3" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}