const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Route = require('./models/route');
const Bus = require('./models/bus');
const Trip = require('./models/trip');
const fs = require('fs');
const path = require('path');

// Use the compact simulation data JSON
const dataPath = path.join(__dirname, 'data', 'ntc_simulation_data_compact.json');
const simulationData = JSON.parse(fs.readFileSync(dataPath));

const populateDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Route.deleteMany({});
    await Bus.deleteMany({});
    await Trip.deleteMany({});

    // Insert routes
    await Route.insertMany(simulationData.routes);

    // Insert buses (capacity removed)
    await Bus.insertMany(simulationData.buses);

    // Insert trips with standard enum status
    const trips = simulationData.trips.map(trip => ({
      trip_id: trip.trip_id,
      bus_id: trip.bus_id,
      route_id: trip.route_id,
      scheduled_time: trip.scheduled_time,
      duration_min: trip.duration_min,
      steps: trip.steps,
      current_location: trip.current_location,
      status: trip.status 
    }));

    await Trip.insertMany(trips);

    console.log('✅ Database populated with compact simulation data');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

populateDB();