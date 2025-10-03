const mongoose = require('mongoose');

const BusSchema = new mongoose.Schema({
  id: { type: String, required: true },
  route_id: { type: String, required: true },
  reg_number: { type: String, required: true },
  driver_name: { type: String, required: true }
});

module.exports = mongoose.model('Bus', BusSchema);
