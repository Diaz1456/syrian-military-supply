import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { t } = useLanguage();
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
        <h2>{t('pd_not_found')}</h2>
        <p className="muted mt-8">{t('pd_gone')}</p>
        <Link to="/shop" className="btn primary mt-16">{t('pd_back_shop')}</Link>
      </div></section>
    );
  }

  const onSale = product.salePrice && product.salePrice < product.price;
  const eff = onSale ? product.salePrice : product.price;
  const stockStatus = product.stock <= 0 ? 'out' : product.stock <= 5 ? 'low' : 'in';
  const imgs = (product.images && product.images.length ? product.images : [{ url: 'https://placehold.co/900x900/20242b/6b7279?text=No+Image' }]);

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportRating) return setReportError(t('pd_review_error'));
    try {
      await api.post('/feedback', {
        name: reportName || t('pd_anonymous'),
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
      setReportError(err.response?.data?.message || t('pd_report_error'));
    }
  };

  return (
    <section className="section">
      <div className="container">
        <nav className="muted" style={{ fontSize: '0.85rem', marginBottom: 22 }}>
          <Link to="/shop">{t('nav_shop')}</Link> / <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> / {product.name}
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
              <span>{t('pd_sku', { sku: product.sku || '—' })}</span>
              <span className={`stock-pill ${stockStatus === 'in' ? 'in' : stockStatus === 'low' ? 'low' : 'out'}`}>
                {stockStatus === 'in' ? t('pd_in_stock') : stockStatus === 'low' ? t('pd_low_stock') : t('pd_out_stock')}
              </span>
            </div>

            <div className="pd-price">
              <span className="now">${Number(eff).toFixed(2)}</span>
              {onSale && <span className="was">${Number(product.price).toFixed(2)}</span>}
              {onSale && <span className="tag sale">{t('sale')}</span>}
            </div>

            <p className="pd-desc">{product.description || t('pd_no_desc')}</p>

            <div className="qty-row">
              <span className="muted" style={{ fontFamily: 'var(--font-head)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: 0.06 }}>{t('pd_qty')}</span>
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
                {t('pd_add')}
              </button>
            </div>
            {added && <div className="added-msg">{t('pd_added')}</div>}
            {product.stock <= 5 && product.stock > 0 && <div className="muted mt-8" style={{ fontSize: '0.85rem' }}>{t('pd_only_left', { count: product.stock })}</div>}

            <div className="panel mt-24">
              <h3>{t('pd_specs')}</h3>
              <table className="specs-table">
                <tbody>
                  <tr><td>{t('pd_material')}</td><td>{product.specs?.material || '—'}</td></tr>
                  <tr><td>{t('pd_weight')}</td><td>{product.specs?.weight || '—'}</td></tr>
                  <tr><td>{t('pd_capacity')}</td><td>{product.specs?.capacity || '—'}</td></tr>
                  <tr><td>{t('pd_color')}</td><td>{product.specs?.color || '—'}</td></tr>
                  <tr><td>{t('pd_origin')}</td><td>{product.specs?.origin || '—'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="section-head">
            <h2 className="section-title">{t('pd_reviews')}</h2>
          </div>
          <div className="grid reviews">
            {reports.length === 0 && <div className="muted">{t('pd_no_reviews')}</div>}
            {reports.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-head">
                  <span className="review-op">{r.name || t('pd_anonymous')}</span>
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <StarRating value={r.rating} />
                <p className="review-text mt-8">{r.message}</p>
              </div>
            ))}
          </div>

          <div className="panel mt-24">
            <h3>{t('pd_write_review')}</h3>
            {reportSent ? (
              <p style={{ color: 'var(--good)' }}>{t('pd_thanks_review')}</p>
            ) : (
              <form onSubmit={submitReport}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('pd_your_name')}</label>
                    <input value={reportName} onChange={(e) => setReportName(e.target.value)} placeholder={t('pd_name_placeholder')} />
                  </div>
                  <div className="form-group">
                    <label>{t('pd_rating')}</label>
                    <StarRating value={reportRating} onChange={setReportRating} />
                  </div>
                  <div className="form-group full">
                    <label>{t('pd_your_review')}</label>
                    <textarea value={reportMsg} onChange={(e) => setReportMsg(e.target.value)} required placeholder={t('pd_review_placeholder')} />
                  </div>
                </div>
                {reportError && <div className="field-error mt-8">{reportError}</div>}
                <button className="btn primary mt-16" type="submit">{t('pd_submit_review')}</button>
              </form>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="section" style={{ paddingBottom: 0 }}>
            <div className="section-head">
              <h2 className="section-title">{t('pd_related')}</h2>
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
