/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('tb_calendar_events', {
    event_id: { type: 'serial', primaryKey: true },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'tb_users',
      onDelete: 'CASCADE',
    },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    start_time: { type: 'timestamp', notNull: true },
    end_time: { type: 'timestamp', notNull: true },
    all_day: { type: 'boolean', default: false },
    type: { type: 'varchar(50)', default: 'meeting' },
    created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });
};

exports.down = pgm => {
  pgm.dropTable('tb_calendar_events');
};
