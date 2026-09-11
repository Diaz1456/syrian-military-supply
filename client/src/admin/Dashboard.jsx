import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StarRating from '../components/StarRating';
import { useLanguage } from '../context/LanguageContext';

const ORDER_STATUS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Dashboard() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setData(r.data)).catch((e) => setErr(e.response?.data?.message || t('dash_failed_load')));
  }, []);

  const statusLabel = (s) => (ORDER_STATUS.includes(s) ? t(`oc_${s}`) : s);

  if (err) return <div className="muted">{err}</div>;
  if (!data) return <div className="spinner" />;

  const { visitors, sales, lowStock, recentFeedback, recentOrders, topProducts } = data;
  const maxHour = visitors.peakHours.reduce((m, h) => Math.max(m, h.count), 1);
  const revenue = Number(sales.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <>
      <div className="admin-topbar">
        <h1>{t('admin_overview')}</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="label">{t('dash_total_visits')}</div><div className="value">{visitors.totalVisits}</div><div className="sub">{t('dash_all_sessions')}</div></div>
        <div className="stat-card good"><div className="label">{t('dash_unique_visitors')}</div><div className="value">{visitors.uniqueVisitors}</div><div className="sub">{t('dash_distinct_ids')}</div></div>
        <div className="stat-card"><div className="label">{t('dash_visits_today')}</div><div className="value">{visitors.visitsToday}</div><div className="sub">{t('dash_this_week', { count: visitors.visitsWeek })}</div></div>
        <div className="stat-card warn"><div className="label">{t('dash_orders')}</div><div className="value">{sales.totalOrders}</div><div className="sub">{t('dash_today_pending', { today: sales.ordersToday, pending: sales.pendingOrders })}</div></div>
        <div className="stat-card bad"><div className="label">{t('dash_revenue')}</div><div className="value">${revenue}</div><div className="sub">{t('dash_excl_cancelled')}</div></div>
        <div className="stat-card warn"><div className="label">{t('dash_low_stock')}</div><div className="value">{lowStock.length}</div><div className="sub">{t('dash_low_stock_sub')}</div></div>
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <h3>{t('dash_peak_hours')}</h3>
          <div className="bar-chart">
            {visitors.peakHours.map((h) => (
              <div className="bar-col" key={h.hour} title={t('dash_hour_title', { hour: h.hour, count: h.count })}>
                <div className="bar" style={{ height: `${Math.max(4, (h.count / maxHour) * 100)}%` }} />
                <div className="bar-label">{h.hour}h</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel">
          <h3>{t('dash_top_gear')}</h3>
          {topProducts.length === 0 && <p className="muted">{t('dash_no_sales')}</p>}
          {topProducts.map((p) => (
            <div key={p._id} className="summary-row">
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <img src={p.images?.[0]?.url} className="thumb" alt="" style={{ width: 34, height: 34 }} />
                <Link to={`/admin/products/${p._id}/edit`}>{p.name}</Link>
              </span>
              <span className="muted">{t('dash_sold_views', { sold: p.salesCount, views: p.views })}</span>
            </div>
          ))}
        </div>

        <div className="dash-panel">
          <h3>{t('dash_recent_orders')}</h3>
          {recentOrders.length === 0 && <p className="muted">{t('dash_no_orders')}</p>}
          {recentOrders.map((o) => (
            <div key={o._id} className="summary-row">
              <span>
                <Link to="/admin/orders" className="sand">{o.customer.name}</Link>
                <span className="muted" style={{ display: 'block', fontSize: '0.75rem' }}>{new Date(o.createdAt).toLocaleString()}</span>
              </span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span>${Number(o.total).toFixed(2)}</span>
                <span className={`pill-status ${o.status}`}>{statusLabel(o.status)}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="dash-panel">
          <h3>{t('dash_recent_reviews')}</h3>
          {recentFeedback.length === 0 && <p className="muted">{t('dash_no_feedback')}</p>}
          {recentFeedback.map((f) => (
            <div key={f._id} className="summary-row">
              <span>
                <StarRating value={f.rating} />
                <span className="muted" style={{ display: 'block', fontSize: '0.78rem' }}>{f.name || t('pd_anonymous')}</span>
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
          <h3 style={{ color: 'var(--warn)' }}>{t('dash_low_out')}</h3>
          <table className="data-table">
            <thead><tr><th>{t('admin_item')}</th><th>{t('admin_category')}</th><th>{t('admin_stock')}</th><th>{t('admin_price')}</th><th></th></tr></thead>
            <tbody>
              {lowStock.map((p) => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td><span className={`pill-status ${p.stock <= 0 ? 'cancelled' : 'pending'}`}>{p.stock <= 0 ? t('status_out') : t('dash_left', { count: p.stock })}</span></td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td><Link className="section-link" to={`/admin/products/${p._id}/edit`}>{t('dash_restock')}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}