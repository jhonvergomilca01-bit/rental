import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';

const METHODS = [['cash', '💵', 'Pay at pickup'], ['gcash', '📱', 'GCash'], ['card', '💳', 'Credit / debit card']];
const STEPS = ['Details', 'Payment', 'Confirm'];

export default function Checkout() {
  const { id } = useParams(), [sp] = useSearchParams(), nav = useNavigate(), { user } = useAuth(), toast = useToast();
  const [v, setV] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const [f, setF] = useState({ customerName: user.name, contact: '', startDate: sp.get('start') || '', endDate: sp.get('end') || '', method: 'cash' });
  useEffect(() => { api.get('/vehicles/' + id).then(setV); }, [id]);
  if (!v) return <p>Loading...</p>;

  const set = k => e => setF({ ...f, [k]: e.target.value });
  const days = f.startDate && f.endDate ? Math.ceil((new Date(f.endDate) - new Date(f.startDate)) / 864e5) : 0;
  const total = Math.max(days, 0) * v.pricePerDay;
  const money = n => '₱' + n.toLocaleString();
  const step = busy ? 3 : f.customerName.trim() && f.contact.trim() && days > 0 ? 2 : 1;

  const submit = async e => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { const r = await api.post('/reservations', { ...f, vehicle: id }); toast('Booking confirmed!'); nav('/receipt/' + r._id); }
    catch (x) { setErr(x.message); setBusy(false); }
  };

  return (<>
    <h2>Checkout</h2>
    <div className="stepper">{STEPS.map((s, i) => (
      <div key={s} className={'st' + (step > i + 1 ? ' done' : '') + (step === i + 1 ? ' now' : '')}><span>{step > i + 1 ? '✓' : i + 1}</span>{s}</div>))}</div>
    <div className="checkout">
      <form className="card" onSubmit={submit}>
        <h3>Your details</h3>
        <input placeholder="Full name" value={f.customerName} onChange={set('customerName')} required />
        <input placeholder="Contact number" value={f.contact} onChange={set('contact')} required />
        <div className="bar">
          <label>Pick up<input type="date" value={f.startDate} onChange={set('startDate')} required /></label>
          <label>Return<input type="date" value={f.endDate} onChange={set('endDate')} required /></label>
        </div>
        <h3>Payment method</h3>
        <div className="methods">{METHODS.map(([k, icon, label]) => (
          <label key={k} className={'method ' + (f.method === k ? 'on' : '')}>
            <input type="radio" name="method" checked={f.method === k} onChange={() => setF({ ...f, method: k })} />{icon} {label}</label>))}
        </div>
        {err && <p className="err">{err}</p>}
        <button disabled={days < 1 || busy}>{busy ? 'Booking…' : `Confirm booking · ${money(total)}`}</button>
        <small>Demo only: no real payment is taken.</small>
      </form>
      <div className="card summary">
        <h3>Booking summary</h3>
        <b>{v.name}</b><span className="plate">{v.plate}</span>
        <div className="row"><span>Daily rate</span><span>{money(v.pricePerDay)}</span></div>
        <div className="row"><span>Days</span><span>{days > 0 ? days : '-'}</span></div>
        <div className="row"><span>Deposit to secure (20%)</span><span>{money(Math.round(total * 0.2))}</span></div>
        <div className="row total"><span>Total</span><span>{money(total)}</span></div>
      </div>
    </div>
  </>);
}