const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const { CATEGORIES } = ActivityLog;
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const paging = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30));
  return { page, limit, skip: (page - 1) * limit };
};

const withPeople = (q) => q.populate('user', 'name email role').populate('actor', 'name email role');

// Activity counts per category over the last 24 hours
async function last24hSummary(match = {}) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await ActivityLog.aggregate([{ $match: { ...match, createdAt: { $gte: since } } }, { $group: { _id: '$category', count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [r._id, r.count]));
}

// GET /admin/activity - platform-wide feed with filters
exports.list = async (req, res) => {
  const { category, action, q } = req.query;
  const { page, limit, skip } = paging(req.query);
  const filter = {};

  if (category) {
    if (!CATEGORIES.includes(category)) throw ApiError.badRequest('Unknown category');
    filter.category = category;
  }
  if (action) filter.action = String(action);
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    const ids = await User.find({ $or: [{ name: rx }, { email: rx }] }).distinct('_id');
    filter.$or = [{ user: { $in: ids } }, { actor: { $in: ids } }];
  }

  const [items, total, summary] = await Promise.all([
    withPeople(ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)).lean(),
    ActivityLog.countDocuments(filter),
    page === 1 ? last24hSummary() : null,
  ]);

  res.json({ success: true, data: items, summary, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

// GET /admin/users/:id/activity - one user's timeline (things done by them and to them)
exports.forUser = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw ApiError.badRequest('Invalid user id');
  const { category } = req.query;
  const { page, limit, skip } = paging(req.query);
  const id = new mongoose.Types.ObjectId(req.params.id);

  const filter = { $or: [{ user: id }, { actor: id }] };
  if (category) {
    if (!CATEGORIES.includes(category)) throw ApiError.badRequest('Unknown category');
    filter.category = category;
  }

  const [items, total, summary] = await Promise.all([
    withPeople(ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)).lean(),
    ActivityLog.countDocuments(filter),
    page === 1 ? last24hSummary({ $or: [{ user: id }, { actor: id }] }) : null,
  ]);

  res.json({ success: true, data: items, summary, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};
