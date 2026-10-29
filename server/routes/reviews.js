const r = require('express').Router();
const { Reservation } = require('../models');
const Review = require('../Review');
const { requireAuth } = require('../auth');
r.use(requireAuth);
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ message: e.message }));

// a customer may review a vehicle only after one of their trips with it has ended
const finishedTrip = (user, vehicle) =>
  Reservation.exists({ user, vehicle, status: { $ne: 'cancelled' }, endDate: { $lt: new Date() } });

r.get('/:vehicleId', wrap(async (req, res) => {
  const reviews = await Review.find({ vehicle: req.params.vehicleId }).sort('-createdAt').lean();
  const avg = reviews.length ? reviews.reduce((s, x) => s + x.rating, 0) / reviews.length : 0;
  res.json({ reviews, avg: Math.round(avg * 10) / 10, canReview: !!(await finishedTrip(req.user.id, req.params.vehicleId)) });
}));

r.post('/:vehicleId', wrap(async (req, res) => {
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) throw new Error('Choose 1 to 5 stars');
  if (!(await finishedTrip(req.user.id, req.params.vehicleId))) throw new Error('You can review a vehicle after your trip ends');
  res.status(201).json(await Review.findOneAndUpdate(
    { vehicle: req.params.vehicleId, user: req.user.id },
    { rating, comment: String(req.body.comment || '').slice(0, 300), userName: req.user.name },
    { upsert: true, new: true }));
}));
module.exports = r;