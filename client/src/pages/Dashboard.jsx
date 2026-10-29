import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/stats').then(setS); }, []);
  if (!s) return <p>Loading...</p>;
  const cards = [['🚗', 'Vehicles', s.vehicles], ['✅', 'Available', s.available], ['🔑', 'Rented now', s.active],
    ['📅', 'Upcoming', s.upcoming], ['💰', 'Revenue', '₱' + s.revenue.toLocaleString()]];
  return (<>
    <h2>Dashboard</h2>
    <div className="stats">
      {cards.map(([icon, label, value]) => (
        <div className="card stat" key={label}><div className="ico">{icon}</div><div><small>{label}</small><strong>{value}</strong></div></div>
      ))}
    </div>
  </>);
}