const r = require('express').Router();
const { Vehicle, Reservation } = require('../models');
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ message: e.message }));

// GET /api/vehicles?search=toyota&type=car&status=available  -> list + search/filter
r.get('/', wrap(async (req, res) => {
  const { search, type, status } = req.query, f = {};
  if (search) { const rx = new RegExp(search, 'i'); f.$or = [{ name: rx }, { plate: rx }]; }
  if (type) f.type = type;
  if (status) f.status = status;
  res.json(await Vehicle.find(f).sort('-createdAt'));
}));
r.get('/:id', wrap(async (req, res) => res.json(await Vehicle.findById(req.params.id))));   // one vehicle (edit form)
r.post('/', wrap(async (req, res) => res.status(201).json(await Vehicle.create(req.body)))); // add
r.put('/:id', wrap(async (req, res) => res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })))); // edit
r.delete('/:id', wrap(async (req, res) => {                                                  // delete
  if (await Reservation.exists({ vehicle: req.params.id, status: 'reserved' }))
    return res.status(409).json({ message: 'Vehicle has active reservations' });
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));
module.exports = r;