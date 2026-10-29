import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';

const ICON = { car: '🚗', van: '🚐', motorcycle: '🏍️', truck: '🛻' };
const TABS = ['all', 'reserved', 'completed', 'cancelled'];
const DAY = 864e5;

export default function Reservations() {
  const { isAdmin } = useAuth(), toast = useToast();
  const [list, setList] = useState([]), [q, setQ] = useState(''), [tab, setTab] = useState('all');
  const load = () => api.get('/reservations?search=' + encodeURIComponent(q)).then(setList);
  useEffect(() => { load(); }, [q]);
  const remove = async id => { if (confirm('Delete this reservation?')) { await api.del('/reservations/' + id); load(); } };
  const pay = async (id, payment) => { await api.put(`/reservations/${id}/payment`, { payment }); load(); };

  // suggested late fee: late days x daily rate x 1.5 (same rule as the server)
  const suggest = r => Math.round(Math.max(0, Math.ceil((Date.now() - (new Date(r.endDate).getTime() + DAY)) / DAY)) * (r.vehicle?.pricePerDay || 0) * 1.5);
  const giveBack = async r => {
    const fee = prompt(`Mark ${r.vehicle?.name} as returned.\nLate fee in ₱ (suggested ${suggest(r)}; enter 0 to waive):`, suggest(r));
    if (fee === null) return;
    try { await api.put(`/reservations/${r._id}/return`, { lateFee: fee }); toast('Marked as returned'); load(); }
    catch (e) { toast(e.message, 'bad'); }
  };

  const fmt = s => new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const count = t => list.filter(r => t === 'all' || r.status === t).length;
  const shown = list.filter(r => tab === 'all' || r.status === tab);
  const when = r => {
    if (r.status !== 'reserved') return null;
    const now = Date.now(), s = new Date(r.startDate), e = new Date(r.endDate);
    if (e.getTime() + DAY < now) return '⚠️ Overdue: not returned yet';
    if (s <= now && now < e) return '🟢 Active now';
    const n = Math.ceil((s - now) / DAY);
    return n > 0 ? `⏳ Starts in ${n} day${n > 1 ? 's' : ''}` : null;
  };

  return (<>
    <div className="bar head"><h2>Reservations</h2><Link className="btn" to="/reservations/new">+ New Reservation</Link></div>
    <div className="bar"><input placeholder="🔍 Search customer, contact, vehicle..." value={q} onChange={e => setQ(e.target.value)} /></div>
    <div className="tabs">
      {TABS.map(t => <button key={t} className={'tab ' + (tab === t ? 'on' : '')} onClick={() => setTab(t)}>{t} <span>{count(t)}</span></button>)}
    </div>
    <div className="tickets">
      {shown.map(r => {
        const days = Math.max(1, Math.round((new Date(r.endDate) - new Date(r.startDate)) / DAY));
        const p = r.payment || 'unpaid', fee = r.lateFee || 0;
        return (
          <div className={'ticket ' + r.status} key={r._id}>
            <div className="t-veh"><div className="icon">{ICON[r.vehicle?.type] || '🚗'}</div>
              <div><b>{r.vehicle?.name}</b><small>{r.vehicle?.plate}</small></div></div>
            <div><small>Customer</small><b>{r.customerName}</b><small>{r.contact}</small></div>
            <div><small>Rental period</small><b>{fmt(r.startDate)} → {fmt(r.endDate)}</b><span className="pill">{days} day{days > 1 ? 's' : ''}</span></div>
            <div className="t-end">
              <div className="price">₱{((r.totalPrice || 0) + fee).toLocaleString()}</div>
              {fee > 0 && <small className="fee">incl. ₱{fee.toLocaleString()} late fee</small>}
              <span className={'badge ' + r.status}>{r.status}</span>
              <span className={'badge ' + p}>{p}</span>
              {when(r) && <small>{when(r)}</small>}
            </div>
            <div className="t-act">
              {isAdmin && r.status === 'reserved' && <button onClick={() => giveBack(r)}>✅ Returned</button>}
              <Link className="btn ghost" to={`/receipt/${r._id}`}>🧾 Receipt</Link>
              {isAdmin && <select className="pay" value={p} onChange={e => pay(r._id, e.target.value)}>
                <option>unpaid</option><option>deposit</option><option>paid</option></select>}
              <Link className="btn ghost" to={`/reservations/${r._id}/edit`}>Edit</Link>
              <button className="danger" onClick={() => remove(r._id)}>Delete</button>
            </div>
          </div>
        );
      })}
    </div>
    {!shown.length && <div className="card empty">📭 No reservations here yet.</div>}
  </>);
}