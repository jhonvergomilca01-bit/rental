import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function VehicleForm() {
  const { id } = useParams(), nav = useNavigate(), [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', plate: '', type: 'car', pricePerDay: '', status: 'available' });
  useEffect(() => { if (id) api.get('/vehicles/' + id).then(setF); }, [id]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try { id ? await api.put('/vehicles/' + id, f) : await api.post('/vehicles', f); nav('/'); } catch (x) { setErr(x.message); }
  };
  return (<>
    <h2>{id ? 'Edit' : 'Add'} Vehicle</h2>
    <form onSubmit={submit}>
      <input placeholder="Name (e.g. Toyota Vios)" value={f.name} onChange={set('name')} required />
      <input placeholder="Plate number" value={f.plate} onChange={set('plate')} required />
      <select value={f.type} onChange={set('type')}>{['car', 'van', 'motorcycle', 'truck'].map(t => <option key={t}>{t}</option>)}</select>
      <input type="number" min="0" placeholder="Price per day" value={f.pricePerDay} onChange={set('pricePerDay')} required />
      <select value={f.status} onChange={set('status')}><option>available</option><option>maintenance</option></select>
      {err && <p className="err">{err}</p>}
      <button>Save</button>
    </form>
  </>);
}