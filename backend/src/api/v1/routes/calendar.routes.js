const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendar.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, CalendarController.getEvents);
router.post('/', protect, CalendarController.createEvent);
router.put('/:id', protect, CalendarController.updateEvent);
router.delete('/:id', protect, CalendarController.deleteEvent);

module.exports = router;
