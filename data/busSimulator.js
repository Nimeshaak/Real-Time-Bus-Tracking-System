const fs = require('fs');

// routes with start/end coordinates (approx)
const routes = [
  { id: "route-1", name: "Colombo–Kandy", start: {lat: 6.9271, lng: 79.8612}, end: {lat: 7.2906, lng: 80.6337} },
  { id: "route-2", name: "Colombo–Galle", start: {lat: 6.9271, lng: 79.8612}, end: {lat: 6.0535, lng: 80.2210} },
  { id: "route-3", name: "Colombo–Jaffna", start: {lat: 6.9271, lng: 79.8612}, end: {lat: 9.6615, lng: 80.0255} },
  { id: "route-4", name: "Colombo–Trincomalee", start: {lat: 6.9271, lng: 79.8612}, end: {lat: 8.5878, lng: 81.2152} },
  { id: "route-5", name: "Colombo–Badulla", start: {lat: 6.9271, lng: 79.8612}, end: {lat: 6.991, lng: 81.055} }
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

// Helper function: interpolate location along route
function interpolate(start, end, progress) {
  const lat = start.lat + (end.lat - start.lat) * progress;
  const lng = start.lng + (end.lng - start.lng) * progress;
  return { lat, lng };
}

// Generate trips with 1-minute interval steps
const trips = [];
const startDate = new Date("2025-10-01T06:00:00+05:30");

buses.forEach((bus) => {
  const route = routes.find(r => r.id === bus.route_id);
  
  for (let day = 0; day < 7; day++) {
    for (let tripNum = 0; tripNum < 2; tripNum++) {
      const tripDate = new Date(startDate);
      tripDate.setDate(tripDate.getDate() + day);
      tripDate.setHours(6 + tripNum*4); 

      const totalDurationMin = 150; 
      const intervalMin = 1; 
      const totalSteps = totalDurationMin / intervalMin;

      const steps = [];
      for (let step = 0; step <= totalSteps; step++) {
        steps.push({
          timestamp: new Date(tripDate.getTime() + step * intervalMin * 60 * 1000).toISOString(),
          location: interpolate(route.start, route.end, step / totalSteps)
        });
      }

      trips.push({
        trip_id: `trip-${bus.id}-${day+1}-${tripNum+1}`,
        bus_id: bus.id,
        route_id: bus.route_id,
        scheduled_time: tripDate.toISOString(),
        current_location: route.start,
        status: "Scheduled",
        route_steps: steps
      });
    }
  }
});

// Combine all data
const data = { routes, buses, trips };

fs.writeFileSync('ntc_simulation_data_moving.json', JSON.stringify(data, null, 2));
console.log('Simulation data with 1-minute interval steps generated: ntc_simulation_data_moving.json');
