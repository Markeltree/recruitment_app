const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const MatchInsight = require('../models/MatchInsight');
const ActivityLog = require('../models/ActivityLog');
const Swipe = require('../models/Swipe');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

exports.dashboard = async (req, res) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    candidates,
    recruiters,
    newUsersWeek,
    openJobs,
    totalJobs,
    totalApplications,
    applicationsWeek,
    likes,
    byStatus,
    signupsByDay,
    topJobs,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'candidate' }),
    User.countDocuments({ role: 'recruiter' }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Job.countDocuments({ status: 'open' }),
    Job.countDocuments(),
    Application.countDocuments(),
    Application.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Swipe.countDocuments({ direction: 'like' }),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([
      { $match: { createdAt: { $gte: new Date(now - 14 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Job.find({ status: 'open' }).sort({ applicantsCount: -1 }).limit(5).select('title company applicantsCount').lean(),
  ]);

  res.json({
    success: true,
    data: {
      users: { total: totalUsers, candidates, recruiters, newThisWeek: newUsersWeek },
      jobs: { open: openJobs, total: totalJobs },
      applications: { total: totalApplications, thisWeek: applicationsWeek, byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])) },
      engagement: { likes },
      signupsByDay: signupsByDay.map((d) => ({ date: d._id, count: d.count })),
      topJobs,
    },
  });
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Admin sees every job regardless of status
exports.listJobs = async (req, res) => {
  const { q, status, category, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { company: rx }];
  }
  const [items, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Job.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
};

exports.listUsers = async (req, res) => {
  const { q, role, status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-password -pushToken')
      .lean(),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page: Number(page), limit: Number(limit), total } });
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -pushToken').lean();
  if (!user) throw ApiError.notFound('User not found');
  const applications = await Application.find({ user: user._id })
    .populate('job', 'title company')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: { user, applications } });
};

exports.updateUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id) && req.body.status === 'suspended') {
    throw ApiError.badRequest('You cannot suspend your own account');
  }
  const before = await User.findById(req.params.id).select('status role').lean();
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password -pushToken');
  if (!user) throw ApiError.notFound('User not found');
  const action =
    req.body.status && req.body.status !== before?.status ? (req.body.status === 'suspended' ? 'admin.user_suspended' : 'admin.user_reactivated') : 'admin.user_updated';
  logActivity(req, action, { user: user._id, meta: { fields: Object.keys(req.body), fromRole: before?.role, toRole: user.role } });
  res.json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw ApiError.badRequest('You cannot delete yourself');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  await Application.deleteMany({ user: user._id });
  await Swipe.deleteMany({ user: user._id });
  await MatchInsight.deleteMany({ user: user._id });
  await ActivityLog.deleteMany({ user: user._id });
  // Kept on the admin's own timeline, since the deleted user's history is gone
  logActivity(req, 'admin.user_deleted', { user: req.user._id, meta: { name: user.name, email: user.email, role: user.role } });
  res.json({ success: true, message: 'User deleted' });
};
