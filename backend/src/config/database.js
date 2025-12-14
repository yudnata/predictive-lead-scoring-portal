const { Pool, types } = require('pg');

types.setTypeParser(1082, (str) => str);

const isExternalDB =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('supabase') ||
    process.env.DATABASE_URL.includes('railway') ||
    process.env.DATABASE_URL.includes('neon') ||
    process.env.DATABASE_URL.includes('render'));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isExternalDB ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: false,
    };

const pool = new Pool(poolConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
