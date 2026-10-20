const Job = require('../models/Job');
const Swipe = require('../models/Swipe');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public list with search, filters, pagination
exports.list = async (req, res) => {
  const { q, category, type, workMode, page, limit, sort } = req.query;
  const filter = { status: 'open' };

  if (category) filter.category = category;
  if (type) filter.type = type;
  if (workMode) filter.workMode = workMode;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { company: rx }, { skills: rx }, { location: rx }];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    salary: { salaryMax: -1 },
    popular: { likesCount: -1, views: -1 },
  };

  const [items, total] = await Promise.all([
    Job.find(filter)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// Discovery deck for swipe UI: open jobs the user has not already swiped on, ranked by preference match
exports.feed = async (req, res) => {
  const swiped = await Swipe.find({ user: req.user._id }).distinct('job');
  const prefs = req.user.preferences || {};
  const userSkills = (req.user.skills || []).map((s) => s.toLowerCase());

  const filter = { status: 'open', _id: { $nin: swiped } };
  if (prefs.categories?.length) filter.category = { $in: prefs.categories };
  if (prefs.jobTypes?.length) filter.type = { $in: prefs.jobTypes };
  if (prefs.remoteOnly) filter.workMode = 'remote';

  let jobs = await Job.find(filter).sort({ featured: -1, createdAt: -1 }).limit(40).lean();

  // Score by skill overlap so the deck feels personalized
  jobs = jobs
    .map((j) => {
      const overlap = (j.skills || []).filter((s) => userSkills.includes(s.toLowerCase())).length;
      return { ...j, matchScore: Math.min(99, 40 + overlap * 15 + (j.featured ? 5 : 0)) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ success: true, data: jobs });
};

exports.getOne = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).lean();
  if (!job) throw ApiError.notFound('Job not found');

  const [application, swipe] = await Promise.all([
    Application.findOne({ user: req.user._id, job: job._id }).lean(),
    Swipe.findOne({ user: req.user._id, job: job._id }).lean(),
  ]);

  logActivity(req, 'job.viewed', { meta: { jobId: job._id, jobTitle: job.title, company: job.company } });

  res.json({
    success: true,
    data: { ...job, applied: !!application, applicationStatus: application?.status, swipe: swipe?.direction },
  });
};

exports.create = async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  logActivity(req, 'job.created', { meta: { jobId: job._id, jobTitle: job.title, company: job.company } });
  res.status(201).json({ success: true, data: job });
};

exports.update = async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) throw ApiError.notFound('Job not found');
  logActivity(req, 'job.updated', { meta: { jobId: job._id, jobTitle: job.title, company: job.company, fields: Object.keys(req.body) } });
  res.json({ success: true, data: job });
};

exports.remove = async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) throw ApiError.notFound('Job not found');
  logActivity(req, 'job.deleted', { meta: { jobId: job._id, jobTitle: job.title, company: job.company } });
  await Promise.all([
    Application.deleteMany({ job: job._id }),
    Swipe.deleteMany({ job: job._id }),
  ]);
  res.json({ success: true, message: 'Job deleted' });
};

exports.categories = async (req, res) => {
  const cats = await Job.aggregate([
    { $match: { status: 'open' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data: cats.map((c) => ({ name: c._id, count: c.count })) });
};
