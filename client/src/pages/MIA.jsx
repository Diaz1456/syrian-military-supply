import React from 'react';
import { Link } from 'react-router-dom';

export default function MIA() {
  return (
    <section className="section">
      <div className="container notfound">
        <div className="big">404</div>
        <h2 className="section-title" style={{ marginTop: 14 }}>Page not found</h2>
        <p className="muted" style={{ maxWidth: 480, margin: '14px auto 0' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="row mt-24" style={{ gap: 12, justifyContent: 'center' }}>
          <Link to="/" className="btn primary">Go home</Link>
          <Link to="/shop" className="btn">Browse the shop</Link>
        </div>
      </div>
    </section>
  );
}