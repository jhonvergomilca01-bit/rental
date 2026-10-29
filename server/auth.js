const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('Set JWT_SECRET in server/.env');

const sign = u => jwt.sign({ id: u._id, role: u.role, name: u.name }, secret, { expiresIn: '7d' });

function requireAuth(req, res, next) {
  try { req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), secret); next(); }
  catch { res.status(401).json({ message: 'Please log in' }); }
}
const requireAdmin = [requireAuth, (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' })];

module.exports = { sign, requireAuth, requireAdmin };