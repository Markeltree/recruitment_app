const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Verifies the Bearer token and attaches req.user (fresh from DB so suspensions apply immediately)
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized();

    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    if (user.status === 'suspended') throw ApiError.forbidden('Account suspended');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Session expired, please sign in again'));
    }
    next(err);
  }
}

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to do this'));
    }
    next();
  };

module.exports = { requireAuth, requireRole };
