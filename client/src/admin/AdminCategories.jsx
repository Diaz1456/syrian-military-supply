import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [counts, setCounts] = useState({});
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    api
      .get('/admin/categories')
      .then((r) => {
        setCats(r.data.categories || []);
        const c = {};
        (r.data.categories || []).forEach((x) => (c[x.name] = x.count));
        setCounts(c);
      })
      .catch((e) => setErr(e.response?.data?.message || 'Failed to load categories'));
  };

  useEffect(() => {
    load();
  }, []);

  const add = () => {
    setSaved(false);
    setErr('');
    const name = newName.trim();
    if (!name) return;
    const dup = cats.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (dup) return setErr(`Category "${name}" already exists.`);
    setCats([...cats, { id: `new-${Date.now()}`, name, isNew: true, count: 0 }]);
    setNewName('');
  };

  const setName = (idx, name) => {
    const next = cats.slice();
    next[idx] = { ...next[idx], name, isNew: false };
    setCats(next);
  };

  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= cats.length) return;
    const next = cats.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    setCats(next);
    setSaved(false);
  };

  const remove = (idx) => {
    setSaved(false);
    setErr('');
    const c = cats[idx];
    const cnt = counts[c.name] ?? c.count ?? 0;
    if (cnt > 0) {
      return setErr(`Cannot remove "${c.name}" — ${cnt} product(s) still use it. Reassign those products first.`);
    }
    if (!window.confirm(`Remove "${c.name}" from the store?`)) return;
    setCats(cats.filter((_, i) => i !== idx));
  };

  const save = async () => {
    setSaved(false);
    setErr('');
    const payload = cats.map((c) => ({
      id: c.isNew ? undefined : c.id,
      name: c.name.trim(),
    }));
    if (payload.some((c) => !c.name)) return setErr('Category names cannot be empty.');
    const seen = new Set();
    for (const c of payload) {
      const low = c.name.toLowerCase();
      if (seen.has(low)) return setErr(`Duplicate category: "${c.name}".`);
      seen.add(low);
    }
    setBusy(true);
    try {
      const r = await api.put('/admin/categories', { categories: payload });
      const merged = r.data.categories || [];
      setCats(merged);
      setCounts({});
      merged.forEach((x) => {
        setCounts((prev) => ({ ...prev, [x.name]: x.count }));
      });
      setSaved(true);
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>Categories</h1>
        {saved && <span style={{ color: 'var(--good)' }}>✔ Saved</span>}
      </div>

      <div className="panel" style={{ maxWidth: 640 }}>
        <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 14 }}>
          Add, rename, reorder or remove store categories. Renames are applied to every product
          already using a category; a category with products cannot be removed.
        </p>

        <div className="table-tools" style={{ marginBottom: 10 }}>
          <input
            placeholder="New category name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            style={{ flex: 1, maxWidth: 320 }}
          />
          <button className="btn small" onClick={add}>+ Add Category</button>
        </div>

        {cats.length === 0 ? (
          <p className="muted">No categories yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Name</th>
                <th>Products</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c, i) => (
                <tr key={c.id + i}>
                  <td className="muted" style={{ width: 90 }}>
                    <div className="row" style={{ gap: 6 }}>
                      <button className="btn small" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                      <button className="btn small" disabled={i === cats.length - 1} onClick={() => move(i, 1)}>↓</button>
                    </div>
                  </td>
                  <td>
                    <input value={c.name} onChange={(e) => setName(i, e.target.value)} style={{ width: '100%', minWidth: 180 }} />
                  </td>
                  <td className="muted">{(counts[c.name] ?? c.count ?? 0)}</td>
                  <td>
                    <button className="btn small danger" onClick={() => remove(i)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {err && <div className="field-error mt-8">{err}</div>}
        <div className="row mt-16" style={{ gap: 10 }}>
          <button className="btn primary" disabled={busy} onClick={save}>
            {busy ? 'Saving…' : 'Save Categories'}
          </button>
        </div>
      </div>
    </>
  );
}