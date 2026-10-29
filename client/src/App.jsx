import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import { ToastProvider } from './toast.jsx';
import { FavoritesProvider } from './favorites.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Reports from './pages/Reports.jsx';
import Receipt from './pages/Receipt.jsx';
import Calendar from './pages/Calendar.jsx';
import Vehicles from './pages/Vehicles.jsx';
import VehicleDetails from './pages/VehicleDetails.jsx';
import VehicleForm from './pages/VehicleForm.jsx';
import Checkout from './pages/Checkout.jsx';
import Reservations from './pages/Reservations.jsx';
import ReservationForm from './pages/ReservationForm.jsx';
import Profile from './pages/Profile.jsx';
import ChatWidget from './ChatWidget.jsx';
import Footer from './Footer.jsx';

function Guard({ children, admin }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (admin && !isAdmin) return <Navigate to="/" />;
  return children;
}

const Item = ({ to, icon, end, children }) => <NavLink to={to} end={end}><span>{icon}</span>{children}</NavLink>;

function Shell() {
  const { user, isAdmin, logout } = useAuth();
  const G = ({ el, admin }) => <Guard admin={admin}>{el}</Guard>;
  return (
    <div className={'app' + (user ? ' with-side' : '')}>
      {user && (
        <aside className="side">
          <b className="brand">🚗 RentGo</b>
          <div className="label">Menu</div>
          <Item to="/" end icon="🏠">Home</Item>
          <Item to="/vehicles" icon="🚘">Vehicles</Item>
          <Item to="/reservations" icon="🧾">Reservations</Item>
          <Item to="/calendar" icon="📅">Calendar</Item>
          {!isAdmin && <Item to="/profile" icon="👤">My Profile</Item>}
          {isAdmin && <>
            <div className="label">Admin</div>
            <Item to="/dashboard" icon="📊">Dashboard</Item>
            <Item to="/reports" icon="📈">Reports</Item>
          </>}
          <span className="grow" />
          <div className="me"><i>{user.name[0].toUpperCase()}</i><div><b>{user.name}</b><small>{user.role}</small></div></div>
          <button className="out" onClick={logout}>Log out</button>
        </aside>
      )}
      <div className="content">
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<G el={<Home />} />} />
            <Route path="/vehicles" element={<G el={<Vehicles />} />} />
            <Route path="/vehicles/new" element={<G admin el={<VehicleForm />} />} />
            <Route path="/vehicles/:id" element={<G el={<VehicleDetails />} />} />
            <Route path="/vehicles/:id/edit" element={<G admin el={<VehicleForm />} />} />
            <Route path="/checkout/:id" element={<G el={<Checkout />} />} />
            <Route path="/reservations" element={<G el={<Reservations />} />} />
            <Route path="/reservations/new" element={<G el={<ReservationForm />} />} />
            <Route path="/reservations/:id/edit" element={<G el={<ReservationForm />} />} />
            <Route path="/receipt/:id" element={<G el={<Receipt />} />} />
            <Route path="/calendar" element={<G el={<Calendar />} />} />
            <Route path="/profile" element={isAdmin ? <Navigate to="/" /> : <G el={<Profile />} />} />
            <Route path="/dashboard" element={<G admin el={<Dashboard />} />} />
            <Route path="/reports" element={<G admin el={<Reports />} />} />
          </Routes>
        </main>
        {user && <Footer />}
      </div>
      {user && <ChatWidget />}
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AuthProvider><ToastProvider><FavoritesProvider><Shell /></FavoritesProvider></ToastProvider></AuthProvider></BrowserRouter>;
}