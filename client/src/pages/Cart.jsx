import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart({ settings = {} }) {
  const { items, totalCount, subtotal, updateQty, removeFromCart, clearCart, notice } = useCart();
  const navigate = useNavigate();

  const flat = settings.shippingFlatRate ?? 9.99;
  const threshold = settings.freeShippingThreshold ?? 150;
  const shipping = items.length === 0 || subtotal >= threshold ? 0 : flat;
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h1 className="section-title flag-accent">Your Loadout</h1>
          <span className="muted">{totalCount} item{totalCount === 1 ? '' : 's'} secured</span>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <h3 style={{ textTransform: 'uppercase' }}>Cart is a ghost town</h3>
            <p className="muted mt-8">No gear staged for deployment yet.</p>
            <Link to="/shop" className="btn primary mt-16">Hit the Armory</Link>
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
                    <div className="sub">SKU {it.sku || '—'}</div>
                    <div className="sub">${Number(it.effectivePrice).toFixed(2)} each</div>
                  </div>
                  <div className="qty">
                    <button onClick={() => updateQty(it.productId, it.quantity - 1)}>−</button>
                    <input value={it.quantity} onChange={(e) => updateQty(it.productId, parseInt(e.target.value, 10) || 1)} />
                    <button onClick={() => updateQty(it.productId, it.quantity + 1)}>+</button>
                  </div>
                  <div className="price" style={{ minWidth: 90, textAlign: 'right' }}>
                    ${(it.effectivePrice * it.quantity).toFixed(2)}
                  </div>
                  <button className="btn small danger" onClick={() => removeFromCart(it.productId)}>Remove</button>
                </div>
              ))}
            </div>

            <aside className="summary-box">
              <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 12 }}>Order Summary</h3>
              <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="summary-row"><span>Shipping ({settings.currency || 'USD'})</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="summary-row total"><span>Total</span><span>${(subtotal + shipping).toFixed(2)}</span></div>

              {subtotal < threshold ? (
                <p className="muted mt-16" style={{ fontSize: '0.85rem' }}>
                  Add <b style={{ color: 'var(--warn)' }}>${(threshold - subtotal).toFixed(2)}</b> more for free shipping.
                  <span className="progress mt-8"><i style={{ width: `${progress}%` }} /></span>
                </p>
              ) : (
                <p className="muted mt-16" style={{ fontSize: '0.85rem' }}>Free shipping unlocked ✔</p>
              )}

              <button className="btn primary block mt-16" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
              <button className="btn ghost block mt-8" onClick={clearCart}>Clear Loadout</button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}