const express = require('express');
const router = express.Router();
const { bookEvent, getUserBookings, cancelBooking } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, bookEvent);
router.get('/', authenticate, getUserBookings);
router.delete('/:id', authenticate, cancelBooking);

module.exports = router;
