const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');
const { signToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create(req.body);
  logActivity(req, 'auth.register', { user: user._id, meta: { role: user.role } });
  res.status(201).json({
    success: true,
    token: signToken(user),
    user: user.toSafeJSON(),
  });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    // Only attributable when the account exists; unknown emails have no timeline
    if (user) logActivity(req, 'auth.login_failed', { user: user._id, meta: { reason: 'wrong_password' } });
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (user.status === 'suspended') {
    logActivity(req, 'auth.login_failed', { user: user._id, meta: { reason: 'suspended' } });
    throw ApiError.forbidden('Account suspended');
  }

  user.lastLoginAt = new Date();
  await user.save();
  logActivity(req, 'auth.login', { user: user._id });

  res.json({ success: true, token: signToken(user), user: user.toSafeJSON() });
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user.toSafeJSON() });
};

exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    logActivity(req, 'auth.password_change_failed');
    throw ApiError.badRequest('Current password is incorrect');
  }
  user.password = req.body.newPassword;
  await user.save();
  logActivity(req, 'auth.password_changed');
  res.json({ success: true, message: 'Password updated' });
};
