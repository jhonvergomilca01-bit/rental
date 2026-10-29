import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { BRAND } from '../brand.js';

const PERKS = [['🚘', 'Cars, vans, motorcycles and trucks'], ['📅', 'See live availability before you book'], ['🧾', 'Instant confirmation and printable receipts']];

export default function Login() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login'), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [show, setShow] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  if (user) return <Navigate to={user.role === 'admin' ? '/dashboard' : '/'} replace />;

  const isLogin = mode === 'login';
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const switchMode = m => { setMode(m); setErr(''); };
  const submit = async e => {
    e.preventDefault();
    setErr('');
    if (!isLogin && f.password !== f.confirm) return setErr('Passwords do not match');
    setBusy(true);
    try { isLogin ? await login(f.email, f.password) : await register(f.name, f.email, f.password); }
    catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <div className="login">
      <section className="login-art">
        <b className="brand">🚗 {BRAND.name}</b>
        <div>
          <h1>Your next trip<br />starts here.</h1>
          <p>Reliable vehicles, simple booking.</p>
          <ul>{PERKS.map(([i, t]) => <li key={t}><span>{i}</span>{t}</li>)}</ul>
        </div>
        <small>© {new Date().getFullYear()} {BRAND.name}</small>
      </section>

      <section className="login-form">
        <div className="login-box">
          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="sub2">{isLogin ? 'Log in to manage your bookings.' : 'Sign up to book your first vehicle.'}</p>
          <div className="seg">
            <button type="button" className={isLogin ? 'on' : ''} onClick={() => switchMode('login')}>Log in</button>
            <button type="button" className={!isLogin ? 'on' : ''} onClick={() => switchMode('register')}>Sign up</button>
          </div>
          <form onSubmit={submit}>
            {!isLogin && <div className="fld"><span>👤</span><input placeholder="Full name" autoComplete="name" value={f.name} onChange={set('name')} required /></div>}
            <div className="fld"><span>✉️</span><input type="email" placeholder="Email address" autoComplete="email" value={f.email} onChange={set('email')} required /></div>
            <div className="fld"><span>🔒</span>
              <input type={show ? 'text' : 'password'} placeholder="Password (6+ characters)" autoComplete={isLogin ? 'current-password' : 'new-password'}
                minLength={isLogin ? undefined : 6} value={f.password} onChange={set('password')} required />
              <button type="button" className="eye" onClick={() => setShow(!show)} title="Show or hide password">{show ? '🙈' : '👁'}</button></div>
            {!isLogin && <div className="fld"><span>🔒</span><input type={show ? 'text' : 'password'} placeholder="Confirm password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} required /></div>}
            {err && <p className="err shake" key={err}>{err}</p>}
            <button className="go" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
          </form>
        </div>
      </section>
    </div>
  );
}