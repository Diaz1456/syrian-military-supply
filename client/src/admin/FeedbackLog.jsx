import React, { useEffect, useState } from 'react';
import api from '../api';
import StarRating from '../components/StarRating';
import { useLanguage } from '../context/LanguageContext';

export default function FeedbackLog() {
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');

  const load = () => {
    api.get('/admin/feedback', { params: { rating: filter === 'all' ? undefined : filter, q: q || undefined, sort } })
      .then((r) => setFeedback(r.data.feedback || []))
      .catch(() => {});
  };

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [filter, q, sort]);

  const remove = async (id) => {
    if (!window.confirm(t('admin_confirm_delete_review'))) return;
    await api.delete(`/admin/feedback/${id}`);
    load();
  };

  const markRead = async (id) => {
    await api.patch(`/admin/feedback/${id}/read`);
    load();
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>{t('admin_feedback_title')}</h1>
      </div>

      <div className="table-tools">
        <div className="checkbar">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{t('admin_all')}</button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button key={r} className={filter === String(r) ? 'active' : ''} onClick={() => setFilter(String(r))}>{r}★</button>
          ))}
        </div>
        <input placeholder={t('admin_search_reviews')} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="styled-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">{t('admin_newest_first')}</option>
          <option value="oldest">{t('admin_oldest_first')}</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {feedback.length === 0 && <p className="muted">{t('dash_no_feedback')}</p>}
        {feedback.map((f) => (
          <div key={f._id} className="review-card" style={{ opacity: f.read ? 0.72 : 1 }}>
            <div className="review-head">
              <span className="review-op">{f.name || t('pd_anonymous')}</span>
              <span className="review-date">{new Date(f.createdAt).toLocaleString()}</span>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <StarRating value={f.rating} />
              {!f.read && <span className="stock-pill low">{t('admin_new')}</span>}
            </div>
            {f.subject && <p className="muted mt-8" style={{ fontSize: '0.78rem' }}>{f.subject}</p>}
            <p className="review-text mt-8">{f.message}</p>
            {f.email && <p className="muted mt-8" style={{ fontSize: '0.78rem' }}>{t('admin_reply', { email: f.email })}</p>}
            <div className="row mt-8" style={{ gap: 8 }}>
              {!f.read && <button className="btn small ghost" onClick={() => markRead(f._id)}>{t('admin_mark_read')}</button>}
              <button className="btn small danger" onClick={() => remove(f._id)}>{t('admin_delete')}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}