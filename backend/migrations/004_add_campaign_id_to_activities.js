/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addColumns('tb_outbound_activities', {
    lead_campaign_id: {
      type: 'integer',
      references: 'tb_campaign_leads',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('tb_outbound_activities', ['lead_campaign_id']);
};
