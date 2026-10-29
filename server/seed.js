require('dotenv').config();
const mongoose = require('mongoose');
const { Vehicle, Reservation } = require('./models');

// date helper: day(0) = today, day(3) = 3 days from now, day(-5) = 5 days ago
const day = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return d; };

const vehicles = [
  { name: 'Toyota Vios',      plate: 'ABC-1234', type: 'car',        pricePerDay: 1500 },
  { name: 'Honda City',       plate: 'DEF-5678', type: 'car',        pricePerDay: 1800 },
  { name: 'Mitsubishi Mirage', plate: 'GHI-9012', type: 'car',       pricePerDay: 1300 },
  { name: 'Toyota HiAce',     plate: 'VAN-3456', type: 'van',        pricePerDay: 3000 },
  { name: 'Nissan Urvan',     plate: 'VAN-7890', type: 'van',        pricePerDay: 2800, status: 'maintenance' },
  { name: 'Honda Click 160',  plate: 'MTR-1111', type: 'motorcycle', pricePerDay: 500 },
  { name: 'Yamaha NMAX',      plate: 'MTR-2222', type: 'motorcycle', pricePerDay: 650 },
  { name: 'Isuzu D-Max',      plate: 'TRK-4444', type: 'truck',      pricePerDay: 3500 },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_rental');

  const reset = process.argv.includes('--reset');
  if (!reset && (await Vehicle.estimatedDocumentCount()) > 0) {
    console.log('Database already has data, nothing changed.');
    console.log('To wipe it and reseed, run: npm run seed -- --reset');
    return process.exit();
  }

  await Promise.all([Vehicle.deleteMany(), Reservation.deleteMany()]);
  const saved = await Vehicle.insertMany(vehicles);
  const by = Object.fromEntries(saved.map(v => [v.plate, v]));

  // book(plate, customer, contact, startOffset, endOffset, status)
  const book = (plate, customerName, contact, from, to, status = 'reserved') => ({
    customerName, contact, status,
    vehicle: by[plate]._id,
    startDate: day(from),
    endDate: day(to),
    totalPrice: (to - from) * by[plate].pricePerDay,
  });

  await Reservation.insertMany([
    book('ABC-1234', 'Juan Dela Cruz',  '09171234567', -10, -7, 'completed'),
    book('ABC-1234', 'Maria Santos',    '09181234567',   2,  5),
    book('DEF-5678', 'Pedro Reyes',     '09191234567',   0,  3),
    book('GHI-9012', 'Ana Villanueva',  '09201234567',   1,  4, 'cancelled'),
    book('VAN-3456', 'Carlos Mendoza',  '09211234567',   7, 10),
    book('MTR-1111', 'Liza Ramos',      '09221234567',  -5, -3, 'completed'),
    book('MTR-1111', 'Mark Bautista',   '09231234567',   1,  3),
    book('TRK-4444', 'Rosa Garcia',     '09241234567',  14, 17),
  ]);

  console.log(`Seeded ${saved.length} vehicles and 8 reservations.`);
  process.exit();
})().catch(e => { console.error(e); process.exit(1); });