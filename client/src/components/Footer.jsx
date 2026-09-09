import React from 'react';
import { Link } from 'react-router-dom';
import { useVisit } from '../context/VisitContext';
import Newsletter from './Newsletter';

export default function Footer({ showNewsletter }) {
  const { rank, visits } = useVisit();
  const pct = Math.min(100, (visits / 25) * 100);

  return (
    <>
      {showNewsletter && <Newsletter />}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="brand-copy">
                <span className="brand-mark">★</span>
                <div>
                  <div className="brand-name" style={{ color: '#f2f3f0' }}>Syrian Military Supply</div>
                  <div className="brand-sub" style={{ color: '#8d928f' }}>Surplus · Tactical · Local</div>
                </div>
              </div>
              <p className="muted mt-16" style={{ fontSize: '0.88rem', maxWidth: 300 }}>
                Genuine surplus, field-grade tactical gear and handcrafted local pieces.
              </p>
            </div>
            <div>
              <h4>Shop</h4>
              <ul>
                <li><Link to="/shop">All Gear</Link></li>
                <li><Link to="/shop?category=Surplus">Surplus</Link></li>
                <li><Link to="/shop?category=Knives%20%26%20Tools">Knives &amp; Tools</Link></li>
                <li><Link to="/shop?category=Local%20Crafts">Local Crafts</Link></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/cart">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4>Service Rank</h4>
              <span className="rank-badge">{rank.icon} {rank.name}</span>
              <div className="progress"><i style={{ width: `${pct}%` }} /></div>
              <p className="muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>
                {visits} visit{visits === 1 ? '' : 's'} · {pct < 100 ? `${Math.max(0, 25 - visits)} to General Goods` : 'Rank maxed'}
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Syrian Military Supply</span>
            <span>Inspected by hand. Shipped from the base.</span>
          </div>
        </div>
      </footer>
    </>
  );
}