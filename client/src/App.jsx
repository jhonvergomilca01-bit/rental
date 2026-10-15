import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Vehicles from './pages/Vehicles.jsx';
import VehicleForm from './pages/VehicleForm.jsx';
import Reservations from './pages/Reservations.jsx';
import ReservationForm from './pages/ReservationForm.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav><NavLink to="/">Vehicles</NavLink><NavLink to="/reservations">Reservations</NavLink></nav>
      <main>
        <Routes>
          <Route path="/" element={<Vehicles />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reservations/new" element={<ReservationForm />} />
          <Route path="/reservations/:id/edit" element={<ReservationForm />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}