import React from 'react';
import { Link } from 'react-router-dom';
import Newsletter from '../components/Newsletter';

const TEAM = [
  { name: 'Elias Haddad', role: 'Founder & Purchase Officer', bio: 'Sources surplus across the region and test-loads every pack.' },
  { name: 'Maya Omar', role: 'Gear Inspector', bio: 'Checks stitching, zippers and soles on every boot that ships.' },
  { name: 'Nabil Karkoutly', role: 'Local Crafts Liaison', bio: 'Works directly with Damascus smiths and embroidery workshops.' },
  { name: 'Rami Hourani', role: 'Medical & Survival Lead', bio: 'Former field medic. Validates every IFAK and survival loadout.' },
];

export default function About() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner" style={{ padding: '56px 0 64px' }}>
          <div className="hero-content">
            <span className="hero-kicker">About us</span>
            <h1>Surplus with a story. Gear with a conscience.</h1>
            <p>Keeping genuine military surplus and time-honored local crafts in circulation — supporting workshops and collectors across Syria.</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 34 }}>
        <div className="container">
          <div className="about-grid">
            <div>
              <h2 className="section-title">The story</h2>
              <p className="lead mt-16" style={{ maxWidth: 560 }}>
                It began with a box of surplus helmets in a Damascus storeroom. Today our depot connects soldiers' surplus, modern tactical suppliers and the craftsmen who have forged and stitched here for generations.
              </p>
              <p className="muted" style={{ maxWidth: 560 }}>
                Every listing is hand-inspected and honestly described — because trust is the one piece of gear you can't buy off a shelf.
              </p>
              <p className="mt-16" style={{ maxWidth: 560 }}>
                We're proud of two living traditions: <b className="sand">Damascus steel</b> knife-smithing and <b className="sand">traditional embroidery</b>. Every Damascus knife comes from working smiths using folded-steel methods passed down for centuries.
              </p>
              <div className="row mt-24" style={{ gap: 12 }}>
                <Link to="/shop?category=Local%20Crafts" className="btn primary">Shop local crafts</Link>
                <Link to="/shop?category=Knives%20%26%20Tools" className="btn">Damascus knives</Link>
              </div>
            </div>

            <div className="shadow-box">
              <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>At a glance</h3>
              <div className="info-strip" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="info-item"><div className="k">2016</div><div className="t">Founded</div></div>
                <div className="info-item"><div className="k">9</div><div className="t">Categories</div></div>
                <div className="info-item"><div className="k">100%</div><div className="t">Hand-inspected</div></div>
                <div className="info-item"><div className="k">Local</div><div className="t">Forge &amp; workshop</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="head-kicker">Team</span>
              <h2 className="section-title">The crew</h2>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {TEAM.map((m) => (
              <div key={m.name} className="cat-tile" style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                <span className="review-op">{m.name}</span>
                <span className="tag cat" style={{ alignSelf: 'flex-start' }}>{m.role}</span>
                <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 0 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}