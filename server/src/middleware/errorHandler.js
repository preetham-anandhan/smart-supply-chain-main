// ==============================================
// Error Handler Middleware
// ==============================================

const { createLogger } = require('../../../shared/utils/logger');
const log = createLogger('ERROR');

/**
 * Global error handling middleware.
 */
function errorHandler(err, req, res, _next) {
  log.error(`${req.method} ${req.path} — ${err.message}`);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

/**
 * 404 handler for unknown routes.
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
