const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  trip_id: { type: String, required: true },
  bus_id: { type: String, required: true },
  route_id: { type: String, required: true },
  scheduled_time: { type: Date, required: true },
  duration_min: { type: Number, required: true },
  steps: { type: Number, default: 150 },
  current_location: { lat: Number, lng: Number },
  status: { 
    type: String, 
    enum: ['scheduled', 'boarding', 'departed', 'en_route', 'completed'], 
    default: 'scheduled'
  },
  manualStatus: { type: String, enum: ['delayed','cancelled'], default: null } // NEW
});

module.exports = mongoose.model('Trip', TripSchema);
