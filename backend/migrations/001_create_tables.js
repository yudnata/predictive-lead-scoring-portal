/* eslint-disable camelcase */
exports.up = (pgm) => {
  // Roles
  pgm.createTable('tb_roles', {
    role_id: { type: 'serial', primaryKey: true },
    role_name: { type: 'varchar(50)', notNull: true, unique: true },
  });

  // Job
  pgm.createTable('tb_job', {
    job_id: { type: 'serial', primaryKey: true },
    job_name: { type: 'varchar(100)', notNull: true, unique: true },
  });

  // Marital
  pgm.createTable('tb_marital', {
    marital_id: { type: 'serial', primaryKey: true },
    marital_status: { type: 'varchar(50)', notNull: true },
  });

  // Education
  pgm.createTable('tb_education', {
    education_id: { type: 'serial', primaryKey: true },
    education_level: { type: 'varchar(100)', notNull: true },
  });

  // Poutcome
  pgm.createTable('tb_poutcome', {
    poutcome_id: { type: 'serial', primaryKey: true },
    poutcome_name: { type: 'varchar(100)', notNull: true },
  });

  // Contact Method
  pgm.createTable('tb_contact_method', {
    contactmethod_id: { type: 'serial', primaryKey: true },
    contact_method_name: { type: 'varchar(100)', notNull: true },
  });

  // Months (CSV: jan-dec)
  pgm.createTable('tb_months', {
    month_id: { type: 'serial', primaryKey: true },
    month_name: { type: 'varchar(20)', notNull: true },
  });

  // Status CRM
  pgm.createTable('tb_status', {
    status_id: { type: 'serial', primaryKey: true },
    status: { type: 'varchar(100)', notNull: true },
  });

  // Models
  pgm.createTable('tb_models', {
    model_id: { type: 'serial', primaryKey: true },
    model_name: { type: 'varchar(100)' },
    model_desc: { type: 'varchar(255)' },
    model_endpoint_url: { type: 'varchar(255)' },
    model_version: { type: 'varchar(50)' },
  });

  // Users
  pgm.createTable('tb_users', {
    user_id: { type: 'serial', primaryKey: true },
    roles_id: { type: 'integer', notNull: true, references: 'tb_roles', onDelete: 'cascade' },
    user_email: { type: 'varchar(255)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    address: { type: 'text' },
    country: { type: 'varchar(100)' },
    full_name: { type: 'varchar(255)' },
    is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Campaigns
  pgm.createTable('tb_campaigns', {
    campaign_id: { type: 'serial', primaryKey: true },
    campaign_name: { type: 'varchar(255)', notNull: true },
    campaign_start_date: { type: 'date' },
    campaign_end_date: { type: 'date' },
    campaign_desc: { type: 'text' },
    campaign_is_active: { type: 'boolean', default: true },
    created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Leads (Basic)
  pgm.createTable('tb_leads', {
    lead_id: { type: 'serial', primaryKey: true },
    lead_name: { type: 'varchar(255)', notNull: true },
    lead_phone_number: { type: 'varchar(50)' },
    lead_email: { type: 'varchar(255)', unique: true },
    lead_age: { type: 'integer' },
    job_id: { type: 'integer', references: 'tb_job' },
    marital_id: { type: 'integer', references: 'tb_marital' },
    education_id: { type: 'integer', references: 'tb_education' },
    created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Leads Detail (Complete CSV Mapping)
  pgm.createTable('tb_leads_detail', {
    leads_detail_id: { type: 'serial', primaryKey: true },
    lead_id: { type: 'integer', notNull: true, references: 'tb_leads', onDelete: 'CASCADE' },

    lead_default: { type: 'boolean' },
    lead_balance: { type: 'integer' },
    lead_housing_loan: { type: 'boolean' },
    lead_loan: { type: 'boolean' },

    last_contact_day: { type: 'integer' },
    month_id: { type: 'integer', references: 'tb_months' },

    last_contact_duration_sec: { type: 'integer' },

    campaign_count: { type: 'integer' },

    pdays: { type: 'integer' },

    prev_contact_count: { type: 'integer' },

    poutcome_id: { type: 'integer', references: 'tb_poutcome' },
    updated_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Leads Score (ML)
  pgm.createTable('tb_leads_score', {
    lead_score_id: { type: 'serial', primaryKey: true },
    lead_id: { type: 'integer', notNull: true, references: 'tb_leads', onDelete: 'CASCADE' },
    lead_score: { type: 'numeric(5,4)' },
    model_id: { type: 'integer', references: 'tb_models' },
    predicted_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Campaign Assignments
  pgm.createTable('tb_campaign_assignments', {
    assignment_id: { type: 'serial', primaryKey: true },
    user_id: { type: 'integer', notNull: true, references: 'tb_users' },
    campaign_id: { type: 'integer', notNull: true, references: 'tb_campaigns' },
    assigned_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Campaign Leads
  pgm.createTable('tb_campaign_leads', {
    campaignleads_id: { type: 'serial', primaryKey: true },
    campaign_id: { type: 'integer', notNull: true, references: 'tb_campaigns' },
    lead_id: { type: 'integer', notNull: true, references: 'tb_leads', onDelete: 'CASCADE' },
    user_id: { type: 'integer', references: 'tb_users' },
    contactmethod_id: { type: 'integer', references: 'tb_contact_method' },
    status_id: { type: 'integer', notNull: true, references: 'tb_status' },
    contact_this_campaign_num: { type: 'integer', default: 0 },
    updated_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Notes
  pgm.createTable('tb_notes', {
    notes_id: { type: 'serial', primaryKey: true },
    lead_id: { type: 'integer', notNull: true, references: 'tb_leads', onDelete: 'CASCADE' },
    user_id: { type: 'integer', notNull: true, references: 'tb_users' },
    campaign_id: { type: 'integer', references: 'tb_campaigns' },
    note_content: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });

  // Lead Status History
  pgm.createTable('tb_lead_status_history', {
    history_id: { type: 'serial', primaryKey: true },
    lead_id: { type: 'integer', notNull: true, references: 'tb_leads', onDelete: 'CASCADE' },
    campaign_id: { type: 'integer', references: 'tb_campaigns' },
    status_id: { type: 'integer', notNull: true, references: 'tb_status' },
    changed_by: { type: 'integer', notNull: true, references: 'tb_users' },
    changed_at: { type: 'timestamptz', default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable([
    'tb_lead_status_history',
    'tb_notes',
    'tb_campaign_leads',
    'tb_campaign_assignments',
    'tb_leads_score',
    'tb_leads_detail',
    'tb_leads',
    'tb_campaigns',
    'tb_users',
    'tb_models',
    'tb_status',
    'tb_months',
    'tb_contact_method',
    'tb_poutcome',
    'tb_education',
    'tb_marital',
    'tb_job',
    'tb_roles',
  ]);
};
