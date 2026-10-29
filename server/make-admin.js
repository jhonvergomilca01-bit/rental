require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const User = require('./User');
(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_rental');
  const [email = 'admin@rental.com', password = 'admin123'] = process.argv.slice(2);
  await User.findOneAndUpdate({ email }, { name: 'Admin', email, password: await bcrypt.hash(password, 10), role: 'admin' }, { upsert: true });
  console.log(`Admin ready: ${email} / ${password}`);
  process.exit();
})();