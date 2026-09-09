import React, { useState } from 'react';
import api from '../api';
import StarRating from '../components/StarRating';
import Newsletter from '../components/Newsletter';

const REASONS = [
  'Product quality or durability',
  'Sizing or fit question',
  'Shipping / delivery',
  'Order or payment issue',
  'Local crafts — Damascus steel / embroidery',
  'General feedback about the store',
];

export default function Contact() {
  const [reason, setReason] = useState(REASONS[0]);
  const [contact, setContact] = useState({ name: '', email: '' });
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Rate your experience (1–5 stars) before submitting.');
    setStatus(null);
    setError('');
    try {
      await api.post('/feedback', {
        name: contact.name || 'Anonymous Operator',
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
      setError(err.response?.data?.message || 'Submission failed.');
    }
  };

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h1 className="section-title flag-accent">Contact & Field Reports</h1>
          </div>

          <div className="checkout-grid">
            <div>
              <div className="panel">
                {status ? (
                  <div>
                    <h3 style={{ color: 'var(--good)' }}>✔ Transmission received</h3>
                    <p className="muted mt-8">Your field report is logged with command. Expect a reply soon.</p>
                  </div>
                ) : (
                  <form onSubmit={submit}>
                    <h3>Leave Feedback — Rate Your Experience</h3>
                    <div className="form-grid mt-16">
                      <div className="form-group full">
                        <label>Subject</label>
                        <select value={reason} onChange={(e) => setReason(e.target.value)}>
                          {REASONS.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="form-group"><label>Name</label><input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Operator name" /></div>
                      <div className="form-group"><label>Email</label><input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="For replies" /></div>
                      <div className="form-group full">
                        <label>Experience Rating</label>
                        <StarRating value={rating} onChange={setRating} size="1.6rem" />
                      </div>
                      <div className="form-group full">
                        <label>Message</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="How did we do? What could the depot improve?" />
                      </div>
                    </div>
                    {error && <div className="field-error mt-8">{error}</div>}
                    <button className="btn primary mt-16" type="submit">Send Field Report</button>
                  </form>
                )}
              </div>

              <div className="panel">
                <h3>Hits on the Radio</h3>
                <div className="summary-row"><span>Email</span><span className="sand">contact@syrianmilitarysupply.com</span></div>
                <div className="summary-row"><span>Hours</span><span className="sand">Mon–Sat: 09:00–19:00 · Sun: Closed</span></div>
                <div className="summary-row"><span>Base</span><span className="sand">Souk Central, Damascus</span></div>
              </div>
            </div>

            <aside>
              <div className="panel" style={{ position: 'sticky', top: 100 }}>
                <h3>Find the Depot</h3>
                <div style={{ border: '1px dashed var(--olive-bright)', minHeight: 200, display: 'grid', placeItems: 'center', background: 'var(--matte)', textAlign: 'center', padding: 20 }}>
                  <div>
                    <div style={{ fontSize: '2rem' }}>🗺️</div>
                    <p className="muted mt-8" style={{ fontSize: '0.9rem' }}>
                      Map coordinates pending satellite uplink.<br />
                      In the meantime: DM us or drop a field report.
                    </p>
                  </div>
                </div>
                <div className="info-strip" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
                  <div className="info-item"><div className="k">9</div><div className="t">Categories</div></div>
                  <div className="info-item"><div className="k">★</div><div className="t">Reviews Logged</div></div>
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