import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';

const STATUS_LABEL = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderConfirmation({ settings }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.order)).catch(() => setErr(true));
  }, [id]);

  if (err) {
    return (
      <section className="section"><div className="container notfound">
        <h2>Order not located</h2>
        <p className="muted mt-8">We couldn't pull up that transmission.</p>
        <Link to="/shop" className="btn primary mt-16">Back to Armory</Link>
      </div></section>
    );
  }

  if (!order) {
    return <section className="section"><div className="container"><div className="spinner" /></div></section>;
  }

  return (
    <section className="section">
      <div className="container">
        <div className="status-banner">
          <h1 className="section-title" style={{ fontSize: '1.6rem' }}>✔ Order Transmitted</h1>
          <p className="mt-8 sand">
            Confirmation <b className="confirm-num">{order._id}</b> · Status: <b>{STATUS_LABEL[order.status]}</b>
          </p>
        </div>

        <div className="checkout-grid">
          <div className="panel">
            <h3>Items Deployed</h3>
            {order.items.map((it) => (
              <div key={it.productId} className="cart-item" style={{ marginBottom: 10 }}>
                <img src={it.image || 'https://placehold.co/300x300/20242b/6b7279?text=Gear'} alt={it.name} />
                <div className="info">
                  <div className="name">{it.name}</div>
                  <div className="sub">SKU {it.sku || '—'}</div>
                </div>
                <div className="muted">{it.quantity} × ${Number(it.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <aside className="summary-box">
            <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 12 }}>Summary</h3>
            <div className="summary-row"><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{order.shipping === 0 ? 'FREE' : `$${Number(order.shipping).toFixed(2)}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>${Number(order.total).toFixed(2)}</span></div>
            <div className="summary-row mt-8"><span>Ship To</span></div>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              {order.customer.name} · {order.customer.address}, {order.customer.city} {order.customer.state} {order.customer.zip}, {order.customer.country}
            </p>
            <Link to="/shop" className="btn block mt-16">Keep Shopping</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}