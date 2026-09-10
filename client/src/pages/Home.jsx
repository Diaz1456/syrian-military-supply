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

const DEFAULT_HEROES = [
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

function slideToHero(s) {
  return {
    kicker: s.kicker || '',
    title: s.title,
    text: s.text || '',
    cta: s.cta || 'Shop now',
    link: s.link || '/shop',
    btn2: s.btn2 || '',
    link2: s.link2 || '/shop',
    img: s.image?.url || '',
    tag: s.tag || '',
  };
}

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [slides, setSlides] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deal, setDeal] = useState(null);
  const [stats, setStats] = useState({ count: 0, rating: 0 });

  const heroes = slides.length ? slides.map(slideToHero) : DEFAULT_HEROES;
  const hero = heroes[Math.min(heroIdx, heroes.length - 1)];

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % (heroes.length || 1)), 7000);
    return () => clearInterval(t);
  }, [heroes.length]);

  useEffect(() => {
    let on = true;
    api
      .get('/home')
      .then((r) => {
        if (!on) return;
        setSlides(r.data.slides || []);
        setFeatured(r.data.featured || []);
        setNewArrivals(r.data.newArrivals || []);
        setBestSellers(r.data.bestSellers || []);
        setDeal(r.data.deal || null);
        setStats(r.data.stats || { count: 0, rating: 0 });
      })
      .catch(() => {});
    api.get('/categories').then((r) => on && setCategories(r.data.categories || [])).catch(() => {});
    return () => { on = false; };
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
              {hero.btn2 && <Link to={hero.link2} className="btn">{hero.btn2}</Link>}
            </div>
            {deal && (
              <Link to={`/product/${deal._id}`} className="deal-flag">
                <span className="now">Deal of the day</span>
                <b>{deal.name}</b>
                <b>${Number(deal.salePrice || deal.price || 0).toFixed(2)}</b>
              </Link>
            )}
          </div>
          <div className="hero-media">
            <div className="frame">
              <img src={hero.img || 'https://placehold.co/900x900/2a3124/e6e2d8?text=Field+Gear'} alt="" />
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