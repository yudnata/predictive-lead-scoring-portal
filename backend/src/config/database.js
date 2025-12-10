const { Pool, types } = require('pg');

types.setTypeParser(1082, (str) => str);

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

module.exports = {
  query: (text, params) => pool.query(text, params),
  connect: () => pool.connect(),
};
