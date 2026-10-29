const r = require('express').Router();
const { Vehicle, Reservation } = require('../models');
const { requireAdmin } = require('../auth');

r.get('/', requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const [vehicles, available, active, upcoming, revenue] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'available' }),
      Reservation.countDocuments({ status: 'reserved', startDate: { $lte: now }, endDate: { $gte: now } }),
      Reservation.countDocuments({ status: 'reserved', startDate: { $gt: now } }),
      Reservation.aggregate([{ $match: { status: { $in: ['reserved', 'completed'] } } }, { $group: { _id: null, total: { $sum: { $add: ['$totalPrice', { $ifNull: ['$lateFee', 0] }] } } } }]),
    ]);
    res.json({ vehicles, available, active, upcoming, revenue: revenue[0]?.total || 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
r.get('/reports', requireAdmin, async (req, res) => {
  try {
    const live = { status: { $in: ['reserved', 'completed'] } };
    const [monthly, top] = await Promise.all([
      Reservation.aggregate([{ $match: live },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$startDate' } }, revenue: { $sum: '$totalPrice' }, bookings: { $sum: 1 } } },
        { $sort: { _id: 1 } }]),
      Reservation.aggregate([{ $match: live },
        { $group: { _id: '$vehicle', bookings: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
        { $sort: { bookings: -1 } }, { $limit: 5 },
        { $lookup: { from: 'vehicles', localField: '_id', foreignField: '_id', as: 'v' } },
        { $project: { bookings: 1, revenue: 1, name: { $arrayElemAt: ['$v.name', 0] } } }]),
    ]);
    res.json({ monthly: monthly.slice(-6), top });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
module.exports = r;