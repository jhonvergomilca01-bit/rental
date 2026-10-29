import { useEffect, useState } from 'react';
import { api } from '../api.js';

const key = d => new Date(d).toLocaleDateString('en-CA');   // local YYYY-MM-DD

export default function Calendar() {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [list, setList] = useState([]);
  useEffect(() => { api.get('/reservations?status=reserved').then(setList); }, []);
  const y = month.getFullYear(), m = month.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(month.getDay()).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const on = d => { const k = key(new Date(y, m, d)); return list.filter(r => key(r.startDate) <= k && k < key(r.endDate)); };
  const move = n => setMonth(new Date(y, m + n, 1));
  return (<>
    <h2>Booking Calendar</h2>
    <div className="bar"><button onClick={() => move(-1)}>‹</button>
      <strong>{month.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
      <button onClick={() => move(1)}>›</button></div>
    <div className="cal">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <b key={d}>{d}</b>)}
      {cells.map((d, i) => <div key={i} className={d ? 'day' : ''}>
        {d && <><span>{d}</span>{on(d).map(r => <small key={r._id} className="chip">{r.vehicle?.name}</small>)}</>}</div>)}
    </div>
  </>);
}