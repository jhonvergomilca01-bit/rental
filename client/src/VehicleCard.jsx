import { Link } from 'react-router-dom';
import { useFavorites } from './favorites.jsx';

export const ICON = { car: '🚗', van: '🚐', motorcycle: '🏍️', truck: '🛻' };

export default function VehicleCard({ v, qs = '', children }) {
  const { ids, toggle } = useFavorites(), fav = ids.includes(String(v._id));
  return (
    <div className="card vcard photo">
      <button className="heart" title={fav ? 'Remove from favorites' : 'Save to favorites'} onClick={() => toggle(v._id)}>{fav ? '❤️' : '🤍'}</button>
      <Link to={`/vehicles/${v._id}${qs}`} className="pic">
        <span className="fallback">{ICON[v.type]}</span>
        {v.image && <img src={v.image} alt={v.name} onError={e => { e.target.style.display = 'none'; }} />}
        <span className={'badge ' + v.status}>{v.status}</span>
      </Link>
      <h3>{v.name}</h3>
      <small>👥 {v.seats || 5} seats · ⚙️ {v.transmission || 'automatic'} · ⛽ {v.fuel || 'gasoline'}</small>
      <div className="price">₱{v.pricePerDay.toLocaleString()} <small>/ day</small></div>
      <Link className="btn" to={`/vehicles/${v._id}${qs}`}>View details</Link>
      {children}
    </div>
  );
}