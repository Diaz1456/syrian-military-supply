import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';

function Carousel({ items, title, link }) {
  const ref = React.useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * 290, behavior: 'smooth' });
  };
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="section-head">
        <h2 className="section-title flag-accent">{title}</h2>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {link && <Link className="section-link" to={link}>See all →</Link>}
          <div className="carousel-nav">
            <button onClick={() => scroll(-1)} aria-label="Previous">‹</button>
            <button onClick={() => scroll(1)} aria-label="Next">›</button>
          </div>
        </div>
      </div>
      <div className="carousel">
        <div className="carousel-track" ref={ref}>
          {items.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  );
}

const HEROES = [
  {
    kicker: 'Genuine Salty Surplus Stock',
    title: 'FIELD-TESTED GEAR FOR TOUGH MISSIONS',
    text: 'From vintage surplus to modern tactical rigs — sourced, inspected and shipped from our Damascus depot.',
    cta: 'Browse the Armory',
    link: '/shop',
    btn2: 'Local Crafts',
    link2: '/shop?category=Local%20Crafts',
    img: 'photo-1607631568010-a87245c0daf8',
  },
  {
    kicker: 'Hand-Forged Local Heritage',
    title: 'DAMASCUS STEEL. DAMASCUS TRADITION.',
    text: 'Combat knives forged by local smiths using the same folded-steel craft that made Damascus legend.',
    cta: 'Shop Local Crafts',
    link: '/shop?category=Local%20Crafts',
    btn2: 'Knives & Tools',
    link2: '/shop?category=Knives%20%26%20Tools',
    img: 'photo-1573921313054-b6e7b6b916d2',
  },
  {
    kicker: 'Every Mission Needs A Plan',
    title: 'STOCK UP & STAY READY',
    text: 'Medical, survival and load-out essentials for the field. Free shipping on orders over your threshold amount.',
    cta: 'Shop Medical & Survival',
    link: '/shop?category=Medical%20%26%20Survival',
    btn2: 'Ammo & Storage',
    link2: '/shop?category=Surplus',
    img: 'photo-1517649763962-0c623066013b',
  },
];

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deal, setDeal] = useState(null);
  const [stats, setStats] = useState({ count: 0, rating: 0 });

  const hero = HEROES[heroIdx];

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HEROES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api.get('/products/featured').then((r) => setFeatured(r.data.featured || [])).catch(() => {});
    api.get('/products', { params: { sort: 'newest', limit: 10 } }).then((r) => setNewArrivals(r.data.products || [])).catch(() => {});
    api.get('/products', { params: { sort: 'popular', limit: 10 } }).then((r) => setBestSellers(r.data.products || [])).catch(() => {});
    api.get('/categories').then((r) => setCategories(r.data.categories || [])).catch(() => {});
    api.get('/products/deal').then((r) => setDeal(r.data.deal)).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/feedback', { params: { sort: 'newest', limit: 100 } })])
      .then(([p, f]) => {
        const fb = (f.data && f.data.feedback) || [];
        setStats({ count: p.data.total || p.data.products.length, rating: fb.length ? fb.reduce((a, b) => a + b.rating, 0) / fb.length : 0 });
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-kicker">{hero.kicker}</div>
            <h1>{hero.title}</h1>
            <p>{hero.text}</p>
            <div className="hero-ctas">
              <Link to={hero.link} className="btn primary">{hero.cta}</Link>
              <Link to={hero.link2} className="btn">{hero.btn2}</Link>
            </div>
            {deal && (
              <Link to={`/product/${deal._id}`} className="deal-flag">
                <span>⚡ Mission of the Day</span>
                <b>{deal.name}</b>
                <b>${(deal.salePrice || deal.price).toFixed(2)}</b>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 8 }}>
        <div className="container">
          <div className="section-head">
            <h2 className="section-title flag-accent">Division Categories</h2>
          </div>
          <div className="grid cats">
            {categories.map((c) => (
              <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="cat-tile">
                <span className="icon">{CAT_ICONS[c.name] || '◈'}</span>
                <span className="name">{c.name}</span>
                <span className="count">{c.count} item{c.count === 1 ? '' : 's'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {newArrivals.length > 0 && <Carousel items={newArrivals} title="New Arrivals" link="/shop?sort=newest" />}
      </div>

      <section className="section alt" style={{ marginTop: 34 }}>
        <div className="container">
          <div className="info-strip">
            <div className="info-item"><div className="k">{stats.count}</div><div className="t">Gear Listings</div></div>
            <div className="info-item"><div className="k">{stats.rating ? stats.rating.toFixed(1) : '—'}</div><div className="t">Avg Field Report Rating</div></div>
            <div className="info-item"><div className="k">100%</div><div className="t">Hand-Inspected</div></div>
            <div className="info-item"><div className="k">Local</div><div className="t">Forged & Stitched Locally</div></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 8 }}>
        <div className="container">
          {bestSellers.length > 0 && <Carousel items={bestSellers} title="Best Sellers — Most Deployed" link="/shop?sort=popular" />}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="about-grid">
            <div className="history-block">
              <h3 className="section-title flag-accent" style={{ marginBottom: 14 }}>From the Home Base</h3>
              <p className="lead">We source genuine military surplus, field-grade tactical gear and the finest dustrial-craft pieces Damascus has to offer.</p>
              <p className="muted mt-16">Every item is inspected by hand before it ships. When you buy local crafts — Damascus knives, traditional embroidery patches — you're supporting workshops that have kept their craft alive for generations.</p>
              <div className="row mt-16" style={{ gap: 12 }}>
                <Link to="/about" className="btn">Read Our Story</Link>
                <Link to="/contact" className="btn ghost">Leave A Field Report</Link>
              </div>
            </div>
            <div className="shadow-box">
              <h3 style={{ textTransform: 'uppercase', fontSize: '1.15rem', marginBottom: 12 }}>Why Operators Choose Us</h3>
              <ul className="muted" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>⚙ Real inspection scores on every listing</li>
                <li>🚚 Flat-rate shipping — free over thresholds</li>
                <li>🪖 Rank rewards for repeat visitors</li>
                <li>⭐ Field Report reviews from other operators</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

const CAT_ICONS = {
  'Tactical Apparel': '🦺',
  Footwear: '🥾',
  'Gear & Packs': '🎒',
  Optics: '🔭',
  'Knives & Tools': '🗡️',
  Surplus: '🎖️',
  'Patches & Morale': '🧷',
  'Medical & Survival': '⛑️',
  'Local Crafts': '🕌',
};