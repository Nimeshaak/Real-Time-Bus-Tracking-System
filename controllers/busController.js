const Bus = require('../models/bus');

// Get all buses
exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find();
    res.json(buses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bus by ID
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findOne({ id: req.params.id });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create bus (NTC admin)
exports.createBus = async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.status(201).json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update bus
exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete bus
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findOneAndDelete({ id: req.params.id });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json({ message: 'Bus deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
