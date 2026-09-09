import React, { useEffect, useState } from 'react';
import api from '../api';
import StarRating from '../components/StarRating';

export default function FeedbackLog() {
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
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [filter, q, sort]);

  const remove = async (id) => {
    if (!window.confirm('Delete this review?')) return;
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
        <h1>Feedback</h1>
      </div>

      <div className="table-tools">
        <div className="checkbar">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
          {[5, 4, 3, 2, 1].map((r) => (
            <button key={r} className={filter === String(r) ? 'active' : ''} onClick={() => setFilter(String(r))}>{r}★</button>
          ))}
        </div>
        <input placeholder="Search reviews…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="styled-select" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {feedback.length === 0 && <p className="muted">No feedback yet.</p>}
        {feedback.map((f) => (
          <div key={f._id} className="review-card" style={{ opacity: f.read ? 0.72 : 1 }}>
            <div className="review-head">
              <span className="review-op">{f.name || 'Anonymous'}</span>
              <span className="review-date">{new Date(f.createdAt).toLocaleString()}</span>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <StarRating value={f.rating} />
              {!f.read && <span className="stock-pill low">New</span>}
            </div>
            {f.subject && <p className="muted mt-8" style={{ fontSize: '0.78rem' }}>{f.subject}</p>}
            <p className="review-text mt-8">{f.message}</p>
            {f.email && <p className="muted mt-8" style={{ fontSize: '0.78rem' }}>Reply: {f.email}</p>}
            <div className="row mt-8" style={{ gap: 8 }}>
              {!f.read && <button className="btn small ghost" onClick={() => markRead(f._id)}>Mark Read</button>}
              <button className="btn small danger" onClick={() => remove(f._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}