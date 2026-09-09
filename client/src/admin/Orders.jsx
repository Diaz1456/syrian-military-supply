import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const LABELS = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = () => {
    api.get('/admin/orders', { params: { status: filter, q: q || undefined } })
      .then((r) => setOrders(r.data.orders || []))
      .catch(() => {});
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [filter, q]);

  const setStatus = async (id, status) => {
    await api.patch(`/admin/orders/${id}/status`, { status });
    load();
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>Order Management</h1>
      </div>

      <div className="table-tools">
        <div className="checkbar">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          {STATUSES.map((s) => (
            <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>{LABELS[s]}</button>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <input placeholder="Search name / email…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orders.length === 0 && <p className="muted">No orders found.</p>}
        {orders.map((o) => {
          const open = expanded === o._id;
          return (
            <div key={o._id} style={{ background: 'var(--matte-2)', border: `1px solid ${open ? 'var(--olive-bright)' : '#262a31'}` }}>
              <button
                onClick={() => setExpanded(open ? null : o._id)}
                style={{ width: '100%', background: 'none', border: 'none', color: 'inherit', textAlign: 'left', padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <span className="confirm-num" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{o._id}</span>
                <span style={{ fontWeight: 600 }}>{o.customer.name}</span>
                <span className="muted" style={{ fontSize: '0.85rem' }}>{o.customer.email}</span>
                <span className="muted" style={{ fontSize: '0.82rem' }}>{new Date(o.createdAt).toLocaleString()}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: 'var(--font-head)' }}>${Number(o.total).toFixed(2)}</span>
                <span className={`pill-status ${o.status}`}>{LABELS[o.status]}</span>
                <span className="section-link">{open ? '▲ Collapse' : '▼ Details'}</span>
              </button>

              {open && (
                <div style={{ padding: '8px 16px 18px', borderTop: '1px dashed #2e333b' }}>
                  <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 10 }}>
                    Ship to: {o.customer.address}, {o.customer.city} {o.customer.state} {o.customer.zip}, {o.customer.country} · {o.customer.phone || 'no phone'}
                  </p>
                  <table className="data-table" style={{ marginBottom: 16 }}>
                    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Line</th></tr></thead>
                    <tbody>
                      {o.items.map((it, i) => (
                        <tr key={i}>
                          <td>{it.name}<span className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>SKU {it.sku || '—'}</span></td>
                          <td>{it.quantity}</td>
                          <td>${Number(it.price).toFixed(2)}</td>
                          <td>${(it.price * it.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="muted" style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', fontSize: '0.8rem' }}>Update status:</span>
                    {STATUSES.map((s) => (
                      <button key={s} className={`btn small ${o.status === s ? 'primary' : 'ghost'}`} onClick={() => setStatus(o._id, s)} disabled={o.status === s}>
                        {LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}