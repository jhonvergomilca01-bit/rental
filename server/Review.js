const { Schema, model } = require('mongoose');
const s = new Schema({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
}, { timestamps: true });
s.index({ vehicle: 1, user: 1 }, { unique: true });   // one review per customer per vehicle
module.exports = model('Review', s);