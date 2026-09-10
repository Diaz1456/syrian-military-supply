import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { t } = useLanguage();

  const submit = (e) => {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email)) return;
    try {
      const list = JSON.parse(localStorage.getItem('sms_newsletter') || '[]');
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem('sms_newsletter', JSON.stringify(list));
      }
    } catch {}
    setDone(true);
    setEmail('');
  };

  return (
    <section className="newsletter">
      <div className="container inner">
        <div>
          <h3>{t('nl_title')}</h3>
          <p>{t('nl_subtitle')}</p>
        </div>
        {done ? (
          <p className="good" style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{t('nl_success')}</p>
        ) : (
          <form className="newsletter-form" onSubmit={submit}>
            <input type="email" required placeholder={t('nl_email')} value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn primary" type="submit">{t('nl_signup')}</button>
          </form>
        )}
      </div>
    </section>
  );
}