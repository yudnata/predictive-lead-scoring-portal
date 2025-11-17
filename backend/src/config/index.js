require('dotenv').config({ path: __dirname + '/../../.env' });

module.exports = {
  port: process.env.PORT,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
};