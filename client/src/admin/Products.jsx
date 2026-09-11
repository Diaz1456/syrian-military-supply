import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function Products() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    api.get('/admin/products', { params: { q: q || undefined } })
      .then((r) => {
        setProducts(r.data.products || []);
        setSelected([]);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [q]);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulk = async (action) => {
    if (!selected.length) return;
    if (action === 'delete' && !window.confirm(t('admin_bulk_delete_products', { count: selected.length }))) return;
    setBusy(true);
    try {
      await api.patch('/admin/products/bulk', { ids: selected, action });
      load();
    } catch (e) {
      alert(e.response?.data?.message || t('admin_bulk_failed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(t('admin_confirm_delete_product', { name: p.name }))) return;
    setBusy(true);
    try {
      await api.delete(`/admin/products/${p._id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.message || t('admin_delete_failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>{t('admin_product_inventory')}</h1>
        <div className="admin-actions">
          <button className="btn primary" onClick={() => navigate('/admin/products/new')}>{t('admin_add_product')}</button>
        </div>
      </div>

      <div className="table-tools">
        <input placeholder={t('admin_search_product')} value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, maxWidth: 320 }} />
        <span className="muted">{t('admin_n_items', { count: products.length })}</span>
        <div style={{ flex: 1 }} />
        {selected.length > 0 && (
          <>
            <span className="muted">{t('admin_n_selected', { count: selected.length })}</span>
            <button className="btn small" disabled={busy} onClick={() => bulk('activate')}>{t('admin_activate')}</button>
            <button className="btn small" disabled={busy} onClick={() => bulk('deactivate')}>{t('admin_deactivate')}</button>
            <button className="btn small danger" disabled={busy} onClick={() => bulk('delete')}>{t('admin_delete_selected')}</button>
          </>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? products.map((p) => p._id) : [])} checked={selected.length === products.length && products.length > 0} /></th>
              <th>{t('admin_item')}</th>
              <th>{t('admin_category')}</th>
              <th>{t('admin_price')}</th>
              <th>{t('admin_stock')}</th>
              <th>{t('admin_status')}</th>
              <th>Views</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan="8" className="muted">{t('admin_no_products')}</td></tr>}
            {products.map((p) => (
              <tr key={p._id}>
                <td><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img className="thumb" src={p.images?.[0]?.url || 'https://placehold.co/200x200/20242b/6b7279?text='} alt="" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="muted" style={{ fontSize: '0.75rem' }}>{t('admin_sku_sold', { sku: p.sku || '—', count: p.salesCount })}</div>
                    </div>
                  </div>
                </td>
                <td>{p.category}</td>
                <td>
                  {p.salePrice && p.salePrice < p.price ? (
                    <span className="sand">${p.salePrice.toFixed(2)} <span className="muted" style={{ textDecoration: 'line-through' }}>${p.price.toFixed(2)}</span></span>
                  ) : (
                    <span>${p.price.toFixed(2)}</span>
                  )}
                </td>
                <td><span className={`pill-status ${p.stock <= 0 ? 'cancelled' : p.stock <= 5 ? 'pending' : 'delivered'}`}>{p.stock <= 0 ? t('admin_out') : p.stock}</span></td>
                <td><span className={`pill-status ${p.status}`}>{p.status === 'active' ? t('admin_active') : t('admin_inactive')}</span></td>
                <td className="muted">{p.views}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn small" onClick={() => navigate(`/admin/products/${p._id}/edit`)}>{t('admin_edit')}</button>
                    <button className="btn small danger" onClick={() => remove(p)}>{t('admin_delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}