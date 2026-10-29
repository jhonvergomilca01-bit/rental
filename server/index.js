// require('dotenv').config();
// const express = require('express'), mongoose = require('mongoose'), cors = require('cors');
// const app = express();
// app.use(cors(), express.json());
// app.use('/api/vehicles', require('./routes/vehicles'));
// app.use('/api/reservations', require('./routes/reservations'));
// mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_rental')
//   .then(() => app.listen(5000, () => console.log('API running on :5000')))
//   .catch(e => console.error(e));
require('dotenv').config();
const express = require('express'), mongoose = require('mongoose'), cors = require('cors');
const app = express();
app.use(cors(), express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/me', require('./routes/me'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/reservations', require('./routes/reservations'));
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_rental')
  .then(() => app.listen(5000, () => console.log('API running on :5000')))
  .catch(e => console.error(e));