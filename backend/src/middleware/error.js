const ApiError = require('../utils/ApiError');
const config = require('../config');

const notFound = (req, res, next) => next(ApiError.notFound(`Route not found: ${req.originalUrl}`));

// Central error handler: consistent JSON shape { success:false, message, details? }
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}`;
  }
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
  }
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  if (status === 500 && config.env !== 'production') console.error(err);

  res.status(status).json({
    success: false,
    message: status === 500 && config.env === 'production' ? 'Internal server error' : message,
    ...(details ? { details } : {}),
  });
};

module.exports = { notFound, errorHandler };
