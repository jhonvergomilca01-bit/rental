import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useFavorites } from '../favorites.jsx';
import VehicleCard from '../VehicleCard.jsx';

const d = s => new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export default function Profile() {
  const { user } = useAuth(), { ids } = useFavorites();
  const [res, setRes] = useState([]), [all, setAll] = useState([]);
  useEffect(() => { api.get('/reservations').then(setRes); api.get('/vehicles').then(setAll); }, []);

  const live = res.filter(r => r.status !== 'cancelled');
  const upcoming = live.filter(r => new Date(r.endDate) > Date.now());
  const past = res.filter(r => !upcoming.includes(r));
  const spent = live.reduce((s, r) => s + (r.totalPrice || 0) + (r.lateFee || 0), 0);
  const favs = all.filter(v => ids.includes(String(v._id)));
  const stats = [['🧳', 'Trips booked', live.length], ['📅', 'Upcoming', upcoming.length], ['💰', 'Total spent', '₱' + spent.toLocaleString()]];

  const row = r => (
    <div className="card trip" key={r._id}>
      <div><b>{r.vehicle?.name}</b><br /><small>{d(r.startDate)} → {d(r.endDate)}</small></div>
      <b>₱{r.totalPrice?.toLocaleString()}</b>
      <span className={'badge ' + r.status}>{r.status}</span>
      <Link className="btn ghost" to={`/receipt/${r._id}`}>🧾 Receipt</Link>
      {r.status !== 'cancelled' && <Link className="btn ghost" to={`/vehicles/${r.vehicle?._id}`}>Rate / rebook</Link>}
    </div>);

  return (<>
    <h2>👤 {user.name}</h2>
    <div className="stats">{stats.map(([icon, label, value]) =>
      <div className="card stat" key={label}><div className="ico">{icon}</div><div><small>{label}</small><strong>{value}</strong></div></div>)}</div>
    <h3>Upcoming trips</h3>
    {upcoming.map(row)}{!upcoming.length && <p>No upcoming trips. <Link to="/vehicles">Find a vehicle</Link></p>}
    <h3>Past trips</h3>
    {past.map(row)}{!past.length && <p>No past trips yet.</p>}
    <h3>❤️ Favorites</h3>
    <div className="grid">{favs.map(v => <VehicleCard key={v._id} v={v} />)}</div>
    {!favs.length && <p>Tap the 🤍 on any vehicle to save it here.</p>}
  </>);
}