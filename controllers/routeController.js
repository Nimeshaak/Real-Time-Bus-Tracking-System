const Route = require('../models/route');

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get route by ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findOne({ id: req.params.id });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create route
exports.createRoute = async (req, res) => {
  try {
    const route = new Route(req.body);
    await route.save();
    res.status(201).json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update route
exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete route
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findOneAndDelete({ id: req.params.id });
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
