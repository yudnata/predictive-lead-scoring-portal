const CalendarService = require('../services/calendar.service');

const CalendarController = {
  getEvents: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const events = await CalendarService.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  createEvent: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const event = await CalendarService.createEvent(userId, req.body);
      res.status(201).json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to create event' });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const eventId = req.params.id;
      const event = await CalendarService.updateEvent(eventId, userId, req.body);
      res.json(event);
    } catch (error) {
      console.error(error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).json({ message: 'Failed to update event' });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const userId = req.user.user_id;
      const eventId = req.params.id;
      await CalendarService.deleteEvent(eventId, userId);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error(error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(500).json({ message: 'Failed to delete event' });
    }
  }
};

module.exports = CalendarController;
