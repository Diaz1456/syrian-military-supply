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
              <div className="seal" style={{ marginBottom: 12 }}>⛨</div>
              <p className="muted" style={{ fontSize: '0.9rem' }}>
                Genuine military surplus, field-tested tactical gear and handcrafted local pieces —
                sourced and shipped from the home base.
              </p>
            </div>
            <div>
              <h4>Navigate</h4>
              <ul>
                <li><Link to="/shop">Armory (All Gear)</Link></li>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/about">About the Base</Link></li>
                <li><Link to="/contact">Contact / Field Reports</Link></li>
              </ul>
            </div>
            <div>
              <h4>Categories</h4>
              <ul>
                <li><Link to="/shop?category=Surplus">Surplus</Link></li>
                <li><Link to="/shop?category=Knives %26 Tools">Knives & Tools</Link></li>
                <li><Link to="/shop?category=Local Crafts">Local Crafts</Link></li>
                <li><Link to="/shop?category=Medical %26 Survival">Medical & Survival</Link></li>
              </ul>
            </div>
            <div>
              <h4>Service Rank</h4>
              <span className="rank-badge">{rank.icon} {rank.name}</span>
              <div className="progress"><i style={{ width: `${pct}%` }} /></div>
              <p className="muted" style={{ fontSize: '0.78rem', marginTop: 6 }}>
                {visits} visit{visits === 1 ? '' : 's'} · {pct < 100 ? `${Math.ceil((25 - visits) < 0 ? 0 : 25 - visits)} more for General Goods` : 'Rank maxed. Salute. 🫡'}
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Syrian Military Supply. All rights reserved.</span>
            <span>Built for operators, collectors and craftsmen.</span>
          </div>
        </div>
      </footer>
    </>
  );
}