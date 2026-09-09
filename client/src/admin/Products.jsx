import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Products() {
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
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [q]);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulk = async (action) => {
    if (!selected.length) return;
    if (action === 'delete' && !window.confirm(`Delete ${selected.length} product(s) permanently?`)) return;
    setBusy(true);
    try {
      await api.patch('/admin/products/bulk', { ids: selected, action });
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Bulk action failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.delete(`/admin/products/${p._id}`);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>Product Inventory</h1>
        <div className="admin-actions">
          <button className="btn primary" onClick={() => navigate('/admin/products/new')}>+ Add Product</button>
        </div>
      </div>

      <div className="table-tools">
        <input placeholder="Search name / SKU…" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, maxWidth: 320 }} />
        <span className="muted">{products.length} items</span>
        <div style={{ flex: 1 }} />
        {selected.length > 0 && (
          <>
            <span className="muted">{selected.length} selected</span>
            <button className="btn small" disabled={busy} onClick={() => bulk('activate')}>Activate</button>
            <button className="btn small" disabled={busy} onClick={() => bulk('deactivate')}>Deactivate</button>
            <button className="btn small danger" disabled={busy} onClick={() => bulk('delete')}>Delete Selected</button>
          </>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? products.map((p) => p._id) : [])} checked={selected.length === products.length && products.length > 0} /></th>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Views</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan="8" className="muted">No products found.</td></tr>}
            {products.map((p) => (
              <tr key={p._id}>
                <td><input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggle(p._id)} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <img className="thumb" src={p.images?.[0]?.url || 'https://placehold.co/200x200/20242b/6b7279?text='} alt="" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div className="muted" style={{ fontSize: '0.75rem' }}>SKU {p.sku || '—'} · {p.salesCount} sold</div>
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
                <td><span className={`pill-status ${p.stock <= 0 ? 'cancelled' : p.stock <= 5 ? 'pending' : 'delivered'}`}>{p.stock <= 0 ? 'Out' : p.stock}</span></td>
                <td><span className={`pill-status ${p.status}`}>{p.status}</span></td>
                <td className="muted">{p.views}</td>
                <td>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn small" onClick={() => navigate(`/admin/products/${p._id}/edit`)}>Edit</button>
                    <button className="btn small danger" onClick={() => remove(p)}>Delete</button>
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