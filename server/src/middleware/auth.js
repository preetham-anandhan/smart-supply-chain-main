// ==============================================
// Authentication Middleware — JWT verification
// ==============================================

const jwt = require('jsonwebtoken');
const { createLogger } = require('../../../shared/utils/logger');
const log = createLogger('AUTH');

const JWT_SECRET = process.env.JWT_SECRET || 'smartchain-secret-key-2024';

/**
 * Verify JWT token from Authorization header.
 * Attaches decoded user to req.user.
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    log.warn(`Invalid token attempt: ${err.message}`);
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

/**
 * Authorize specific roles.
 * Usage: authorize('manager', 'driver')
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      log.warn(`Forbidden: user ${req.user.username} (${req.user.role}) tried to access ${roles.join('/')}-only route`);
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }
    next();
  };
}

module.exports = { authenticate, authorize, JWT_SECRET };
