import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { ICON } from '../VehicleCard.jsx';
import { useToast } from '../toast.jsx';
import { BRAND } from '../brand.js';

const PICKUP = BRAND.pickup;
const stars = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
const short = d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function VehicleDetails() {
  const { id } = useParams(), [sp] = useSearchParams(), nav = useNavigate(), toast = useToast();
  const [v, setV] = useState(null), [booked, setBooked] = useState([]);
  const [rev, setRev] = useState({ reviews: [], avg: 0, canReview: false });
  const [start, setStart] = useState(sp.get('start') || ''), [end, setEnd] = useState(sp.get('end') || '');
  const [form, setForm] = useState({ rating: 5, comment: '' });
  const loadReviews = () => api.get('/reviews/' + id).then(setRev);
  useEffect(() => { api.get('/vehicles/' + id).then(setV); api.get(`/vehicles/${id}/booked`).then(setBooked); loadReviews(); }, [id]);
  if (!v) return <p>Loading...</p>;

  const days = start && end ? Math.ceil((new Date(end) - new Date(start)) / 864e5) : 0;
  const clash = days > 0 && booked.some(b => new Date(start) < new Date(b.endDate) && new Date(end) > new Date(b.startDate));
  const specs = [['👥', 'Seats', v.seats || 5], ['⚙️', 'Transmission', v.transmission || 'automatic'], ['⛽', 'Fuel', v.fuel || 'gasoline'], ['🚘', 'Type', v.type]];
  const { lat, lon } = PICKUP;
  const map = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.006},${lat - 0.004},${lon + 0.006},${lat + 0.004}&layer=mapnik&marker=${lat},${lon}`;
  const sendReview = async e => {
    e.preventDefault();
    try { await api.post('/reviews/' + id, form); toast('Thanks for your review!'); setForm({ rating: 5, comment: '' }); loadReviews(); }
    catch (x) { toast(x.message, 'bad'); }
  };

  return (<>
    <Link to="/vehicles">← Back to vehicles</Link>
    <div className="detail2">
      <div className="left">
        <div className="bigpic">
          <span className="fallback">{ICON[v.type]}</span>
          {v.image && <img src={v.image} alt={v.name} onError={e => { e.target.style.display = 'none'; }} />}
        </div>

        <div className="card info">
          <span className={'badge ' + v.status}>{v.status}</span>
          <h2>{v.name}</h2>
          <div><span className="stars">{stars(rev.avg)}</span> <small>{rev.reviews.length ? `${rev.avg} (${rev.reviews.length} review${rev.reviews.length > 1 ? 's' : ''})` : 'No reviews yet'}</small></div>
          <span className="plate">{v.plate}</span>
          <div className="specs">{specs.map(([i, l, val]) => <div key={l}><span>{i}</span><small>{l}</small><b>{val}</b></div>)}</div>
        </div>

        <div className="card"><h3>What's included</h3>
          <ul className="incl"><li>✅ Instant booking confirmation</li><li>✅ Printable receipt for every booking</li><li>✅ Pickup at {PICKUP.name}</li></ul></div>

        <div className="card">
          <h3>📍 Pickup location: {PICKUP.name}</h3>
          <iframe className="map" title="Pickup map" src={map} loading="lazy" />
          <small><a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`} target="_blank" rel="noreferrer">View larger map</a></small>
        </div>

        <div className="card">
          <h3>Reviews</h3>
          {rev.canReview && <form className="rform" onSubmit={sendReview}>
            <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n})</option>)}</select>
            <input placeholder="How was your trip? (optional)" maxLength={300} value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
            <button>Post review</button>
          </form>}
          {rev.reviews.map(x => <div className="review" key={x._id}>
            <span className="stars">{stars(x.rating)}</span> <b>{x.userName}</b> <small>{short(x.createdAt)}</small>
            {x.comment && <div>{x.comment}</div>}</div>)}
          {!rev.reviews.length && <p>No reviews yet. Reviews open after a customer finishes a trip.</p>}
        </div>
      </div>

      <aside className="card sticky">
        <div className="price">₱{v.pricePerDay.toLocaleString()} <small>/ day</small></div>
        {booked.length > 0 && <div><small>Already booked:</small>
          <div className="booked">{booked.map((b, i) => <span className="chip" key={i}>{short(b.startDate)} → {short(b.endDate)}</span>)}</div></div>}
        <div className="bar">
          <label>Pick up<input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
          <label>Return<input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
        </div>
        {clash && <p className="err">Those dates overlap an existing booking. Please pick other dates.</p>}
        {days > 0 && !clash && <p className="note">{days} day(s) · ₱{(days * v.pricePerDay).toLocaleString()}</p>}
        <button disabled={v.status !== 'available' || days < 1 || clash} onClick={() => nav(`/checkout/${id}?start=${start}&end=${end}`)}>Book now</button>
      </aside>
    </div>
  </>);
}