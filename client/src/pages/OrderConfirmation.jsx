import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function OrderConfirmation({ settings }) {
  const { id } = useParams();
  const { t } = useLanguage();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data.order)).catch(() => setErr(true));
  }, [id]);

  if (err) {
    return (
      <section className="section"><div className="container notfound">
        <h2>{t('oc_not_found')}</h2>
        <p className="muted mt-8">{t('oc_no_order')}</p>
        <Link to="/shop" className="btn primary mt-16">{t('pd_back_shop')}</Link>
      </div></section>
    );
  }

  if (!order) {
    return <section className="section"><div className="container"><div className="spinner" /></div></section>;
  }

  const statusKey = `oc_${order.status}`;
  const statusLabel = t(statusKey);

  return (
    <section className="section">
      <div className="container">
        <div className="status-banner">
          <h1 className="section-title" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>{t('oc_placed')}</h1>
        </div>
        <p className="mt-8">
          {t('oc_confirm_prefix')} <b className="confirm-num">{order._id}</b> {t('oc_confirm_mid')} <b>{statusLabel}</b>
        </p>

        <div className="checkout-grid" style={{ paddingTop: 20 }}>
          <div className="panel">
            <h3>{t('oc_your_order')}</h3>
            {order.items.map((it) => (
              <div key={it.productId} className="cart-item" style={{ marginBottom: 10 }}>
                <img src={it.image || 'https://placehold.co/300x300/20242b/6b7279?text=Gear'} alt={it.name} />
                <div className="info">
                  <div className="name">{it.name}</div>
                  <div className="sub">{t('pd_sku', { sku: it.sku || '—' })}</div>
                </div>
                <div className="muted">{it.quantity} × ${Number(it.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <aside className="summary-box">
            <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 12 }}>{t('oc_summary')}</h3>
            <div className="summary-row"><span>{t('cart_subtotal')}</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
            <div className="summary-row"><span>{t('oc_shipping')}</span><span>{order.shipping === 0 ? t('cart_free') : `$${Number(order.shipping).toFixed(2)}`}</span></div>
            <div className="summary-row total"><span>{t('cart_total')}</span><span>${Number(order.total).toFixed(2)}</span></div>
            <div className="summary-row mt-8"><span>{t('oc_ship_to')}</span></div>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              {order.customer.name} · {order.customer.address}, {order.customer.city} {order.customer.state} {order.customer.zip}, {order.customer.country}
            </p>
            <Link to="/shop" className="btn block mt-16">{t('oc_continue')}</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
