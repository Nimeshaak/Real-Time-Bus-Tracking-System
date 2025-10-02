const fs = require('fs');

// Current time in Sri Lanka
const now = new Date();
now.setSeconds(0, 0);

// Define routes with start/end coordinates
const routes = [
  { id: "route-1", name: "Colombo–Kandy", start: { lat: 6.9271, lng: 79.8612 }, end: { lat: 7.2906, lng: 80.6337 } },
  { id: "route-2", name: "Colombo–Galle", start: { lat: 6.9271, lng: 79.8612 }, end: { lat: 6.0535, lng: 80.2210 } },
  { id: "route-3", name: "Kandy–Kurunegala", start: { lat: 7.2906, lng: 80.6337 }, end: { lat: 7.4863, lng: 80.3623 } },
  { id: "route-4", name: "Trincomalee–Colombo", start: { lat: 8.5878, lng: 81.2152 }, end: { lat: 6.9271, lng: 79.8612 } },
  { id: "route-5", name: "Badulla–Nuwara Eliya", start: { lat: 6.9910, lng: 81.0550 }, end: { lat: 6.9497, lng: 80.7891 } }
];

// Define buses
const buses = [];
for (let i = 1; i <= 25; i++) {
  const route_id = `route-${Math.ceil(i/5)}`;
  buses.push({
    id: `bus-${i}`,
    route_id,
    reg_number: `NP-${i.toString().padStart(3,'0')}`,
    driver_name: `Driver ${i}`,
    capacity: 50
  });
}

// Generate trips (compact)
const trips = [];
buses.forEach((bus, i) => {
  const route = routes.find(r => r.id === bus.route_id);

  // Stagger trips by 10 minutes
  const tripDate = new Date(now);
  tripDate.setMinutes(tripDate.getMinutes() + i * 10);

  trips.push({
    trip_id: `trip-${bus.id}-1-1`,
    bus_id: bus.id,
    route_id: bus.route_id,
    scheduled_time: tripDate.toISOString(),
    duration_min: 60,      // set total trip duration (can vary per route)
    steps: 150,            // smoothness (used for frontend interpolation)
    current_location: route.start,
    status: "scheduled"
  });
});

// Save JSON (optional for seeding)
const data = { routes, buses, trips };
fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/ntc_simulation_data_compact.json', JSON.stringify(data, null, 2));

console.log('Compact simulation data generated.');
