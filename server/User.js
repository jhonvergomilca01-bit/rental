const { Schema, model } = require('mongoose');
module.exports = model('User', new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
}, { timestamps: true }));