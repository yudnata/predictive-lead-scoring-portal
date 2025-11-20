const bcrypt = require('bcrypt');

exports.up = async (pgm) => {
  // Roles
  await pgm.sql(`INSERT INTO tb_roles (role_name) VALUES ('admin'), ('sales') ON CONFLICT DO NOTHING;`);

  // Status
  await pgm.sql(`
    INSERT INTO tb_status (status)
    VALUES ('Belum Dihubungi'), ('Sedang Dihubungi'), ('Deal'), ('Reject'), ('Hubungi Kembali')
    ON CONFLICT DO NOTHING;
  `);

  // Job
  await pgm.sql(`
    INSERT INTO tb_job (job_name)
    VALUES ('Mahasiswa'), ('Karyawan Swasta'), ('Wiraswasta'), ('PNS'), ('Tidak Bekerja')
    ON CONFLICT DO NOTHING;
  `);

  // Marital
  await pgm.sql(`
    INSERT INTO tb_marital (marital_status)
    VALUES ('Menikah'), ('Belum Menikah'), ('Cerai')
    ON CONFLICT DO NOTHING;
  `);

  // Education
  await pgm.sql(`
    INSERT INTO tb_education (education_level)
    VALUES ('SMA'), ('D3'), ('S1'), ('S2'), ('Lainnya')
    ON CONFLICT DO NOTHING;
  `);

  // Contact Method
  await pgm.sql(`
    INSERT INTO tb_contact_method (contact_method_name)
    VALUES ('Telepon'), ('Email'), ('WhatsApp'), ('SMS')
    ON CONFLICT DO NOTHING;
  `);

  // Users (admin & sales)
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);
  await pgm.sql(`
    INSERT INTO tb_users (roles_id, user_email, password, full_name, is_active)
    VALUES
      (1, 'admin@accenture.com', '${hashedPassword}', 'Admin Utama', true),
      (2, 'sales1@accenture.com', '${hashedPassword}', 'Sales Satu', true),
      (2, 'sales2@accenture.com', '${hashedPassword}', 'Sales Dua', false)
    ON CONFLICT DO NOTHING;
  `);
};

exports.down = async (pgm) => {
  await pgm.sql(`DELETE FROM tb_users;`);
  await pgm.sql(`DELETE FROM tb_contact_method;`);
  await pgm.sql(`DELETE FROM tb_poutcome;`);
  await pgm.sql(`DELETE FROM tb_education;`);
  await pgm.sql(`DELETE FROM tb_marital;`);
  await pgm.sql(`DELETE FROM tb_job;`);
  await pgm.sql(`DELETE FROM tb_status;`);
  await pgm.sql(`DELETE FROM tb_roles;`);
};
