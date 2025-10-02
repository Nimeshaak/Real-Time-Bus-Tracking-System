const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.get('/', tripController.getAllTrips);
router.get('/:id', tripController.getTripById);
router.put('/:id/location', tripController.updateTripLocation);
router.put('/:id/status', tripController.updateTripStatus);

module.exports = router;
