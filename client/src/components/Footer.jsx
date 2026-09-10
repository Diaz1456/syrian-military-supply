import React from 'react';
import { Link } from 'react-router-dom';
import { useVisit } from '../context/VisitContext';
import { useLanguage } from '../context/LanguageContext';
import Newsletter from './Newsletter';

export default function Footer({ settings, showNewsletter }) {
  const { rank, visits } = useVisit();
  const { t } = useLanguage();
  const pct = Math.min(100, (visits / 25) * 100);
  const storeName = settings?.storeName || '';

  return (
    <>
      {showNewsletter && <Newsletter />}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="brand-copy">
                <span className="brand-mark">★</span>
                <div className="brand-name" style={{ color: '#f2f3f0' }}>{storeName}</div>
              </div>
              <p className="muted mt-16" style={{ fontSize: '0.86rem', maxWidth: 300 }}>
                {t('footer_tagline')}
              </p>
            </div>
            <div>
              <h4>{t('footer_shop_title')}</h4>
              <ul>
                <li><Link to="/shop">{t('footer_all_gear')}</Link></li>
                <li><Link to="/shop?category=Surplus">{t('footer_surplus')}</Link></li>
                <li><Link to="/shop?category=Knives%20%26%20Tools">{t('footer_knives_tools')}</Link></li>
                <li><Link to="/shop?category=Local%20Crafts">{t('footer_local_crafts')}</Link></li>
              </ul>
            </div>
            <div>
              <h4>{t('footer_company')}</h4>
              <ul>
                <li><Link to="/contact">{t('nav_contact')}</Link></li>
                <li><Link to="/cart">{t('header_cart')}</Link></li>
              </ul>
            </div>
            <div>
              <h4>{t('footer_service_rank')}</h4>
              <span className="rank-badge">{rank.icon} {t(`rank_${rank.level}`)}</span>
              <div className="progress"><i style={{ width: `${pct}%` }} /></div>
              <p className="muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>
                {t('footer_visits', { count: visits })} · {pct < 100 ? t('footer_to_general', { count: Math.max(0, 25 - visits) }) : t('footer_rank_maxed')}
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} {storeName}</span>
            <span>{t('footer_bottom_tag')}</span>
          </div>
        </div>
      </footer>
    </>
  );
}