import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Vehicles() {
  const [list, setList] = useState([]), [q, setQ] = useState(''), [err, setErr] = useState('');
  const load = () => api.get('/vehicles?search=' + encodeURIComponent(q)).then(setList).catch(e => setErr(e.message));
  useEffect(() => { load(); }, [q]);
  const remove = async id => {
    if (!confirm('Delete this vehicle?')) return;
    try { await api.del('/vehicles/' + id); load(); } catch (e) { setErr(e.message); }
  };
  return (<>
    <h2>Vehicles</h2>
    <div className="bar"><input placeholder="Search name or plate..." value={q} onChange={e => setQ(e.target.value)} />
      <Link className="btn" to="/vehicles/new">+ Add Vehicle</Link></div>
    {err && <p className="err">{err}</p>}
    <table><thead><tr><th>Name</th><th>Plate</th><th>Type</th><th>₱/day</th><th>Status</th><th></th></tr></thead>
      <tbody>{list.map(v => <tr key={v._id}><td>{v.name}</td><td>{v.plate}</td><td>{v.type}</td><td>{v.pricePerDay}</td><td>{v.status}</td>
        <td><Link className="btn" to={`/vehicles/${v._id}/edit`}>Edit</Link> <button className="danger" onClick={() => remove(v._id)}>Delete</button></td></tr>)}
        {!list.length && <tr><td colSpan="6">No vehicles found.</td></tr>}</tbody></table>
  </>);
}