// Import config
require('dotenv').config({ path: '../.env' }); // Pastikan path .env benar
const app = require('./app');
const config = require('./config');
const db = require('./config/database');

const PORT = config.port || 5000;

// Test database connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('🔴 Database connection error:', err.stack);
    process.exit(1); // Keluar jika DB gagal konek
  } else {
    console.log('🟢 Database connected:', res.rows[0].now);
    
    // Start server only if DB is connected
    app.listen(PORT, () => {
      console.log(`🟢 Server is running on http://localhost:${PORT}`);
    });
  }
});