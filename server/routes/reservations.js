const r = require('express').Router();
const { Vehicle, Reservation } = require('../models');
const { requireAuth, requireAdmin } = require('../auth');
const User = require('../User');
const { sendMail, bookingEmail } = require('../mailer');
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ message: e.message }));
const isAdmin = req => req.user.role === 'admin';
r.use(requireAuth);

async function prepare(body, id) {
  const { user, _id, totalPrice, payment, lateFee, returnedAt, ...data } = body;   // never trust these from the client
  const s = new Date(data.startDate), e = new Date(data.endDate);
  if (!(e > s)) throw new Error('End date must be after start date');
  const v = await Vehicle.findById(data.vehicle);
  if (!v || v.status !== 'available') throw new Error('Vehicle not available');
  const clash = await Reservation.exists({ vehicle: v._id, status: 'reserved', _id: { $ne: id }, startDate: { $lt: e }, endDate: { $gt: s } });
  if (clash) throw new Error('Vehicle already booked for those dates');
  return { ...data, totalPrice: Math.ceil((e - s) / 864e5) * v.pricePerDay };
}

async function owned(req) {
  const doc = await Reservation.findById(req.params.id);
  if (!doc) throw new Error('Reservation not found');
  if (!isAdmin(req) && String(doc.user) !== req.user.id) throw new Error('Not your reservation');
  return doc;
}

r.get('/', wrap(async (req, res) => {
  const { search, status } = req.query, f = {};
  if (!isAdmin(req)) f.user = req.user.id;
  if (status) f.status = status;
  if (search) {
    const rx = new RegExp(search, 'i');
    const ids = (await Vehicle.find({ $or: [{ name: rx }, { plate: rx }] })).map(v => v._id);
    f.$or = [{ customerName: rx }, { contact: rx }, { vehicle: { $in: ids } }];
  }
  res.json(await Reservation.find(f).populate('vehicle').sort('-startDate'));
}));
r.get('/:id', wrap(async (req, res) => res.json(await owned(req))));
r.post('/', wrap(async (req, res) => {
  const data = await prepare(req.body);
  const doc = await Reservation.create({ ...data, user: req.user.id, ...(isAdmin(req) ? {} : { status: 'reserved' }) });
  res.status(201).json(doc);
  // email in the background; failures are only logged, never shown to the customer
  Promise.all([User.findById(req.user.id), Vehicle.findById(doc.vehicle)])
    .then(([u, vehicle]) => u && vehicle && sendMail(u.email, 'Your RentGo booking is confirmed', bookingEmail({ name: u.name, vehicle, r: doc })))
    .catch(e => console.error('Email error:', e.message));
}));
// admin marks a vehicle as returned; late fee = late days x daily rate x LATE_RATE (admin can override or waive)
const LATE_RATE = 1.5;
const lateDays = r => Math.max(0, Math.ceil((Date.now() - (new Date(r.endDate).getTime() + 864e5)) / 864e5));
r.put('/:id/return', requireAdmin, wrap(async (req, res) => {
  const doc = await Reservation.findById(req.params.id).populate('vehicle');
  if (!doc) throw new Error('Reservation not found');
  if (doc.status !== 'reserved') throw new Error('Only active reservations can be marked as returned');
  const given = req.body.lateFee;
  const fee = given !== undefined && given !== '' ? Number(given) : Math.round(lateDays(doc) * (doc.vehicle?.pricePerDay || 0) * LATE_RATE);
  if (!(fee >= 0)) throw new Error('Late fee must be 0 or more');
  doc.status = 'completed'; doc.returnedAt = new Date(); doc.lateFee = fee;
  await doc.save();
  res.json(doc);
}));
r.put('/:id/payment', requireAdmin, wrap(async (req, res) => {      // admin sets unpaid / deposit / paid
  if (!['unpaid', 'deposit', 'paid'].includes(req.body.payment)) throw new Error('Invalid payment status');
  res.json(await Reservation.findByIdAndUpdate(req.params.id, { payment: req.body.payment }, { new: true }));
}));
r.put('/:id', wrap(async (req, res) => {
  await owned(req);
  res.json(await Reservation.findByIdAndUpdate(req.params.id, await prepare(req.body, req.params.id), { new: true }));
}));
r.delete('/:id', wrap(async (req, res) => { await owned(req); await Reservation.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
module.exports = r;