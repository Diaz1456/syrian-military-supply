import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reports, setReports] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reportName, setReportName] = useState('');
  const [reportRating, setReportRating] = useState(0);
  const [reportMsg, setReportMsg] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setAdded(false);
    setQty(1);
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        setRelated(res.data.related || []);
      })
      .catch(() => setProduct({ notfound: true }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    api.get('/feedback', { params: { limit: 5 } })
      .then((r) => setReports(r.data.feedback || []))
      .catch(() => {});
  }, [reportSent]);

  if (loading) {
    return (
      <section className="section"><div className="container">
        <div className="skeleton" style={{ height: 420 }} />
      </div></section>
    );
  }

  if (!product || product.notfound) {
    return (
      <section className="section"><div className="container notfound">
        <div className="big">404</div>
        <h2>Item not found</h2>
        <p className="muted mt-8">This product is no longer available.</p>
        <Link to="/shop" className="btn primary mt-16">Back to shop</Link>
      </div></section>
    );
  }

  const onSale = product.salePrice && product.salePrice < product.price;
  const eff = onSale ? product.salePrice : product.price;
  const stockStatus = product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : 'in';
  const imgs = (product.images && product.images.length ? product.images : [{ url: 'https://placehold.co/900x900/20242b/6b7279?text=No+Image' }]);

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportRating) return setReportError('Select a 1–5 star rating.');
    try {
      await api.post('/feedback', {
        name: reportName || 'Anonymous',
        email: '',
        rating: reportRating,
        message: reportMsg,
        subject: `Review — ${product.name}`,
      });
      setReportSent(true);
      setReportMsg('');
      setReportRating(0);
      setReportName('');
      setReportError('');
    } catch (err) {
      setReportError(err.response?.data?.message || 'Report failed to submit.');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <nav className="muted" style={{ fontSize: '0.85rem', marginBottom: 22 }}>
          <Link to="/shop">Shop</Link> / <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / {product.name}
        </nav>

        <div className="pd-grid">
          <div>
            <div className="gallery-main">
              <img src={imgs[activeImg].url} alt={product.name} />
            </div>
            {imgs.length > 1 && (
              <div className="gallery-thumbs">
                {imgs.map((img, i) => (
                  <button key={i} className={activeImg === i ? 'active' : ''} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="pd-title">{product.name}</h1>
            <div className="pd-meta">
              <span>SKU {product.sku || '—'}</span>
              <span className={`stock-pill ${stockStatus === 'in' ? 'in' : stockStatus === 'low' ? 'low' : 'out'}`}>
                {stockStatus === 'in' ? '● In stock' : stockStatus === 'low' ? '● Low stock' : '● Out of stock'}
              </span>
            </div>

            <div className="pd-price">
              <span className="now">${Number(eff).toFixed(2)}</span>
              {onSale && <span className="was">${Number(product.price).toFixed(2)}</span>}
              {onSale && <span className="tag sale">Sale</span>}
            </div>

            <p className="pd-desc">{product.description || 'No description on file for this item.'}</p>

            <div className="qty-row">
              <span className="muted" style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 0.06 }}>Qty</span>
              <div className="qty">
                <button onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
                <input value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))} />
                <button onClick={() => setQty((n) => Math.min(product.stock || 99, n + 1))}>+</button>
              </div>
              <button
                className="btn primary"
                disabled={stockStatus === 'out'}
                onClick={() => { addToCart(product, qty); setAdded(true); }}
              >
                Add to Cart
              </button>
            </div>
            {added && <div className="added-msg">✔ Added to your cart.</div>}
            {product.stock <= 5 && product.stock > 0 && <div className="muted mt-8" style={{ fontSize: '0.85rem' }}>Only {product.stock} left in stock.</div>}

            <div className="panel mt-24">
              <h3>Specs</h3>
              <table className="specs-table">
                <tbody>
                  <tr><td>Material</td><td>{product.specs?.material || '—'}</td></tr>
                  <tr><td>Weight</td><td>{product.specs?.weight || '—'}</td></tr>
                  <tr><td>Capacity</td><td>{product.specs?.capacity || '—'}</td></tr>
                  <tr><td>Color</td><td>{product.specs?.color || '—'}</td></tr>
                  <tr><td>Origin</td><td>{product.specs?.origin || '—'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <h2 className="section-title">Reviews</h2>
          </div>
          <div className="grid reviews">
            {reports.length === 0 && <div className="muted">No reviews yet. Be the first to review this item.</div>}
            {reports.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-head">
                  <span className="review-op">{r.name || 'Anonymous'}</span>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <StarRating value={r.rating} />
                <p className="review-text mt-8">{r.message}</p>
              </div>
            ))}
          </div>

          <div className="panel mt-24">
            <h3>Write a review</h3>
            {reportSent ? (
              <p style={{ color: 'var(--good)' }}>✔ Thanks for your review.</p>
            ) : (
              <form onSubmit={submitReport}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Your name</label>
                    <input value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder="Name or callsign" />
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <StarRating value={reportRating} onChange={setReportRating} />
                  </div>
                  <div className="form-group full">
                    <label>Your review</label>
                    <textarea value={reportMsg} onChange={(e) => setReportMsg(e.target.value)} required placeholder="How did it hold up?" />
                  </div>
                </div>
                {reportError && <div className="field-error mt-8">{reportError}</div>}
                <button className="btn primary mt-16" type="submit">Submit review</button>
              </form>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="section" style={{ paddingBottom: 0 }}>
            <div className="section-head">
              <h2 className="section-title">Related items</h2>
            </div>
            <div className="grid products" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}