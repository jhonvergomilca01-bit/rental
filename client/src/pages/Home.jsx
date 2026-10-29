import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import VehicleCard from '../VehicleCard.jsx';
import { SkeletonGrid } from '../Skeleton.jsx';
import { BRAND } from '../brand.js';

const STEPS = [['🔎', 'Choose', 'Search by dates and pick the vehicle that fits your trip.'],
  ['📅', 'Book', 'Confirm your dates, details and payment method in minutes.'],
  ['🔑', 'Drive', `Pick up at ${BRAND.pickup.name} and enjoy the road.`]];
const WHY = [['💰', 'Clear pricing', 'See the full price before you book.'],
  ['📧', 'Instant confirmation', 'A confirmation email after every booking.'],
  ['🚘', 'Well-kept fleet', 'Seats, fuel and transmission listed for every vehicle.'],
  ['⭐', 'Real reviews', 'Ratings from customers who finished their trips.']];
const FAQ = [['How do I book a vehicle?', 'Open a vehicle, choose your pick-up and return dates, then press Book now and complete checkout.'],
  ['Which payment methods can I choose?', 'At checkout you can choose pay at pickup, GCash or card.'],
  ['Can I cancel my booking?', 'Yes. Open the Reservations page and delete your booking.'],
  ['Where do I pick up the vehicle?', `At ${BRAND.pickup.name}. You can see it on the map on every vehicle page.`]];

export default function Home() {
  const nav = useNavigate(), [list, setList] = useState(null);
  const [f, setF] = useState({ start: '', end: '', type: '' });
  useEffect(() => { api.get('/vehicles?status=available').then(l => setList(l.slice(0, 4))); }, []);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const go = e => { e.preventDefault(); nav('/vehicles?' + new URLSearchParams(f)); };
  return (<>
    <section className="hero">
      <h1>Rent the right ride,<br />for any trip.</h1>
      <p>Cars, vans, motorcycles and trucks. Book in minutes.</p>
      <form className="search" onSubmit={go}>
        <label>Pick up<input type="date" value={f.start} onChange={set('start')} /></label>
        <label>Return<input type="date" value={f.end} onChange={set('end')} /></label>
        <label>Type<select value={f.type} onChange={set('type')}>
          <option value="">Any</option>{['car', 'van', 'motorcycle', 'truck'].map(t => <option key={t}>{t}</option>)}</select></label>
        <button>Search</button>
      </form>
    </section>

    <section className="section">
      <h2>Featured vehicles</h2><p className="sub">Popular picks, ready to book.</p>
      {list ? <div className="grid">{list.map(v => <VehicleCard key={v._id} v={v} />)}</div> : <SkeletonGrid n={4} />}
      <p style={{ textAlign: 'center', marginTop: 20 }}><Link className="btn ghost" to="/vehicles">See all vehicles →</Link></p>
    </section>

    <section className="section">
      <h2>How it works</h2><p className="sub">Three simple steps.</p>
      <div className="steps">{STEPS.map(([icon, t, d], i) => (
        <div className="card step" key={t}><div className="ico">{icon}</div><div><span className="num">{i + 1}</span></div><h3>{t}</h3><p>{d}</p></div>))}</div>
    </section>

    <section className="section">
      <h2>Why choose {BRAND.name}</h2><p className="sub">Built for a smooth rental from start to finish.</p>
      <div className="why">{WHY.map(([icon, t, d]) => <div className="card step" key={t}><div className="ico">{icon}</div><h3>{t}</h3><p>{d}</p></div>)}</div>
    </section>

    <section className="section">
      <h2>Frequently asked questions</h2><p className="sub">Quick answers before you book.</p>
      <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </section>
  </>);
}