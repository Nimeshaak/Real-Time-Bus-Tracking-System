const Trip = require('../models/trip');
const Route = require('../models/route');

// Helper: interpolate location
function interpolate(start, end, progress) {
  return {
    lat: start.lat + (end.lat - start.lat) * progress,
    lng: start.lng + (end.lng - start.lng) * progress
  };
}

// Get all moving trips (optimized for today)
exports.getAllTrips = async (req, res) => {
  try {
    const now = new Date();

    // Only today's trips
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(now);
    dayEnd.setHours(23, 59, 59, 999);

    const trips = await Trip.find({
      scheduled_time: { $gte: dayStart, $lte: dayEnd }
    });

    const movingTrips = await Promise.all(trips.map(async trip => {
      const route = await Route.findOne({ id: trip.route_id });
      if (!route) return null;

      const startTime = new Date(trip.scheduled_time);
      const endTime = new Date(startTime.getTime() + trip.duration_min * 60 * 1000);

      // Auto-update status if manualStatus is not set
      if (!trip.manualStatus) {
        if (now < startTime) trip.status = 'scheduled';
        else if (now >= startTime && now <= endTime) trip.status = 'en_route';
        else trip.status = 'completed';
        await trip.save();
      }

      const progress = (now - startTime) / (trip.duration_min * 60 * 1000);
      const current_location = interpolate(route.start, route.end, progress);

      const displayStatus = trip.manualStatus || trip.status;

      if (!['en_route', 'delayed', 'cancelled'].includes(displayStatus)) return null;

      return { ...trip.toObject(), current_location, displayStatus };
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

    const route = await Route.findOne({ id: trip.route_id });
    const now = new Date();
    let progress = 0;
    if (route) {
      const startTime = new Date(trip.scheduled_time);
      progress = (now - startTime) / (trip.duration_min * 60 * 1000);
    }

    const current_location = route ? interpolate(route.start, route.end, progress) : trip.current_location;
    const displayStatus = trip.manualStatus || trip.status;

    res.json({ ...trip.toObject(), current_location, displayStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update trip location manually
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

// Update trip status manually (delayed, cancelled, en_route)
exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['delayed','cancelled','en_route'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const trip = await Trip.findOne({ trip_id: id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.manualStatus = status === 'en_route' ? null : status; // reset manualStatus if back to en_route
    if(status === 'en_route') trip.status = 'en_route';

    await trip.save();

    res.json({ message: `Trip ${id} status updated to "${status}"`, trip });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
