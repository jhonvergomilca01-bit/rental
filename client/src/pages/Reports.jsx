import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Reports() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/stats/reports').then(setD); }, []);
  if (!d) return <p>Loading...</p>;
  const max = Math.max(1, ...d.monthly.map(m => m.revenue)), topMax = Math.max(1, ...d.top.map(t => t.bookings));

  const exportCsv = async () => {
    const rows = await api.get('/reservations');
    const head = ['Customer', 'Contact', 'Vehicle', 'Plate', 'Start', 'End', 'Total', 'Status', 'Payment'];
    const lines = rows.map(r => [r.customerName, r.contact, r.vehicle?.name, r.vehicle?.plate, r.startDate.slice(0, 10),
      r.endDate.slice(0, 10), r.totalPrice, r.status, r.payment || 'unpaid'].map(x => `"${x ?? ''}"`).join(','));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' }));
    a.download = 'reservations.csv'; a.click();
  };

  return (<>
    <div className="bar head"><h2>Reports</h2><button onClick={exportCsv}>⬇ Export CSV</button></div>
    <div className="card"><h3>Revenue by month</h3>
      <div className="chart">
        {d.monthly.map(m => <div className="col" key={m._id}><small>₱{m.revenue.toLocaleString()}</small>
          <div className="barv" style={{ height: (m.revenue / max) * 160 + 'px' }} /><b>{m._id}</b></div>)}
        {!d.monthly.length && <p>No data yet.</p>}
      </div></div>
    <div className="card" style={{ marginTop: 16 }}><h3>Most booked vehicles</h3>
      {d.top.map(t => <div className="hrow" key={t._id}><span>{t.name}</span>
        <div className="hbar"><i style={{ width: (t.bookings / topMax) * 100 + '%' }} /></div><b>{t.bookings}</b></div>)}
    </div>
  </>);
}