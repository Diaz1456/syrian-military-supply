import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  'Tactical Apparel', 'Footwear', 'Gear & Packs', 'Optics', 'Knives & Tools',
  'Surplus', 'Patches & Morale', 'Medical & Survival', 'Local Crafts',
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const category = params.get('category') || 'All';
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'newest';
  const minPrice = params.get('min') || '';
  const maxPrice = params.get('max') || '';

  const setParam = (key, value, clearPager = true) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === null || value === undefined || value === 'All') next.delete(key);
    else next.set(key, value);
    if (clearPager) next.delete('page');
    setParams(next, { replace: false });
  };

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get('/products', {
          params: {
            category: category === 'All' ? undefined : category,
            q: q || undefined,
            sort: sort || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            page,
            limit: 12,
          },
        })
        .then((res) => {
          setProducts(res.data.products);
          setTotal(res.data.total);
          setPages(res.data.pages || 1);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [category, q, sort, minPrice, maxPrice, page]);

  const priceInput = { padding: '7px 9px', width: '100%', border: '1px solid var(--line)', borderRadius: 'var(--radius-s)', background: 'var(--surface)', color: 'var(--ink)' };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="head-kicker">Catalog</span>
            <h1 className="section-title">Shop</h1>
          </div>
          <span className="muted">{total} item{total === 1 ? '' : 's'}</span>
        </div>

        <div className="shop-layout">
          <aside className="filters">
            <div className="filter-group">
              <div className="filter-title">Category</div>
              <div className="filter-list">
                <label><input type="radio" checked={category === 'All'} onChange={() => setParam('category', 'All')} /> All Gear</label>
                {categories.map((c) => (
                  <label key={c.name}>
                    <input type="radio" checked={category === c.name} onChange={() => setParam('category', c.name)} />
                    {c.name} <span className="muted">({c.count})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-title">Price ($)</div>
              <div className="price-range" style={{ marginBottom: 8 }}>
                <input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => setParam('min', e.target.value)} style={priceInput} />
                <input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => setParam('max', e.target.value)} style={priceInput} />
              </div>
              {(minPrice || maxPrice) && (
                <button className="btn small ghost" onClick={() => { setParam('min', ''); setParam('max', ''); }}>Clear</button>
              )}
            </div>

            <div className="filter-group">
              <div className="filter-title">Sort</div>
              <select className="styled-select" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </aside>

          <div>
            <div className="toolbar">
              {q && (
                <div className="muted" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  Results for “{q}” <button className="btn small ghost" onClick={() => setParam('q', '')}>✕</button>
                </div>
              )}
              <span className="muted" style={{ fontSize: '0.85rem' }}>
                {loading ? 'Loading…' : `${products.length} of ${total}`}
              </span>
            </div>

            {loading ? (
              <div className="grid products">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="product-card"><div className="skeleton" style={{ aspectRatio: '1/1' }} /><div className="card-body skeleton" style={{ height: 90 }} /></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="icon">▣</div>
                <h3>No items found</h3>
                <p className="muted">Try adjusting your filters or search.</p>
              </div>
            ) : (
              <div className="grid products">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}

            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    className={page === i + 1 ? 'primary' : ''}
                    onClick={() => setPage(i + 1)}
                    disabled={loading}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}