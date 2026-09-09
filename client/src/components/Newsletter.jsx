import React, { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

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
          <h3>Stay in the loop</h3>
          <p>New gear drops, sales and restock alerts. No spam — unsubscribe anytime.</p>
        </div>
        {done ? (
          <p className="good" style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>✔ Signed up. Welcome aboard.</p>
        ) : (
          <form className="newsletter-form" onSubmit={submit}>
            <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn primary" type="submit">Sign up</button>
          </form>
        )}
      </div>
    </section>
  );
}