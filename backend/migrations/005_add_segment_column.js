exports.up = (pgm) => {
  pgm.createTable('tb_segment', {
    segment_id: { type: 'serial', primaryKey: true },
    lead_segment: { type: 'varchar(255)', notNull: true },
  });

  pgm.sql(`
    INSERT INTO tb_segment (segment_id, lead_segment) VALUES
    (1, 'Stable Productive'),
    (2, 'High-Income Senior'),
    (3, 'Responsive Young');
  `);

  pgm.addColumns('tb_leads', {
    segment_id: {
      type: 'integer',
      references: '"tb_segment"',
      onDelete: 'SET NULL',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('tb_leads', ['segment_id']);
  pgm.dropTable('tb_segment');
};
