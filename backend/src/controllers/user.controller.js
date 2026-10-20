const User = require('../models/User');
const Application = require('../models/Application');
const MatchInsight = require('../models/MatchInsight');
const ActivityLog = require('../models/ActivityLog');
const Swipe = require('../models/Swipe');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

// Field names only - values (phone, bio...) stay out of the log
const PROFILE_SILENT_FIELDS = ['pushToken'];

exports.updateProfile = async (req, res) => {
  const wasOnboarded = req.user.onboarded;
  Object.assign(req.user, req.body);
  const changed = req.user.modifiedPaths({ includeChildren: false }).filter((f) => !f.includes('.') && !PROFILE_SILENT_FIELDS.includes(f));
  await req.user.save();
  if (!wasOnboarded && req.user.onboarded) logActivity(req, 'profile.onboarded', { meta: { categories: req.user.preferences?.categories } });
  else if (changed.length) logActivity(req, 'profile.updated', { meta: { fields: changed } });
  res.json({ success: true, user: req.user.toSafeJSON() });
};

const MAX_PORTFOLIO_ITEMS = 20;

exports.addPortfolioItem = async (req, res) => {
  if (req.user.portfolio.length >= MAX_PORTFOLIO_ITEMS) throw ApiError.badRequest(`You can save up to ${MAX_PORTFOLIO_ITEMS} projects`);
  req.user.portfolio.push(req.body);
  await req.user.save();
  logActivity(req, 'profile.portfolio_added', { meta: { title: req.body.title } });
  res.status(201).json({ success: true, data: req.user.portfolio });
};

exports.updatePortfolioItem = async (req, res) => {
  const item = req.user.portfolio.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Project not found');
  item.set(req.body);
  await req.user.save();
  logActivity(req, 'profile.portfolio_updated', { meta: { title: item.title } });
  res.json({ success: true, data: req.user.portfolio });
};

exports.removePortfolioItem = async (req, res) => {
  const item = req.user.portfolio.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Project not found');
  const { title } = item;
  item.deleteOne();
  await req.user.save();
  logActivity(req, 'profile.portfolio_removed', { meta: { title } });
  res.json({ success: true, data: req.user.portfolio });
};

exports.stats = async (req, res) => {
  const grouped = await Application.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const byStatus = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
  const total = grouped.reduce((sum, g) => sum + g.count, 0);
  res.json({ success: true, data: { total, byStatus } });
};

exports.uploadAvatarUrl = async (req, res) => {
  req.user.avatarUrl = req.body.avatarUrl;
  await req.user.save();
  res.json({ success: true, user: req.user.toSafeJSON() });
};

exports.deleteAccount = async (req, res) => {
  if (req.user.role === 'admin') throw ApiError.forbidden('Admin accounts cannot be self-deleted');
  await Application.deleteMany({ user: req.user._id });
  await MatchInsight.deleteMany({ user: req.user._id });
  await Swipe.deleteMany({ user: req.user._id });
  await Notification.deleteMany({ user: req.user._id });
  // A deleted account's history goes with it
  await ActivityLog.deleteMany({ user: req.user._id });
  await User.deleteOne({ _id: req.user._id });
  res.json({ success: true, message: 'Account deleted' });
};
