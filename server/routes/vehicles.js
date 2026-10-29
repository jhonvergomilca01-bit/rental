const r = require('express').Router();
const { Vehicle, Reservation } = require('../models');
const { requireAdmin } = require('../auth');
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ message: e.message }));

const filters = ({ search, type, status }) => {
  const f = {};
  if (search) { const rx = new RegExp(search, 'i'); f.$or = [{ name: rx }, { plate: rx }]; }
  if (type) f.type = type;
  if (status) f.status = status;
  return f;
};

r.get('/', wrap(async (req, res) => res.json(await Vehicle.find(filters(req.query)).sort('-createdAt'))));

// GET /api/vehicles/available?start=2026-11-01&end=2026-11-05  (must stay above /:id)
r.get('/available', wrap(async (req, res) => {
  const s = new Date(req.query.start), e = new Date(req.query.end);
  if (isNaN(s) || isNaN(e) || e <= s) throw new Error('Pick valid dates (return must be after pick up)');
  const busy = await Reservation.distinct('vehicle', { status: 'reserved', startDate: { $lt: e }, endDate: { $gt: s } });
  res.json(await Vehicle.find({ ...filters({ ...req.query, status: 'available' }), _id: { $nin: busy } }).sort('pricePerDay'));
}));

// GET /api/vehicles/:id/booked -> upcoming booked date ranges (no customer info)
r.get('/:id/booked', wrap(async (req, res) => {
  res.json(await Reservation.find({ vehicle: req.params.id, status: 'reserved', endDate: { $gt: new Date() } })
    .select('startDate endDate -_id').sort('startDate'));
}));
r.get('/:id', wrap(async (req, res) => res.json(await Vehicle.findById(req.params.id))));
r.post('/', requireAdmin, wrap(async (req, res) => res.status(201).json(await Vehicle.create(req.body))));
r.put('/:id', requireAdmin, wrap(async (req, res) => res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
r.delete('/:id', requireAdmin, wrap(async (req, res) => {
  if (await Reservation.exists({ vehicle: req.params.id, status: 'reserved' }))
    return res.status(409).json({ message: 'Vehicle has active reservations' });
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));
module.exports = r;