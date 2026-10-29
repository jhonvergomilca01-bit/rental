const r = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../User');
const { sign } = require('../auth');
const wrap = fn => (req, res) => fn(req, res).catch(e => res.status(400).json({ message: e.message }));
const out = u => ({ token: sign(u), user: { id: u._id, name: u.name, email: u.email, role: u.role } });

// anyone can register, but only as a customer
r.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || (password || '').length < 6) throw new Error('Name, email and a 6+ character password are required');
  if (await User.exists({ email: email.toLowerCase() })) throw new Error('Email already registered');
  res.status(201).json(out(await User.create({ name, email, password: await bcrypt.hash(password, 10) })));
}));

r.post('/login', wrap(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password)))
    return res.status(401).json({ message: 'Wrong email or password' });
  res.json(out(u));
}));
module.exports = r;