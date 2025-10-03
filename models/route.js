const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  start: { lat: Number, lng: Number },
  end: { lat: Number, lng: Number }
});

module.exports = mongoose.model('Route', RouteSchema);
