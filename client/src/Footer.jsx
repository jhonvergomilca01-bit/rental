import { Link } from 'react-router-dom';
import { BRAND } from './brand.js';

export default function Footer() {
  return (
    <footer className="foot">
      <div><b>🚗 {BRAND.name}</b><p>Reliable vehicles for every trip.</p></div>
      <div><b>Explore</b><Link to="/vehicles">Vehicles</Link><Link to="/reservations">Reservations</Link><Link to="/calendar">Calendar</Link></div>
      <div><b>Contact</b><span>📍 {BRAND.address}</span><span>📞 {BRAND.phone}</span><span>🕗 {BRAND.hours}</span></div>
      <small>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</small>
    </footer>
  );
}