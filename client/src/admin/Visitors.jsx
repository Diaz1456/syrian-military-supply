import React, { useEffect, useState } from 'react';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';

function deviceOf(ua) {
  if (!ua) return 'unknown';
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

export default function Visitors() {
  const { t } = useLanguage();
  const [visitors, setVisitors] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = () => {
    api.get('/admin/visitors', { params: { q: q || undefined, page } })
      .then((r) => {
        setVisitors(r.data.visitors || []);
        setPages(r.data.pages || 1);
        setTotal(r.data.total || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [q, page]);

  const remove = async (v) => {
    if (!window.confirm(t('admin_confirm_delete_visitor'))) return;
    await api.delete(`/admin/visitors/${v._id}`);
    load();
  };

  const clearAll = async () => {
    if (!window.confirm(t('admin_confirm_clear_visitors'))) return;
    await api.delete('/admin/visitors');
    load();
  };

  const fmt = (sec) => {
    if (!sec && sec !== 0) return '—';
    if (sec < 60) return `${Math.floor(sec)}s`;
    const m = Math.floor(sec / 60);
    return `${m}m ${Math.floor(sec % 60)}s`;
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>{t('admin_visitors_title')}</h1>
        <button className="btn small danger" onClick={clearAll}>{t('admin_clear_all')}</button>
      </div>

      <div className="table-tools">
        <input placeholder={t('admin_search_visitor')} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <span className="muted">{t('admin_n_sessions', { count: total })}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('admin_ip')}</th>
              <th>{t('admin_visitor_id')}</th>
              <th>{t('admin_device')}</th>
              <th>{t('admin_pages')}</th>
              <th>{t('admin_entry')}</th>
              <th>{t('admin_exit')}</th>
              <th>{t('admin_duration')}</th>
              <th>{t('admin_visits')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visitors.length === 0 && <tr><td colSpan="9" className="muted">{t('admin_no_visitors')}</td></tr>}
            {visitors.map((v) => (
              <tr key={v._id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{v.ip || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{v.visitorId ? v.visitorId.slice(0, 13) + '…' : '—'}</td>
                <td>{v.device || deviceOf(v.userAgent)}</td>
                <td>{v.pagesVisited?.length || 0}</td>
                <td>{v.entryTime ? new Date(v.entryTime).toLocaleString() : '—'}</td>
                <td>{v.exitTime ? new Date(v.exitTime).toLocaleString() : <span className="pill-status pending">{t('admin_live')}</span>}</td>
                <td>{fmt(v.duration)}</td>
                <td>{v.visitCount}</td>
                <td><button className="btn small danger" onClick={() => remove(v)}>{t('admin_delete')}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
        </div>
      )}
    </>
  );
}