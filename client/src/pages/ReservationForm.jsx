import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ReservationForm() {
  const { id } = useParams(), nav = useNavigate(), [err, setErr] = useState(''), [vehicles, setVehicles] = useState([]);
  const [f, setF] = useState({ customerName: '', contact: '', vehicle: '', startDate: '', endDate: '', status: 'reserved' });
  const day = s => (s ? s.slice(0, 10) : '');
  useEffect(() => {
    api.get('/vehicles?status=available').then(setVehicles);
    if (id) api.get('/reservations/' + id).then(r => setF({ ...r, startDate: day(r.startDate), endDate: day(r.endDate) }));
  }, [id]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try { id ? await api.put('/reservations/' + id, f) : await api.post('/reservations', f); nav('/reservations'); } catch (x) { setErr(x.message); }
  };
  return (<>
    <h2>{id ? 'Edit' : 'New'} Reservation</h2>
    <form onSubmit={submit}>
      <input placeholder="Customer name" value={f.customerName} onChange={set('customerName')} required />
      <input placeholder="Contact number" value={f.contact} onChange={set('contact')} required />
      <select value={f.vehicle} onChange={set('vehicle')} required><option value="">Select vehicle</option>
        {vehicles.map(v => <option key={v._id} value={v._id}>{v.name} – {v.plate} (₱{v.pricePerDay}/day)</option>)}</select>
      <label>Start <input type="date" value={f.startDate} onChange={set('startDate')} required /></label>
      <label>End <input type="date" value={f.endDate} onChange={set('endDate')} required /></label>
      <select value={f.status} onChange={set('status')}><option>reserved</option><option>completed</option><option>cancelled</option></select>
      {err && <p className="err">{err}</p>}
      <button>Save</button>
    </form>
  </>);
}
//   cd server
// npm stcart
//   cd client
  // npm run dev