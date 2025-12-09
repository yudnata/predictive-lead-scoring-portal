const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const ApiError = require('./api/v1/utils/apiError');
const mainRouter = require('./api/v1/routes');

const app = express();

app.use(helmet());

app.use(cors());
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Welcome to Accenture API v1');
});

app.use('/api/v1', mainRouter);

app.use((req, res, next) => {
  next(new ApiError(404, 'Not Found: Endpoint tidak ditemukan'));
});

app.use((err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!err.isOperational) {
    console.error('🔴 UNHANDLED ERROR:', err);
  } else {
    console.error('🔴 ERROR:', err.message);
  }

  const statusCode = err.statusCode || 500;

  let message = err.message || 'Internal Server Error';
  if (!isDevelopment && statusCode === 500) {
    message = 'Internal Server Error. Please try again later.';
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(isDevelopment && { stack: err.stack }),
  });
});

module.exports = app;
