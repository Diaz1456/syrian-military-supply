import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Cart({ settings = {} }) {
  const { items, totalCount, subtotal, updateQty, removeFromCart, clearCart, notice } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const flat = settings?.shippingFlatRate ?? 9.99;
  const threshold = settings?.freeShippingThreshold ?? 150;
  const shipping = items.length === 0 || subtotal >= threshold ? 0 : flat;
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="head-kicker">{t('cart_kicker')}</span>
            <h1 className="section-title">{t('cart_title')}</h1>
          </div>
          <span className="muted">{totalCount} {t(totalCount === 1 ? 'home_item_one' : 'home_item_other')}</span>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🛍️</div>
            <h3>{t('cart_empty_title')}</h3>
            <p className="muted mt-8">{t('cart_empty_text')}</p>
            <Link to="/shop" className="btn primary mt-16">{t('cart_browse')}</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notice && <div className="notice-bar">{notice.msg}</div>}
              {items.map((it) => (
                <div key={it.productId} className="cart-item">
                  <Link to={`/product/${it.productId}`}>
                    <img src={it.image || 'https://placehold.co/300x300/20242b/6b7279?text=Gear'} alt={it.name} />
                  </Link>
                  <div className="info">
                    <div className="name">{it.name}</div>
                    <div className="sub">{t('pd_sku', { sku: it.sku || '—' })}</div>
                    <div className="sub">{t('cart_each', { price: `$${Number(it.effectivePrice).toFixed(2)}` })}</div>
                  </div>
                  <div className="qty">
                    <button onClick={() => updateQty(it.productId, it.quantity - 1)}>−</button>
                    <input value={it.quantity} onChange={(e) => updateQty(it.productId, parseInt(e.target.value, 10) || 1)} />
                    <button onClick={() => updateQty(it.productId, it.quantity + 1)}>+</button>
                  </div>
                  <div className="price" style={{ minWidth: 90, textAlign: 'right' }}>
                    ${(it.effectivePrice * it.quantity).toFixed(2)}
                  </div>
                  <button className="btn small danger" onClick={() => removeFromCart(it.productId)}>{t('cart_remove')}</button>
                </div>
              ))}
            </div>

            <aside className="summary-box">
              <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 12 }}>{t('cart_summary')}</h3>
              <div className="summary-row"><span>{t('cart_subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>{t('cart_shipping', { currency: settings?.currency || 'USD' })}</span><span>{shipping === 0 ? t('cart_free') : `$${shipping.toFixed(2)}`}</span></div>
              <div className="summary-row total"><span>{t('cart_total')}</span><span>${(subtotal + shipping).toFixed(2)}</span></div>

              {subtotal < threshold ? (
                <p className="muted mt-16" style={{ fontSize: '0.85rem' }}>
                  {t('cart_add_more', { amount: `$${(threshold - subtotal).toFixed(2)}` })}
                  <span className="progress mt-8"><i style={{ width: `${progress}%` }} /></span>
                </p>
              ) : (
                <p className="muted mt-16" style={{ fontSize: '0.85rem' }}>{t('cart_free_unlocked')}</p>
              )}

              <button className="btn primary block mt-16" onClick={() => navigate('/checkout')}>{t('cart_checkout')}</button>
              <button className="btn ghost block mt-8" onClick={clearCart}>{t('cart_clear')}</button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
