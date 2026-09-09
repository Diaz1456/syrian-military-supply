import React from 'react';
import { Link } from 'react-router-dom';
import Newsletter from '../components/Newsletter';

const TEAM = [
  { name: 'Col. Elias "Surveyor" Haddad', role: 'Founder & Purchase Officer', bio: 'Two decades sourcing surplus across the region. He test-loads every pack himself.' },
  { name: 'Sgt. Maya "Laces" Omar', role: 'Gear Inspector', bio: 'Checks stitching, zippers, and sole adhesion on every single boot that ships.' },
  { name: 'Nabil "Hammer" Karkoutly', role: 'Local Crafts Liaison', bio: 'Works directly with Damascus smiths and embroidery workshops to keep old crafts alive.' },
  { name: 'Lt. Rami "Bandage" Hourani', role: 'Medical & Survival Lead', bio: 'Former field medic who validates every IFAK and survival loadout we list.' },
];

export default function About() {
  return (
    <>
      <section className="hero" style={{ minHeight: 340, background: 'linear-gradient(180deg, rgba(18,20,24,0.9), rgba(18,20,24,0.65)), radial-gradient(900px 400px at 30% 30%, rgba(75,83,32,0.6), transparent), url(https://images.unsplash.com/photo-1607646418316-d3567775e33e?auto=format&fit=crop&w=1600&q=60) center/cover' }}>
        <div className="container">
          <div className="hero-content" style={{ maxWidth: 700 }}>
            <div className="hero-kicker">Mission Statement</div>
            <h1>Surplus With A Story. Gear With A Conscience.</h1>
            <p>We exist to keep genuine military surplus and time-honored local crafts in circulation — supporting workshops and collectors across Syria.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div>
              <h2 className="section-title">The Story of the Base</h2>
              <div className="history-block mt-16">
                <p className="lead">It began with a box of surplus helmets in a Damascus storeroom — and a simple question: where does used military gear really come from, and who is left to tell its story?</p>
                <p className="muted mt-16">Today, our depot is a meeting point between soldiers' surplus, modern tactical suppliers, and the craftsmen who have forged and stitched in this region for generations. Every listing is hand-inspected, honestly described, and priced fairly — because trust is the one implement you can't buy off a shelf.</p>
              </div>

              <h3 className="section-title mt-24" style={{ fontSize: '1.2rem' }}>Our Heritage & Local Crafts</h3>
              <p className="muted mt-8">We're proud of two living traditions: <b className="sand">Damascus steel</b> knife-smithing and <b className="sand">traditional embroidery</b>. Every Damascus knife we list comes from working smiths using folded-steel methods passed down for centuries. Our morale patches and embroidered pieces are finished by local workshops. Buying local is its own kind of field mission — one we're glad to run.</p>

              <div className="row mt-24" style={{ gap: 12 }}>
                <Link to="/shop?category=Local%20Crafts" className="btn primary">Shop Local Crafts</Link>
                <Link to="/shop?category=Knives%20%26%20Tools" className="btn">Damascus Knives</Link>
              </div>
            </div>

            <div className="shadow-box">
              <h3 style={{ textTransform: 'uppercase', marginBottom: 14 }}>The Numbers</h3>
              <div className="info-strip" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="info-item"><div className="k">2016</div><div className="t">Founded</div></div>
                <div className="info-item"><div className="k">9</div><div className="t">Divisions</div></div>
                <div className="info-item"><div className="k">100%</div><div className="t">Hand-Inspected</div></div>
                <div className="info-item"><div className="k">Local</div><div className="t">Forge & Workshop</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2 className="section-title flag-accent" style={{ marginBottom: 16 }}>The Crew</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {TEAM.map((m) => (
              <div key={m.name} className="cat-tile" style={{ textAlign: 'left' }}>
                <span className="review-op">{m.name}</span>
                <span className="tag cat" style={{ alignSelf: 'flex-start' }}>{m.role}</span>
                <p className="muted" style={{ fontSize: '0.9rem' }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}