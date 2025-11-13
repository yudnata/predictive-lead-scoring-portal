const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  connectionString: config.databaseUrl,
  // Opsi tambahan jika diperlukan, misal SSL untuk production:
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

module.exports = {
  /**
   * Menjalankan query ke database
   * @param {string} text - Query SQL
   * @param {Array} params - Parameter query
   * @returns {Promise<object>} Hasil query
   */
  query: (text, params) => pool.query(text, params),

  /**
   * Mengambil client dari pool untuk transaksi
   * @returns {Promise<object>} Client pool
   */
  connect: () => pool.connect(),
};