const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static('public'));

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'ntc_simulation_data_moving.json'))
);

const tripIndexes = {};

// ===== ROOT ROUTE =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== ROUTES ENDPOINTS =====
app.get('/routes', (req, res) => res.json(data.routes));

app.get('/routes/:id', (req, res) => {
  const route = data.routes.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ message: 'Route not found' });
  res.json(route);
});

// ===== BUSES ENDPOINTS =====
app.get('/buses', (req, res) => res.json(data.buses));

app.get('/buses/:id', (req, res) => {
  const bus = data.buses.find(b => b.id === req.params.id);
  if (!bus) return res.status(404).json({ message: 'Bus not found' });
  res.json(bus);
});

// ===== TRIPS ENDPOINTS =====
app.get('/trips', (req, res) => res.json(data.trips));

app.get('/trips/:id', (req, res) => {
  const trip = data.trips.find(t => t.trip_id === req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  if (!tripIndexes[trip.trip_id]) tripIndexes[trip.trip_id] = 0;

  const steps = trip.route_steps;
  const index = tripIndexes[trip.trip_id];

  const currentStep = steps[index].location;

  tripIndexes[trip.trip_id] = (index + 1) % steps.length;

  res.json({ ...trip, current_location: currentStep });
});

app.put('/trips/:id/location', (req, res) => {
  const trip = data.trips.find(t => t.trip_id === req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });
  trip.current_location = req.body.current_location;
  res.json({ message: 'Location updated', trip });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚍 Server running on http://localhost:${PORT}`));
