import React from 'react';
import { Link } from 'react-router-dom';

export default function MIA() {
  return (
    <section className="section">
      <div className="container notfound">
        <div className="big">M.I.A.</div>
        <h2 className="section-title" style={{ letterSpacing: '0.4em', fontSize: '1.4rem' }}>MISSING IN ACTION</h2>
        <p className="muted mt-16" style={{ maxWidth: 520, margin: '16px auto 0' }}>
          The page you requested has not returned from its last patrol. No casualty report on file — but we're
          confident it's fine, maybe just went AWOL.
        </p>
        <p className="muted mt-8">Suggested recovery action:</p>
        <div className="row mt-16" style={{ gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn primary">Return to Base HQ</Link>
          <Link to="/shop" className="btn">Search the Armory</Link>
        </div>
      </div>
    </section>
  );
}