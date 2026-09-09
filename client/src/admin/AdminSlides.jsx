import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const empty = {
  kicker: '', title: '', text: '', cta: 'Shop now', link: '/shop',
  btn2: '', link2: '/shop', tag: '', sortOrder: 0, enabled: true,
};

export default function AdminSlides() {
  const [slides, setSlides] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const load = () => api.get('/admin/slides').then((r) => setSlides(r.data.slides || [])).catch(() => {});

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const startCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm(empty);
    setFile(null);
    setError('');
  };

  const startEdit = (s) => {
    setEditing(s);
    setCreating(false);
    setForm({
      kicker: s.kicker, title: s.title, text: s.text, cta: s.cta, link: s.link,
      btn2: s.btn2, link2: s.link2, tag: s.tag, sortOrder: s.sortOrder, enabled: s.enabled,
    });
    setFile(null);
    setError('');
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setForm(empty);
    setFile(null);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, k === 'enabled' ? (v ? 'true' : 'false') : String(v ?? '')));
      if (file) fd.append('image', file);
      if (editing) await api.put(`/admin/slides/${editing._id}`, fd);
      else await api.post('/admin/slides', fd);
      setFlash(editing ? 'Slide updated' : 'Slide created');
      cancel();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (s) => {
    await api.patch(`/admin/slides/${s._id}/toggle`);
    load();
  };

  const remove = async (s) => {
    if (!window.confirm(`Delete slide "${s.title}"?`)) return;
    await api.delete(`/admin/slides/${s._id}`);
    if (editing?._id === s._id) cancel();
    load();
  };

  const formOpen = creating || Boolean(editing);

  return (
    <>
      <div className="admin-topbar">
        <h1>Slideshow</h1>
        {flash && <span style={{ color: 'var(--good)' }}>✔ {flash}</span>}
        {!formOpen && <button className="btn" onClick={startCreate}>+ New Slide</button>}
      </div>

      {formOpen ? (
        <form onSubmit={submit} className="panel" style={{ maxWidth: 640 }}>
          <h3>{editing ? 'Edit Slide' : 'New Slide'}</h3>
          <div className="form-grid mt-8">
            <div className="form-group"><label>Title *</label><input value={form.title} onChange={set('title')} /></div>
            <div className="form-group"><label>Kicker (small label)</label><input value={form.kicker} onChange={set('kicker')} /></div>
            <div className="form-group full"><label>Text</label><input value={form.text} onChange={set('text')} /></div>
            <div className="form-group"><label>Tag under badge</label><input value={form.tag} onChange={set('tag')} /></div>
            <div className="form-group"><label>Sort order (0 first)</label><input type="number" value={form.sortOrder} onChange={set('sortOrder')} /></div>
            <div className="form-group">
              <label>Slide image</label>
              <input
                type="file" accept="image/*"
                style={{ color: 'var(--sand)', paddingTop: 6 }}
                onChange={(e) => setFile(e.target.files[0] || null)}
              />
              {editing?.image?.url && !file ? (
                <img src={editing.image.url} alt="" className="mt-8" style={{ width: 140, borderRadius: 4 }} />
              ) : null}
              {file ? <img src={URL.createObjectURL(file)} alt="" className="mt-8" style={{ width: 140, borderRadius: 4 }} /> : null}
              <p className="muted mt-8" style={{ fontSize: '0.78rem' }}>
                {editing ? 'Leave empty to keep the current image.' : 'Required for new slides.'}
              </p>
            </div>
          </div>

          <h3 className="mt-24">Buttons</h3>
          <div className="form-grid mt-8">
            <div className="form-group"><label>Primary button text</label><input value={form.cta} onChange={set('cta')} /></div>
            <div className="form-group"><label>Primary button link</label><input value={form.link} onChange={set('link')} placeholder="/shop?category=..." /></div>
            <div className="form-group"><label>Secondary button text (blank = hidden)</label><input value={form.btn2} onChange={set('btn2')} /></div>
            <div className="form-group"><label>Secondary button link</label><input value={form.link2} onChange={set('link2')} placeholder="/shop?category=..." /></div>
          </div>

          <label className="row mt-16" style={{ gap: 10, fontFamily: 'var(--font-head)' }}>
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
            Show this slide on the homepage
          </label>

          {error && <div className="field-error mt-8">{error}</div>}
          <div className="row mt-16" style={{ gap: 10 }}>
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save Slide'}</button>
            <button className="btn" type="button" onClick={cancel}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          {slides.length === 0 && (
            <div className="panel muted" style={{ maxWidth: 420 }}>No slides yet — create one to replace the default slideshow.</div>
          )}
          <div className="dash-grid">
            {slides.map((s) => (
              <div className="dash-panel" key={s._id}>
                <img
                  src={s.image?.url}
                  alt=""
                  style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 4, background: '#000' }}
                />
                <h3 className="mt-8" style={{ fontSize: '1rem' }}>{s.title}</h3>
                <p className="muted" style={{ fontSize: '0.8rem' }}>{s.kicker} · order {s.sortOrder} · {s.enabled ? 'visible' : 'hidden'}</p>
                <p className="muted" style={{ fontSize: '0.8rem' }}>{s.text}</p>
                <div className="row mt-8" style={{ gap: 8 }}>
                  <button className="btn small" onClick={() => startEdit(s)}>Edit</button>
                  <button className="btn small" onClick={() => toggle(s)}>{s.enabled ? 'Hide' : 'Show'}</button>
                  <button className="btn small danger" onClick={() => remove(s)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
          <p className="muted mt-16" style={{ fontSize: '0.8rem' }}>
            Tip: link buttons to a category, e.g. <code>/shop?category=Knives%20%26%20Tools</code>.
          </p>
          <div className="mt-16"><Link className="btn" to="/">← View storefront</Link></div>
        </>
      )}
    </>
  );
}