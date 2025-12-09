/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('tb_outbound_activities', {
    activity_id: { type: 'serial', primaryKey: true },
    lead_id: { type: 'integer', notNull: true, references: 'tb_leads', onDelete: 'CASCADE' },
    user_id: { type: 'integer', notNull: true, references: 'tb_users' },
    activity_type: { type: 'varchar(50)' },
    outcome: { type: 'varchar(50)' },

    notes: { type: 'text' },
    created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tb_outbound_activities');
};
