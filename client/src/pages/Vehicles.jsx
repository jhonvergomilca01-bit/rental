import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import VehicleCard from '../VehicleCard.jsx';
import { SkeletonGrid } from '../Skeleton.jsx';

export default function Vehicles() {
  const { isAdmin } = useAuth(), toast = useToast(), [sp] = useSearchParams();
  const [list, setList] = useState(null), [q, setQ] = useState(''), [err, setErr] = useState('');
  const [type, setType] = useState(sp.get('type') || '');
  const [start, setStart] = useState(sp.get('start') || ''), [end, setEnd] = useState(sp.get('end') || '');
  const [maxPrice, setMaxPrice] = useState(10000), [seats, setSeats] = useState(0), [trans, setTrans] = useState(''), [sort, setSort] = useState('price-asc');
  const dated = start && end;

  const load = () => {
    const qs = `search=${encodeURIComponent(q)}&type=${type}`;
    api.get(dated ? `/vehicles/available?start=${start}&end=${end}&${qs}` : `/vehicles?${qs}`)
      .then(l => { setList(l); setErr(''); }).catch(e => { setErr(e.message); setList([]); });
  };
  useEffect(() => { load(); }, [q, type, start, end]);
  const remove = async id => {
    if (!confirm('Delete this vehicle?')) return;
    try { await api.del('/vehicles/' + id); toast('Vehicle deleted'); load(); } catch (e) { setErr(e.message); }
  };
  const reset = () => { setQ(''); setType(''); setStart(''); setEnd(''); setMaxPrice(10000); setSeats(0); setTrans(''); };

  const shown = (list || [])
    .filter(v => v.pricePerDay <= maxPrice && (v.seats || 5) >= seats && (!trans || (v.transmission || 'automatic') === trans))
    .sort((a, b) => sort === 'price-asc' ? a.pricePerDay - b.pricePerDay : sort === 'price-desc' ? b.pricePerDay - a.pricePerDay : a.name.localeCompare(b.name));
  const qs = dated ? `?start=${start}&end=${end}` : '';

  return (<>
    <h2>Vehicles</h2>
    <div className="bar">
      <input placeholder="🔍 Search name or plate..." value={q} onChange={e => setQ(e.target.value)} />
      {isAdmin && <Link className="btn" to="/vehicles/new">+ Add Vehicle</Link>}
    </div>
    <div className="shop">
      <aside className="card filters">
        <h3>Filters</h3>
        <label>Pick up<input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
        <label>Return<input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
        <label>Type<select value={type} onChange={e => setType(e.target.value)}>
          <option value="">All types</option>{['car', 'van', 'motorcycle', 'truck'].map(t => <option key={t}>{t}</option>)}</select></label>
        <label>Max price per day: <b>{maxPrice >= 10000 ? 'Any' : '₱' + maxPrice.toLocaleString()}</b>
          <input type="range" min="500" max="10000" step="100" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} /></label>
        <label>Seats<select value={seats} onChange={e => setSeats(+e.target.value)}>
          <option value={0}>Any</option>{[2, 4, 6, 8].map(n => <option key={n} value={n}>{n}+</option>)}</select></label>
        <label>Transmission<select value={trans} onChange={e => setTrans(e.target.value)}>
          <option value="">Any</option><option>automatic</option><option>manual</option></select></label>
        <button className="ghost" onClick={reset}>Reset filters</button>
      </aside>

      <section>
        <div className="bar">
          <b>{list ? `${shown.length} vehicle${shown.length === 1 ? '' : 's'} found` : 'Loading...'}</b>
          <span style={{ flex: 1 }} />
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name</option></select>
        </div>
        {dated && !err && <p className="note">Free from {start} to {end}</p>}
        {err && <p className="err">{err}</p>}
        {!list && <SkeletonGrid />}
        <div className="grid">
          {shown.map(v => (
            <VehicleCard key={v._id} v={v} qs={qs}>
              {isAdmin && <div className="actions">
                <Link className="btn ghost" to={`/vehicles/${v._id}/edit`}>Edit</Link>
                <button className="danger" onClick={() => remove(v._id)}>Delete</button>
              </div>}
            </VehicleCard>
          ))}
        </div>
        {list && !shown.length && !err && <div className="card empty2"><span className="fallback">🔍</span><h3>No vehicles match</h3>
          <p>Try different dates or loosen the filters.</p><button onClick={reset}>Reset filters</button></div>}
      </section>
    </div>
  </>);
}