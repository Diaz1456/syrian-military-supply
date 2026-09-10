import React, { useState } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import StarRating from '../components/StarRating';
import Newsletter from '../components/Newsletter';

export default function Contact({ settings }) {
  const { t } = useLanguage();
  const REASONS = [
    t('c_reason_1'), t('c_reason_2'), t('c_reason_3'),
    t('c_reason_4'), t('c_reason_5'), t('c_reason_6'),
  ];
  const [reason, setReason] = useState(REASONS[0]);
  const [contact, setContact] = useState({ name: '', email: '' });
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError(t('contact_err_rating'));
    setStatus(null);
    setError('');
    try {
      await api.post('/feedback', {
        name: contact.name || t('pd_anonymous'),
        email: contact.email,
        rating,
        message,
        subject: `Store Contact — ${reason}`,
      });
      setStatus('logged');
      setReason(REASONS[0]);
      setRating(0);
      setMessage('');
      setContact({ name: '', email: '' });
    } catch (err) {
      setError(err.response?.data?.message || t('contact_err_submit'));
    }
  };

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="head-kicker">{t('contact_kicker')}</span>
              <h1 className="section-title">{t('contact_title')}</h1>
            </div>
          </div>

          <div className="checkout-grid">
            <div>
              <div className="panel">
                {status ? (
                  <div>
                    <h3 style={{ color: 'var(--good)' }}>{t('contact_received')}</h3>
                    <p className="muted mt-8">{t('contact_thanks')}</p>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <h3>{t('contact_send_title')}</h3>
                    <div className="form-grid mt-16">
                      <div className="form-group full">
                        <label>{t('contact_topic')}</label>
                        <select value={reason} onChange={(e) => setReason(e.target.value)}>
                          {REASONS.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label>{t('contact_name')}</label><input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder={t('contact_name_ph')} /></div>
                      <div className="form-group"><label>{t('contact_email')}</label><input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder={t('contact_email_ph')} /></div>
                      <div className="form-group full">
                        <label>{t('contact_rating')}</label>
                        <StarRating value={rating} onChange={setRating} size="1.6rem" />
                      </div>
                      <div className="form-group full">
                        <label>{t('contact_message')}</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder={t('contact_msg_ph')} />
                      </div>
                    </div>
                    {error && <div className="field-error mt-8">{error}</div>}
                    <button className="btn primary mt-16" type="submit">{t('contact_send')}</button>
                  </form>
                )}
              </div>

              <div className="panel">
                <h3>{t('contact_direct')}</h3>
                <div className="summary-row"><span>{t('contact_email')}</span><span className="sand">{settings?.contactEmail || ''}</span></div>
                <div className="summary-row"><span>{t('contact_hours')}</span><span className="sand">{settings?.hoursOfOperation || ''}</span></div>
                <div className="summary-row"><span>{t('contact_base')}</span><span className="sand">{t('contact_damascus')}</span></div>
              </div>
            </div>

            <aside>
              <div className="panel" style={{ position: 'sticky', top: 100 }}>
                <h3>{t('contact_visit')}</h3>
                <div style={{ border: '1px dashed var(--line-strong)', minHeight: 200, display: 'grid', placeItems: 'center', background: 'var(--surface-2)', textAlign: 'center', padding: 20, borderRadius: 'var(--radius-s)' }}>
                  <div>
                    <div style={{ fontSize: '2rem' }}>🗺️</div>
                    <p className="muted mt-8" style={{ fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: t('contact_map') }} />
                  </div>
                </div>
                <div className="info-strip" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
                  <div className="info-item"><div className="k">9</div><div className="t">{t('contact_categories')}</div></div>
                  <div className="info-item"><div className="k">★</div><div className="t">{t('contact_reviews')}</div></div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <Newsletter />
    </>
  );
}
