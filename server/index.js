const express = require('express'), mongoose = require('mongoose'), cors = require('cors');
const app = express();
app.use(cors(), express.json());
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/reservations', require('./routes/reservations'));
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_rental')
  .then(() => app.listen(5000, () => console.log('API running on :5000')))
  .catch(e => console.error(e));