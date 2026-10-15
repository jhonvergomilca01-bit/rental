const r = require('express').Router();
const { Vehicle, Reservation } = require('../models');
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ message: e.message }));

// validates dates, blocks double-booking, computes price
async function prepare(body, id) {
  const s = new Date(body.startDate), e = new Date(body.endDate);
  if (!(e > s)) throw new Error('End date must be after start date');
  const v = await Vehicle.findById(body.vehicle);
  if (!v || v.status !== 'available') throw new Error('Vehicle not available');
  const clash = await Reservation.exists({ vehicle: v._id, status: 'reserved', _id: { $ne: id }, startDate: { $lt: e }, endDate: { $gt: s } });
  if (clash) throw new Error('Vehicle already booked for those dates');
  return { ...body, totalPrice: Math.ceil((e - s) / 864e5) * v.pricePerDay };
}

// GET /api/reservations?search=juan&status=reserved -> search by customer, contact, vehicle name/plate
r.get('/', wrap(async (req, res) => {
  const { search, status } = req.query, f = {};
  if (status) f.status = status;
  if (search) {
    const rx = new RegExp(search, 'i');
    const ids = (await Vehicle.find({ $or: [{ name: rx }, { plate: rx }] })).map(v => v._id);
    f.$or = [{ customerName: rx }, { contact: rx }, { vehicle: { $in: ids } }];
  }
  res.json(await Reservation.find(f).populate('vehicle').sort('-startDate'));
}));
r.get('/:id', wrap(async (req, res) => res.json(await Reservation.findById(req.params.id))));
r.post('/', wrap(async (req, res) => res.status(201).json(await Reservation.create(await prepare(req.body)))));
r.put('/:id', wrap(async (req, res) => res.json(await Reservation.findByIdAndUpdate(req.params.id, await prepare(req.body, req.params.id), { new: true }))));
r.delete('/:id', wrap(async (req, res) => { await Reservation.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));
module.exports = r;