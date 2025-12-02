const bcrypt = require('bcrypt');

exports.up = async (pgm) => {
  // Roles
  await pgm.sql(`
    INSERT INTO tb_roles (role_name)
    VALUES ('admin'), ('sales')
    ON CONFLICT DO NOTHING;
  `);

  // Status CRM default
  await pgm.sql(`
    INSERT INTO tb_status (status)
    VALUES ('Available'), ('Tracked'), ('Uncontacted'), ('Contacted'), ('Deal'), ('Reject'), ('Call-Back')
    ON CONFLICT DO NOTHING;
  `);

  // Job (CSV)
  await pgm.sql(`
    INSERT INTO tb_job (job_name) VALUES
    ('admin.'), ('blue-collar'), ('entrepreneur'), ('housemaid'),
    ('management'), ('retired'), ('self-employed'), ('services'),
    ('student'), ('technician'), ('unemployed'), ('unknown')
    ON CONFLICT DO NOTHING;
  `);

  // Marital (CSV)
  await pgm.sql(`
    INSERT INTO tb_marital (marital_status)
    VALUES ('divorced'), ('married'), ('single')
    ON CONFLICT DO NOTHING;
  `);

  // Education (CSV)
  await pgm.sql(`
    INSERT INTO tb_education (education_level)
    VALUES ('primary'), ('secondary'), ('tertiary'), ('unknown')
    ON CONFLICT DO NOTHING;
  `);

  // Contact Method (CSV)
  await pgm.sql(`
    INSERT INTO tb_contact_method (contact_method_name)
    VALUES ('cellular'), ('telephone'), ('unknown')
    ON CONFLICT DO NOTHING;
  `);

  // Poutcome (CSV)
  await pgm.sql(`
    INSERT INTO tb_poutcome (poutcome_name)
    VALUES ('failure'), ('other'), ('success'), ('unknown')
    ON CONFLICT DO NOTHING;
  `);

  // Months (CSV)
  await pgm.sql(`
    INSERT INTO tb_months (month_name)
    VALUES 
    ('jan'), ('feb'), ('mar'), ('apr'), ('may'), ('jun'),
    ('jul'), ('aug'), ('sep'), ('oct'), ('nov'), ('dec')
    ON CONFLICT DO NOTHING;
  `);

  // Users default
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await pgm.sql(`
    INSERT INTO tb_users (roles_id, user_email, password, full_name, is_active)
    VALUES
      (1, 'admin@accenture.com', '${hashedPassword}', 'Admin Utama', true),
      (2, 'sales1@accenture.com', '${hashedPassword}', 'Sales Satu', true)
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = async (pgm) => {
  await pgm.sql(`DELETE FROM tb_users;`);
  await pgm.sql(`DELETE FROM tb_months;`);
  await pgm.sql(`DELETE FROM tb_poutcome;`);
  await pgm.sql(`DELETE FROM tb_contact_method;`);
  await pgm.sql(`DELETE FROM tb_education;`);
  await pgm.sql(`DELETE FROM tb_marital;`);
  await pgm.sql(`DELETE FROM tb_job;`);
  await pgm.sql(`DELETE FROM tb_status;`);
  await pgm.sql(`DELETE FROM tb_roles;`);
};
