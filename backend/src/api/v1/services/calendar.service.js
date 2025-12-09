const CalendarModel = require('../models/calendar.model');

const CalendarService = {
  createEvent: async (userId, data) => {
    return await CalendarModel.create({ ...data, user_id: userId });
  },

  getUserEvents: async (userId) => {
    return await CalendarModel.findByUserId(userId);
  },

  updateEvent: async (eventId, userId, data) => {
    const updated = await CalendarModel.update(eventId, userId, data);
    if (!updated) {
      throw new Error('Event not found or access denied');
    }
    return updated;
  },

  deleteEvent: async (eventId, userId) => {
    const deleted = await CalendarModel.delete(eventId, userId);
    if (!deleted) {
      throw new Error('Event not found or access denied');
    }
    return deleted;
  }
};

module.exports = CalendarService;
