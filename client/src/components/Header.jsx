import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useVisit } from '../context/VisitContext';
import SearchBar from './SearchBar';

export default function Header() {
  const { totalCount } = useCart();
  const { rank, visits } = useVisit();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container">
          <span className="topbar-left">Free shipping $150+</span>
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
          <span className="brand-mark">★</span>
          <span>
            <div className="brand-name">Syrian Military Supply</div>
            <div className="brand-sub">Surplus · Tactical · Local Crafts</div>
          </span>
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