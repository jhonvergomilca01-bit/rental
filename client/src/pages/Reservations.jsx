import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Reservations() {
  const [list, setList] = useState([]), [q, setQ] = useState(''), [status, setStatus] = useState('');
  const load = () => api.get(`/reservations?search=${encodeURIComponent(q)}&status=${status}`).then(setList);
  useEffect(() => { load(); }, [q, status]);
  const remove = async id => { if (confirm('Delete this reservation?')) { await api.del('/reservations/' + id); load(); } };
  const d = s => new Date(s).toLocaleDateString();
  return (<>
    <h2>Reservations</h2>
    <div className="bar"><input placeholder="Search customer, contact, vehicle..." value={q} onChange={e => setQ(e.target.value)} />
      <select value={status} onChange={e => setStatus(e.target.value)}><option value="">All</option><option>reserved</option><option>completed</option><option>cancelled</option></select>
      <Link className="btn" to="/reservations/new">+ Reserve</Link></div>
    <table><thead><tr><th>Customer</th><th>Vehicle</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>{list.map(r => <tr key={r._id}><td>{r.customerName}<br /><small>{r.contact}</small></td><td>{r.vehicle?.name} ({r.vehicle?.plate})</td>
        <td>{d(r.startDate)} → {d(r.endDate)}</td><td>₱{r.totalPrice}</td><td>{r.status}</td>
        <td><Link className="btn" to={`/reservations/${r._id}/edit`}>Edit</Link> <button className="danger" onClick={() => remove(r._id)}>Delete</button></td></tr>)}
        {!list.length && <tr><td colSpan="6">No reservations found.</td></tr>}</tbody></table>
  </>);
}