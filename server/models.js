const { Schema, model } = require('mongoose');
const Vehicle = model('Vehicle', new Schema({
  name: { type: String, required: true },
  plate: { type: String, required: true, unique: true },
  type: { type: String, enum: ['car', 'van', 'motorcycle', 'truck'], default: 'car' },
  pricePerDay: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['available', 'maintenance'], default: 'available' },
}, { timestamps: true }));
const Reservation = model('Reservation', new Schema({
  customerName: { type: String, required: true },
  contact: { type: String, required: true },
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: Number,
  status: { type: String, enum: ['reserved', 'completed', 'cancelled'], default: 'reserved' },
}, { timestamps: true }));
module.exports = { Vehicle, Reservation };