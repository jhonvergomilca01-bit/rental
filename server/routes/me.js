const r = require('express').Router();
const User = require('../User');
const { requireAuth } = require('../auth');
r.use(requireAuth);
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ message: e.message }));

// GET /api/me/favorites -> list of favorite vehicle ids
r.get('/favorites', wrap(async (req, res) => res.json((await User.findById(req.user.id)).favorites || [])));

// POST /api/me/favorites/:vehicleId -> adds or removes it, returns the new list
r.post('/favorites/:vehicleId', wrap(async (req, res) => {
  const u = await User.findById(req.user.id), id = req.params.vehicleId;
  const has = (u.favorites || []).some(f => String(f) === id);
  u.favorites = has ? u.favorites.filter(f => String(f) !== id) : [...(u.favorites || []), id];
  await u.save();
  res.json(u.favorites);
}));
module.exports = r;