import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

const initialForm = {
  name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'Syria',
};

export default function Checkout({ settings = {} }) {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const flat = settings?.shippingFlatRate ?? 9.99;
  const threshold = settings?.freeShippingThreshold ?? 150;
  const shipping = subtotal >= threshold ? 0 : flat;
  const total = subtotal + shipping;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email.');
    if (!form.name || !form.address || !form.city) return setError('Name, address and city are required.');
    setPlacing(true);
    try {
      const payload = {
        customer: form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, name: i.name })),
      };
      const { data } = await api.post('/orders', payload);
      clearCart();
      setOrderId(data.order._id);
      window.setTimeout(() => navigate(`/order/${data.order._id}`), 400);
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Check stock and try again.');
      setPlacing(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="head-kicker">Secure checkout</span>
            <h1 className="section-title">Checkout</h1>
          </div>
        </div>

        <div className="checkout-grid">
          <form onSubmit={placeOrder}>
            <div className="panel">
              <h3>Contact &amp; shipping</h3>
              <div className="form-grid">
                <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={set('name')} required /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={set('phone')} /></div>
                <div className="form-group full"><label>Email *</label><input type="email" value={form.email} onChange={set('email')} required /></div>
                <div className="form-group full"><label>Street Address *</label><input value={form.address} onChange={set('address')} required /></div>
                <div className="form-group"><label>City *</label><input value={form.city} onChange={set('city')} required /></div>
                <div className="form-group"><label>State / Province</label><input value={form.state} onChange={set('state')} /></div>
                <div className="form-group"><label>Postal / ZIP</label><input value={form.zip} onChange={set('zip')} /></div>
                <div className="form-group"><label>Country</label><select value={form.country} onChange={set('country')}>
                  <option>Syria</option><option>Turkey</option><option>Jordan</option><option>Lebanon</option><option>United Arab Emirates</option><option>Other</option>
                </select></div>
              </div>
            </div>

            <div className="panel">
              <h3>Payment Method</h3>
              <div className="filter-list">
                <label>
                  <input type="radio" name="pay" defaultChecked />
                  Card / Wallet <span className="muted">(Demo — no charge)</span>
                </label>
                <label>
                  <input type="radio" name="pay" />
                  Cash on delivery
                </label>
              </div>
            </div>

            {error && <div className="field-error mt-8">{error}</div>}
            <button className="btn primary block mt-16" type="submit" disabled={placing || items.length === 0}>
              {placing ? 'Placing order…' : `Place order · $${total.toFixed(2)}`}
            </button>
          </form>

          <aside className="summary-box">
            <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 12 }}>Order Summary</h3>
            {items.map((it) => (
              <div key={it.productId} className="summary-row">
                <span>{it.quantity}× {it.name}</span>
                <span>${(it.effectivePrice * it.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
            <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            {items.length === 0 && <p className="muted mt-8">Your cart is empty. <Link to="/shop">Shop</Link></p>}
            {orderId && <p className="mt-16" style={{ color: 'var(--good)' }}>✔ Order {orderId} placed — redirecting…</p>}
          </aside>
        </div>
      </div>
    </section>
  );
}