const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Ekspor 'query' agar kita bisa menggunakannya di seluruh aplikasi
module.exports = {
  query: (text, params) => pool.query(text, params),
};