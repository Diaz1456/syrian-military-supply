import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function MIA() {
  const { t } = useLanguage();
  return (
    <section className="section">
      <div className="container notfound">
        <div className="big">404</div>
        <h2 className="section-title" style={{ marginTop: 14 }}>{t('mia_title')}</h2>
        <p className="muted" style={{ maxWidth: 480, margin: '14px auto 0' }}>
          {t('mia_text')}
        </p>
        <div className="row mt-24" style={{ gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn primary">{t('mia_home')}</Link>
          <Link to="/shop" className="btn">{t('mia_shop')}</Link>
        </div>
      </div>
    </section>
  );
}