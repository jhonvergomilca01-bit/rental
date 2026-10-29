import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function Receipt() {
  const { id } = useParams(), [r, setR] = useState(null), [v, setV] = useState(null);
  useEffect(() => { api.get('/reservations/' + id).then(res => { setR(res); api.get('/vehicles/' + res.vehicle).then(setV); }); }, [id]);
  if (!r || !v) return <p>Loading...</p>;
  const d = s => new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const days = Math.round((new Date(r.endDate) - new Date(r.startDate)) / 864e5);
  const row = (a, b) => <tr key={a}><td>{a}</td><td><b>{b}</b></td></tr>;
  return (<>
    <div className="card receipt">
      <h2>🚗 RentGo Receipt</h2>
      <small>Reservation #{r._id.slice(-6).toUpperCase()}</small>
      <table><tbody>
        {row('Customer', r.customerName)}{row('Contact', r.contact)}
        {row('Vehicle', `${v.name} (${v.plate})`)}
        {row('Pick up', d(r.startDate))}{row('Return', d(r.endDate))}
        {row('Days', days)}{row('Rate per day', '₱' + v.pricePerDay.toLocaleString())}
        {r.lateFee > 0 && row('Late fee', '₱' + r.lateFee.toLocaleString())}
        {row('Total', '₱' + (r.totalPrice + (r.lateFee || 0)).toLocaleString())}
        {row('Payment', (r.payment || 'unpaid').toUpperCase())}
      </tbody></table>
    </div>
    <div className="bar noprint" style={{ justifyContent: 'center' }}><button onClick={() => window.print()}>🖨️ Print receipt</button></div>
  </>);
}