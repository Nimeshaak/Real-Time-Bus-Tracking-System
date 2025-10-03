const express = require('express');
const router = express.Router();
const Bus = require('../models/bus');
const Trip = require('../models/trip');

router.get('/', async (req, res) => {
  try {
    const { busName, route, date } = req.query;

    // Convert date string to a JS Date object (start & end of day)
    let dayStart, dayEnd;
    if (date) {
      dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);

      dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
    } else {
      // default: today
      dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayEnd = new Date();
      dayEnd.setHours(23, 59, 59, 999);
    }

    // Search by busName
    if (busName) {
      const bus = await Bus.findOne({
        $or: [
          { reg_number: busName },
          { id: busName }
        ]
      });

      if (!bus) return res.status(404).json({ message: 'Bus not found' });

      const trip = await Trip.findOne({
        bus_id: bus.id,
        scheduled_time: { $gte: dayStart, $lte: dayEnd }
      }).sort({ scheduled_time: 1 }); 

      return res.json({
        bus,
        trip: trip || null,
        message: trip ? undefined : "This bus has no trip on the selected day."
      });
    }

    // Search by route
    if (route) {
      const buses = await Bus.find({ route_id: route });
      if (!buses.length) return res.status(404).json({ message: 'No buses found for this route' });

      const results = [];
      for (const bus of buses) {
        const trip = await Trip.findOne({
          bus_id: bus.id,
          scheduled_time: { $gte: dayStart, $lte: dayEnd }
        }).sort({ scheduled_time: 1 });

        results.push({
          bus,
          trip: trip || null,
          message: trip ? undefined : "No trip for this bus on selected day"
        });
      }
      return res.json(results);
    }

    res.status(400).json({ message: 'Please provide busName or route in the query' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
