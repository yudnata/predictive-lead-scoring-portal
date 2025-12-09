const db = require('../../../config/database');

const CalendarModel = {
  create: async (data) => {
    const query = `
      INSERT INTO tb_calendar_events 
      (user_id, title, description, start_time, end_time, all_day, type) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;
    const values = [
      data.user_id,
      data.title,
      data.description,
      data.start_time,
      data.end_time,
      data.all_day || false,
      data.type || 'meeting',
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  findByUserId: async (userId) => {
    const query = `
      SELECT * FROM tb_calendar_events 
      WHERE user_id = $1 
      ORDER BY start_time ASC
    `;
    const { rows } = await db.query(query, [userId]);
    return rows;
  },

  update: async (eventId, userId, data) => {
    const query = `
      UPDATE tb_calendar_events 
      SET title = $1, description = $2, start_time = $3, end_time = $4, all_day = $5, type = $6, updated_at = NOW()
      WHERE event_id = $7 AND user_id = $8
      RETURNING *
    `;
    const values = [
      data.title,
      data.description,
      data.start_time,
      data.end_time,
      data.all_day,
      data.type,
      eventId,
      userId,
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  delete: async (eventId, userId) => {
    const query = `
      DELETE FROM tb_calendar_events 
      WHERE event_id = $1 AND user_id = $2
      RETURNING event_id
    `;
    const { rows } = await db.query(query, [eventId, userId]);
    return rows[0];
  },
};

module.exports = CalendarModel;
