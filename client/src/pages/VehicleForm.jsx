import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../toast.jsx';

const opt = a => a.map(x => <option key={x}>{x}</option>);

export default function VehicleForm() {
  const { id } = useParams(), nav = useNavigate(), toast = useToast(), [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', plate: '', type: 'car', pricePerDay: '', status: 'available', image: '', seats: 5, transmission: 'automatic', fuel: 'gasoline' });
  useEffect(() => { if (id) api.get('/vehicles/' + id).then(v => setF(old => ({ ...old, ...v }))); }, [id]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    try { id ? await api.put('/vehicles/' + id, f) : await api.post('/vehicles', f); toast('Vehicle saved'); nav('/vehicles'); }
    catch (x) { setErr(x.message); }
  };
  return (<>
    <h2>{id ? 'Edit' : 'Add'} Vehicle</h2>
    <form onSubmit={submit}>
      <input placeholder="Name (e.g. Toyota Vios)" value={f.name} onChange={set('name')} required />
      <input placeholder="Plate number" value={f.plate} onChange={set('plate')} required />
      <input placeholder="Photo link (https://... or /cars/vios.jpg)" value={f.image || ''} onChange={set('image')} />
      <select value={f.type} onChange={set('type')}>{opt(['car', 'van', 'motorcycle', 'truck'])}</select>
      <input type="number" min="0" placeholder="Price per day" value={f.pricePerDay} onChange={set('pricePerDay')} required />
      <input type="number" min="1" placeholder="Seats" value={f.seats} onChange={set('seats')} />
      <select value={f.transmission} onChange={set('transmission')}>{opt(['automatic', 'manual'])}</select>
      <select value={f.fuel} onChange={set('fuel')}>{opt(['gasoline', 'diesel', 'electric', 'hybrid'])}</select>
      <select value={f.status} onChange={set('status')}>{opt(['available', 'maintenance'])}</select>
      {err && <p className="err">{err}</p>}
      <button>Save</button>
    </form>
  </>);
}