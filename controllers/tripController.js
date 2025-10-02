const Trip = require('../models/trip');
const Route = require('../models/route');

// Helper: interpolate location
function interpolate(start, end, progress) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress
  };
}

// Calculate current location dynamically
async function getCurrentLocation(trip) {
  const route = await Route.findOne({ id: trip.route_id });
  if (!route) return trip.current_location;

  const startTime = new Date(trip.scheduled_time);
  const now = new Date();
  const elapsedMin = (now - startTime) / (1000 * 60);
  const progress = Math.min(elapsedMin / trip.duration_min, 1);
  return interpolate(route.start, route.end, progress);
}

// Get all moving trips (for commuters)
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({});
    const now = new Date();

    const movingTrips = await Promise.all(trips.map(async trip => {
      const route = await Route.findOne({ id: trip.route_id });
      if (!route) return null;

      const startTime = new Date(trip.scheduled_time);
      const endTime = new Date(startTime.getTime() + trip.duration_min * 60 * 1000);

      // Update status automatically
      if (now < startTime) trip.status = 'scheduled';
      else if (now >= startTime && now < startTime.getTime() + 5*60*1000) trip.status = 'boarding';
      else if (now >= startTime && now <= endTime) trip.status = 'en_route';
      else trip.status = 'completed';

      await trip.save();

      if (trip.status !== 'en_route') return null;

      const progress = (now - startTime) / (trip.duration_min * 60 * 1000);
      const current_location = interpolate(route.start, route.end, progress);

      return { ...trip.toObject(), current_location };
    }));

    res.json(movingTrips.filter(t => t !== null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single trip by ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ trip_id: req.params.id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const current_location = await getCurrentLocation(trip);
    res.json({ ...trip.toObject(), current_location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update trip location manually (bus operator)
exports.updateTripLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_location } = req.body;

    const trip = await Trip.findOne({ trip_id: id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.current_location = current_location;
    await trip.save();

    res.json({ message: 'Location updated', trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update trip status manually (delayed or cancelled)
exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['delayed', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const trip = await Trip.findOne({ trip_id: id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.status = status;
    await trip.save();

    res.json({ message: 'Trip status updated', trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
