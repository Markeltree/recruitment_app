const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

// Notifications addressed to this user, plus broadcasts for their audience
const audienceFilter = (user) => {
  const audiences = ['all'];
  if (user.role === 'candidate') audiences.push('candidates');
  return { $or: [{ user: user._id }, { user: null, audience: { $in: audiences } }] };
};

exports.list = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const filter = audienceFilter(req.user);

  const [items, total, unread] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...filter, readBy: { $ne: req.user._id } }),
  ]);

  const data = items.map((n) => ({ ...n, read: n.readBy?.some((id) => id.equals(req.user._id)) }));
  res.json({ success: true, data, unread, pagination: { page, limit, total } });
};

exports.markRead = async (req, res) => {
  const filter = { _id: req.params.id, ...audienceFilter(req.user) };
  const n = await Notification.findOneAndUpdate(filter, { $addToSet: { readBy: req.user._id } }, { new: true });
  if (!n) throw ApiError.notFound('Notification not found');
  res.json({ success: true, data: n });
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany(audienceFilter(req.user), { $addToSet: { readBy: req.user._id } });
  res.json({ success: true, message: 'All notifications marked as read' });
};

// Admin broadcast
exports.broadcast = async (req, res) => {
  const note = await Notification.create({
    ...req.body,
    user: null,
    type: 'announcement',
  });
  res.status(201).json({ success: true, data: note });
};

exports.adminList = async (req, res) => {
  const items = await Notification.find().sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: items });
};
