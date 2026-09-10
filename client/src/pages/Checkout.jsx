import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const initialForm = {
  name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', country: 'Syria',
};

export default function Checkout({ settings = {} }) {
  const { items, subtotal, clearCart } = useCart();
  const { t } = useLanguage();
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
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError(t('co_err_email'));
    if (!form.name || !form.address || !form.city) return setError(t('co_err_required'));
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
      setError(err.response?.data?.message || t('co_err_order'));
      setPlacing(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="head-kicker">{t('co_kicker')}</span>
            <h1 className="section-title">{t('co_title')}</h1>
          </div>
        </div>

        <div className="checkout-grid">
          <form onSubmit={placeOrder}>
            <div className="panel">
              <h3>{t('co_contact')}</h3>
              <div className="form-grid">
                <div className="form-group"><label>{t('co_full_name')}</label><input value={form.name} onChange={set('name')} required /></div>
                <div className="form-group"><label>{t('co_phone')}</label><input value={form.phone} onChange={set('phone')} /></div>
                <div className="form-group full"><label>{t('co_email')}</label><input type="email" value={form.email} onChange={set('email')} required /></div>
                <div className="form-group full"><label>{t('co_address')}</label><input value={form.address} onChange={set('address')} required /></div>
                <div className="form-group"><label>{t('co_city')}</label><input value={form.city} onChange={set('city')} required /></div>
                <div className="form-group"><label>{t('co_state')}</label><input value={form.state} onChange={set('state')} /></div>
                <div className="form-group"><label>{t('co_zip')}</label><input value={form.zip} onChange={set('zip')} /></div>
                <div className="form-group"><label>{t('co_country')}</label><select value={form.country} onChange={set('country')}>
                  <option value="Syria">{t('country_syria')}</option>
                  <option value="Turkey">{t('country_turkey')}</option>
                  <option value="Jordan">{t('country_jordan')}</option>
                  <option value="Lebanon">{t('country_lebanon')}</option>
                  <option value="United Arab Emirates">{t('country_uae')}</option>
                  <option value="Other">{t('country_other')}</option>
                </select></div>
              </div>
            </div>

            <div className="panel">
              <h3>{t('co_payment')}</h3>
              <div className="filter-list">
                <label>
                  <input type="radio" name="pay" defaultChecked />
                  {t('co_card')}
                </label>
                <label>
                  <input type="radio" name="pay" />
                  {t('co_cod')}
                </label>
              </div>
            </div>

            {error && <div className="field-error mt-8">{error}</div>}
            <button className="btn primary block mt-16" type="submit" disabled={placing || items.length === 0}>
              {placing ? t('co_placing') : t('co_place', { total: `$${total.toFixed(2)}` })}
            </button>
          </form>

          <aside className="summary-box">
            <h3 style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 12 }}>{t('cart_summary')}</h3>
            {items.map((it) => (
              <div key={it.productId} className="summary-row">
                <span>{it.quantity}× {it.name}</span>
                <span>${(it.effectivePrice * it.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-row"><span>{t('cart_subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="summary-row"><span>{t('oc_shipping')}</span><span>{shipping === 0 ? t('cart_free') : `$${shipping.toFixed(2)}`}</span></div>
            <div className="summary-row total"><span>{t('cart_total')}</span><span>${total.toFixed(2)}</span></div>
            {items.length === 0 && <p className="muted mt-8">{t('co_empty')} <Link to="/shop">{t('nav_shop')}</Link></p>}
            {orderId && <p className="mt-16" style={{ color: 'var(--good)' }}>{t('co_redirecting', { id: orderId })}</p>}
          </aside>
        </div>
      </div>
    </section>
  );
}
