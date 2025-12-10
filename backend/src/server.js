require('dotenv').config({ path: '../.env' });
const config = require('./config');
const db = require('./config/database');
const app = require('./app');

const PORT = config.port || 5000;

db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('🔴 Database connection error:', err.stack);
    process.exit(1);
  } else {
    console.log('🟢 Database connected:', res.rows[0].now);

    app.listen(PORT, () => {
      console.log(`🟢 Server is running on http://localhost:${PORT}`);
    });
  }
});
