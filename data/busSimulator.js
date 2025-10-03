const fs = require('fs');

// Current time in Sri Lanka
const now = new Date();
now.setSeconds(0, 0);

// Define routes with start/end coordinates, durations, and stagger intervals
const routes = [
  { id: "route-1", name: "Colombo–Kandy", duration_min: 180, stagger_min: 15, start: { lat: 6.9271, lng: 79.8612 }, end: { lat: 7.2906, lng: 80.6337 } },
  { id: "route-2", name: "Colombo–Galle", duration_min: 150, stagger_min: 20, start: { lat: 6.9271, lng: 79.8612 }, end: { lat: 6.0535, lng: 80.2210 } },
  { id: "route-3", name: "Kandy–Kurunegala", duration_min: 120, stagger_min: 20, start: { lat: 7.2906, lng: 80.6337 }, end: { lat: 7.4863, lng: 80.3623 } },
  { id: "route-4", name: "Trincomalee–Colombo", duration_min: 300, stagger_min: 35, start: { lat: 8.5878, lng: 81.2152 }, end: { lat: 6.9271, lng: 79.8612 } },
  { id: "route-5", name: "Badulla–Nuwara Eliya", duration_min: 100, stagger_min: 25, start: { lat: 6.9910, lng: 81.0550 }, end: { lat: 6.9497, lng: 80.7891 } }
];

// Define buses (5 per route = 25 total)
const buses = [];
for (let i = 1; i <= 25; i++) {
  const route_id = `route-${Math.ceil(i / 5)}`;
  buses.push({
    id: `bus-${i}`,
    route_id,
    reg_number: `NP-${i.toString().padStart(3, '0')}`,
    driver_name: `Driver ${i}`,
  });
}

// Generate trips for 7 days
const trips = [];
const daysToSimulate = 7;

for (let d = 0; d < daysToSimulate; d++) {
  routes.forEach(route => {
    const routeBuses = buses.filter(b => b.route_id === route.id);

    routeBuses.forEach((bus, busIdx) => {
      const tripDate = new Date(now);
      tripDate.setDate(tripDate.getDate() + d);

      tripDate.setMinutes(tripDate.getMinutes() + busIdx * route.stagger_min);

      trips.push({
        trip_id: `trip-${bus.id}-${d+1}`,
        bus_id: bus.id,
        route_id: bus.route_id,
        scheduled_time: tripDate.toISOString(),
        duration_min: route.duration_min,
        steps: Math.round(route.duration_min / 2),
        current_location: route.start,
        status: "scheduled"
      });
    });
  });
}

// Save JSON
const data = { routes, buses, trips };
fs.writeFileSync('ntc_simulation_data_compact.json', JSON.stringify(data, null, 2));

console.log('✅ 7-day simulation data generated.');
