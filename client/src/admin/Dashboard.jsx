import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StarRating from '../components/StarRating';

const ORDER_STATUS = { pending: 'Pending', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data)).catch((e) => setErr(e.response?.data?.message || 'Failed to load'));
  }, []);

  if (err) return <div className="muted">{err}</div>;
  if (!data) return <div className="spinner" />;

  const { visitors, sales, lowStock, recentFeedback, recentOrders, topProducts } = data;
  const maxHour = visitors.peakHours.reduce((m, h) => Math.max(m, h.count), 1);
  const revenue = Number(sales.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <div className="admin-topbar">
        <h1>Overview — SitRep</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="label">Total Visits</div><div className="value">{visitors.totalVisits}</div><div className="sub">All recorded sessions</div></div>
        <div className="stat-card good"><div className="label">Unique Visitors</div><div className="value">{visitors.uniqueVisitors}</div><div className="sub">Distinct visitor IDs</div></div>
        <div className="stat-card"><div className="label">Visits Today</div><div className="value">{visitors.visitsToday}</div><div className="sub">{visitors.visitsWeek} this week</div></div>
        <div className="stat-card warn"><div className="label">Orders</div><div className="value">{sales.totalOrders}</div><div className="sub">{sales.ordersToday} today · {sales.pendingOrders} pending</div></div>
        <div className="stat-card bad"><div className="label">Revenue</div><div className="value">${revenue}</div><div className="sub">Excludes cancelled</div></div>
        <div className="stat-card warn"><div className="label">Low Stock Alert</div><div className="value">{lowStock.length}</div><div className="sub">Items ≤ 5 units</div></div>
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <h3>Peak Operating Hours</h3>
          <div className="bar-chart">
            {visitors.peakHours.map((h) => (
              <div className="bar-col" key={h.hour} title={`${h.hour}:00 — ${h.count} visits`}>
                <div className="bar" style={{ height: `${Math.max(4, (h.count / maxHour) * 100)}%` }} />
                <div className="bar-label">{h.hour}h</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel">
          <h3>Top Gear (By Sales)</h3>
          {topProducts.length === 0 && <p className="muted">No sales data yet.</p>}
          {topProducts.map((p) => (
            <div key={p._id} className="summary-row">
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <img src={p.images?.[0]?.url} className="thumb" alt="" style={{ width: 34, height: 34 }} />
                <Link to={`/admin/products/${p._id}/edit`}>{p.name}</Link>
              </span>
              <span className="muted">{p.salesCount} sold · {p.views} views</span>
            </div>
          ))}
        </div>

        <div className="dash-panel">
          <h3>Recent Orders</h3>
          {recentOrders.length === 0 && <p className="muted">No orders yet.</p>}
          {recentOrders.map((o) => (
            <div key={o._id} className="summary-row">
              <span>
                <Link to="/admin/orders" className="sand">{o.customer.name}</Link>
                <span className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>{new Date(o.createdAt).toLocaleString()}</span>
              </span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span>${Number(o.total).toFixed(2)}</span>
                <span className={`pill-status ${o.status}`}>{ORDER_STATUS[o.status]}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="dash-panel">
          <h3>Recent Field Reports</h3>
          {recentFeedback.length === 0 && <p className="muted">No feedback yet.</p>}
          {recentFeedback.map((f) => (
            <div key={f._id} className="summary-row">
              <span>
                <StarRating value={f.rating} />
                <span className="muted" style={{ display: 'block', fontSize: '0.78rem' }}>{f.name || 'Anonymous'}</span>
              </span>
              <span style={{ maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                {f.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="dash-panel" style={{ marginTop: 20 }}>
          <h3 style={{ color: 'var(--warn)' }}>⚠ Low / Depleted Stock</h3>
          <table className="data-table">
            <thead><tr><th>Item</th><th>Category</th><th>Stock</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td><span className={`pill-status ${p.stock <= 0 ? 'cancelled' : 'pending'}`}>{p.stock <= 0 ? 'Depleted' : `${p.stock} left`}</span></td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td><Link className="section-link" to={`/admin/products/${p._id}/edit`}>Restock →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}