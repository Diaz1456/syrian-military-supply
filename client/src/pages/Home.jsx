import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';

function Carousel({ items, title, link }) {
  const ref = React.useRef(null);
  const { t } = useLanguage();
  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="section-head">
        <div>
          <span className="head-kicker">{t('home_collection')}</span>
          <h2 className="section-title">{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {link && <Link className="section-link" to={link}>{t('home_see_all')}</Link>}
          <div className="carousel-nav">
            <button onClick={() => scroll(-1)} aria-label={t('hero_prev')}>‹</button>
            <button onClick={() => scroll(1)} aria-label={t('hero_next')}>›</button>
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

function getDefaultHeroes(t) {
  return [
    {
      kicker: t('hero_1_kicker'),
      title: t('hero_1_title'),
      text: t('hero_1_text'),
      cta: t('hero_1_cta'),
      link: '/shop',
      btn2: t('hero_1_btn2'),
      link2: '/shop?category=Local%20Crafts',
      img: 'https://picsum.photos/seed/sms-gear/900/900',
      tag: t('hero_1_tag'),
    },
    {
      kicker: t('hero_2_kicker'),
      title: t('hero_2_title'),
      text: t('hero_2_text'),
      cta: t('hero_2_cta'),
      link: '/shop?category=Knives%20%26%20Tools',
      btn2: t('hero_2_btn2'),
      link2: '/shop?category=Surplus',
      img: 'https://picsum.photos/seed/sms-knife/900/900',
      tag: t('hero_2_tag'),
    },
    {
      kicker: t('hero_3_kicker'),
      title: t('hero_3_title'),
      text: t('hero_3_text'),
      cta: t('hero_3_cta'),
      link: '/shop?category=Medical%20%26%20Survival',
      btn2: t('hero_3_btn2'),
      link2: '/shop?category=Gear%20%26%20Packs',
      img: 'https://picsum.photos/seed/sms-survival/900/900',
      tag: t('hero_3_tag'),
    },
  ];
}

function slideToHero(s, t) {
  return {
    kicker: s.kicker || '',
    title: s.title,
    text: s.text || '',
    cta: s.cta || t('hero_shop_now'),
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
  const { t } = useLanguage();

  const defaultHeroes = getDefaultHeroes(t);
  const heroes = slides.length ? slides.map((s) => slideToHero(s, t)) : defaultHeroes;
  const hero = heroes[Math.min(heroIdx, heroes.length - 1)];

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx((i) => (i + 1) % (heroes.length || 1)), 7000);
    return () => clearInterval(interval);
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
                <span className="now">{t('home_deal')}</span>
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
            <Carousel items={featured} title={t('home_featured')} link="/shop" />
          </div>
        </section>
      )}

      <section className="section alt" style={{ paddingTop: 44, paddingBottom: 44 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <span className="head-kicker">{t('home_divisions')}</span>
              <h2 className="section-title">{t('home_categories')}</h2>
            </div>
            <Link className="section-link" to="/shop">{t('home_see_all')}</Link>
          </div>
          <div className="grid cats">
            {categories.map((c) => (
              <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} className="cat-tile">
                <span className="icon">{CAT_ICONS[c.name] || '◈'}</span>
                <span className="name">{c.name}</span>
                <span className="count">{c.count} {t(c.count === 1 ? 'home_item_one' : 'home_item_other')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        {newArrivals.length > 0 && <Carousel items={newArrivals} title={t('home_new_arrivals')} link="/shop?sort=newest" />}
      </div>

      <section className="section alt" style={{ marginTop: 24 }}>
        <div className="container">
          <div className="info-strip">
            <div className="info-item"><div className="k">{stats.count || '—'}</div><div className="t">{t('home_listings')}</div></div>
            <div className="info-item"><div className="k">{stats.rating ? stats.rating.toFixed(1) : '—'}</div><div className="t">{t('home_rating')}</div></div>
            <div className="info-item"><div className="k">100%</div><div className="t">{t('home_inspected')}</div></div>
            <div className="info-item"><div className="k">Local</div><div className="t">{t('home_local')}</div></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 8 }}>
        <div className="container">
          {bestSellers.length > 0 && <Carousel items={bestSellers} title={t('home_best_sellers')} link="/shop?sort=popular" />}
        </div>
      </section>
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
