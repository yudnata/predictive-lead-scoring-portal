const express = require('express');
const cors = require('cors');
const ApiError = require('./api/v1/utils/apiError');
const mainRouter = require('./api/v1/routes');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome to Accenture API v1');
});

app.use('/api/v1', mainRouter);

app.use((req, res, next) => {
  next(new ApiError(404, 'Not Found: Endpoint tidak ditemukan'));
});

app.use((err, req, res, next) => {
  console.error('🔴 ERROR:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;