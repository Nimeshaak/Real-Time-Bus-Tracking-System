const map = L.map('map').setView([7.8731, 80.7718], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const busMarkers = {};
let currentFilterRouteName = null;

// Marker color based on status
function getMarkerColor(status) {
  switch(status) {
    case 'delayed': return 'yellow';
    case 'cancelled': return 'red';
    default: return 'blue';
  }
}

function createColoredMarker(lat, lng, color, popupText) {
  const icon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
  });
  return L.marker([lat, lng], { icon }).bindPopup(popupText).addTo(map);
}

async function fetchTrips() {
  try {
    const res = await fetch('/trips');
    const trips = await res.json();
    const movingBusIds = [];

    for (const trip of trips) {
      const loc = trip.current_location;
      if (!loc) continue;

      if (currentFilterRouteName && !trip.route_id.toLowerCase().includes(currentFilterRouteName.toLowerCase())) continue;

      movingBusIds.push(trip.bus_id);

      const color = getMarkerColor(trip.displayStatus);
      const popupText = `<b>Bus:</b> ${trip.bus_id}<br><b>Route:</b> ${trip.route_id}<br><b>Status:</b> ${trip.displayStatus}`;

      if (busMarkers[trip.bus_id]) {
        busMarkers[trip.bus_id].setLatLng([loc.lat, loc.lng]);
        busMarkers[trip.bus_id].setIcon(L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://unpkg.com/leaflet/dist/images/marker-shadow.png',
          shadowSize: [41, 41]
        }));
        busMarkers[trip.bus_id].bindPopup(popupText);
      } else {
        busMarkers[trip.bus_id] = createColoredMarker(loc.lat, loc.lng, color, popupText);
      }
    }

    for (const busId in busMarkers) {
      if (!movingBusIds.includes(busId)) {
        map.removeLayer(busMarkers[busId]);
        delete busMarkers[busId];
      }
    }
  } catch (err) {
    console.error('Error fetching trips:', err);
  }
}

fetchTrips();
setInterval(fetchTrips, 5000);

// Filter by Route with error alert
document.getElementById('routeFilterBtn').addEventListener('click', async () => {
  currentFilterRouteName = document.getElementById('routeNameInput').value.trim() || null;
  if (!currentFilterRouteName) return;

  try {
    const res = await fetch(`/search?route=${currentFilterRouteName}`);
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'No route found');
      return;
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      alert('No buses found for this route');
      return;
    }

    fetchTrips();
  } catch (err) {
    console.error(err);
    alert('Error fetching route data');
  }
});

// Search by Bus ID with updated displayStatus
document.getElementById('busSearchBtn').addEventListener('click', async () => {
  const busName = document.getElementById('busIdInput').value.trim();
  if (!busName) return;
  try {
    const date = document.getElementById('dateInput')?.value;
    let url = `/search?busName=${busName}`;
    if (date) url += `&date=${date}`;

    const res = await fetch(url);
    if (!res.ok) { 
      const err = await res.json();
      alert(err.message || 'Bus not found'); 
      return; 
    }

    const data = await res.json();
    let tripStatus = 'No Trip Today';
    if (data.trip) tripStatus = data.trip.displayStatus || data.trip.status;

    let detailsText = `Bus Details:\nBus ID: ${data.bus.id}\nReg Number: ${data.bus.reg_number}\nDriver: ${data.bus.driver_name}\nRoute: ${data.bus.route_id}\n`;
    if (data.trip) {
      const startTime = new Date(data.trip.scheduled_time).toLocaleString();
      const endTime = new Date(new Date(data.trip.scheduled_time).getTime() + data.trip.duration_min * 60000).toLocaleString();
      detailsText += `Start Time: ${startTime}\nEnd Time: ${endTime}`;
    }
    alert(detailsText);
  } catch (err) {
    console.error(err);
    alert('Error fetching bus info');
  }
});

// Show all moving trips
document.getElementById('showAllBtn').addEventListener('click', () => {
  currentFilterRouteName = null;
  fetchTrips();
});

// Bus Operator: Update Trip Status
document.getElementById('updateTripStatusBtn').addEventListener('click', async () => {
  const tripId = document.getElementById('operatorTripId').value.trim();
  const status = document.getElementById('operatorStatus').value;
  if (!tripId || !status) { alert('Enter Trip ID and select status'); return; }

  try {
    const res = await fetch(`/trips/${tripId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const err = await res.json();
      alert('Error: ' + (err.message || 'Could not update trip'));
      return;
    }

    alert(`Trip ${tripId} status updated to "${status}"`);
    fetchTrips();
  } catch (err) {
    console.error(err);
    alert('Error updating trip status');
  }
});