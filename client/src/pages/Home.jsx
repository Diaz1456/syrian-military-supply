import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';

function Carousel({ items, title, link }) {
  const ref = React.useRef(null);
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="section-head">
        <div>
          <span className="head-kicker">Collection</span>
          <h2 className="section-title">{title}</h2>
        </div>
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
    kicker: 'Surplus & Tactical',
    title: 'Field-tested gear. Genuinely sourced.',
    text: 'Vintage surplus, modern tactical kit, local craft.',
    cta: 'Shop all gear',
    link: '/shop',
    btn2: 'Local crafts',
    link2: '/shop?category=Local%20Crafts',
    img: 'https://picsum.photos/seed/sms-gear/900/900',
    tag: 'Hand-inspected before shipping',
  },
  {
    kicker: 'Damascus Steel',
    title: 'Forged here. Trusted everywhere.',
    text: 'Hand-forged knives from working Damascus smiths.',
    cta: 'Shop knives & tools',
    link: '/shop?category=Knives%20%26%20Tools',
    btn2: 'Surplus',
    link2: '/shop?category=Surplus',
    img: 'https://picsum.photos/seed/sms-knife/900/900',
    tag: 'Forged by local workshops',
  },
  {
    kicker: 'Survival Essentials',
    title: 'Stock up. Stay ready.',
    text: 'Survival, medical and load-out essentials.',
    cta: 'Shop survival & medical',
    link: '/shop?category=Medical%20%26%20Survival',
    btn2: 'Gear & packs',
    link2: '/shop?category=Gear%20%26%20Packs',
    img: 'https://picsum.photos/seed/sms-survival/900/900',
    tag: 'Field-ready essentials',
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
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HEROES.length), 7000);
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
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-kicker">{hero.kicker}</span>
            <h1>{hero.title}</h1>
            <p>{hero.text}</p>
            <div className="hero-ctas">
              <Link to={hero.link} className="btn primary">{hero.cta}</Link>
              <Link to={hero.link2} className="btn">{hero.btn2}</Link>
            </div>
            {deal && (
              <Link to={`/product/${deal._id}`} className="deal-flag">
                <span className="now">Deal of the day</span>
                <b>{deal.name}</b>
                <b>${(deal.salePrice || deal.price).toFixed(2)}</b>
              </Link>
            )}
          </div>
          <div className="hero-media">
            <div className="frame">
              <img src={hero.img} alt="" />
            </div>
            <div className="hero-tag">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden>
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {hero.tag}
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section" style={{ paddingBottom: 8 }}>
          <div className="container">
            <Carousel items={featured} title="Featured" link="/shop" />
          </div>
        </section>
      )}

      <section className="section alt" style={{ paddingTop: 44, paddingBottom: 44 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="head-kicker">Divisions</span>
              <h2 className="section-title">Categories</h2>
            </div>
            <Link className="section-link" to="/shop">See all →</Link>
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
            <div className="info-item"><div className="k">{stats.count || '—'}</div><div className="t">Listings</div></div>
            <div className="info-item"><div className="k">{stats.rating ? stats.rating.toFixed(1) : '—'}</div><div className="t">Rating</div></div>
            <div className="info-item"><div className="k">100%</div><div className="t">Inspected</div></div>
            <div className="info-item"><div className="k">Local</div><div className="t">Forged &amp; stitched</div></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 8 }}>
        <div className="container">
          {bestSellers.length > 0 && <Carousel items={bestSellers} title="Best Sellers" link="/shop?sort=popular" />}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0, paddingBottom: 8 }}>
        <div className="container">
          <div className="about-grid">
            <div>
              <h2 className="section-title">The base</h2>
              <p className="lead mt-16" style={{ maxWidth: 540 }}>
                Surplus, tactical gear and Damascus craft — sourced and hand-inspected.
              </p>
              <p className="muted" style={{ maxWidth: 540 }}>
                Buying local keeps centuries-old workshops alive.
              </p>
              <div className="row mt-24" style={{ gap: 12 }}>
                <Link to="/about" className="btn">Our story</Link>
                <Link to="/contact" className="btn ghost">Contact</Link>
              </div>
            </div>
            <div className="shadow-box">
              <h3 style={{ fontSize: '1rem', marginBottom: 12 }}>Why us</h3>
              <ul>
                <li>Inspection scores on every item</li>
                <li>Free shipping over $150</li>
                <li>Rank rewards for repeat visits</li>
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