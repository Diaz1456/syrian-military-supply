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
          <h3>Field Intelligence Briefings</h3>
          <p>New gear drops, mission sales and restock alerts. No radio chatter — unsubscribe anytime.</p>
        </div>
        {done ? (
          <p style={{ color: '#d8efc0', fontFamily: 'Oswald,sans-serif', letterSpacing: 0.05 }}>✔ Signed up. Stay frosty.</p>
        ) : (
          <form className="newsletter-form" onSubmit={submit}>
            <input type="email" required placeholder="operator@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn primary" type="submit">Sign Up</button>
          </form>
        )}
      </div>
    </section>
  );
}