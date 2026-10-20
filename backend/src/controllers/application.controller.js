const Application = require('../models/Application');
const Job = require('../models/Job');
const Swipe = require('../models/Swipe');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

// Candidate: list own applications, grouped by status
exports.mine = async (req, res) => {
  const apps = await Application.find({ user: req.user._id })
    .populate('job', 'title company companyLogo location salaryMin salaryMax currency workMode status')
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ success: true, data: apps });
};

exports.apply = async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw ApiError.notFound('Job not found');
  if (job.status !== 'open') throw ApiError.badRequest('This job is no longer accepting applications');

  const existing = await Application.findOne({ user: req.user._id, job: job._id });
  if (existing) throw ApiError.conflict('You have already applied to this job');

  // Snapshot the chosen portfolio projects (must belong to this user)
  const wanted = [...new Set((req.body.portfolioIds || []).map(String))];
  const attachments = (req.user.portfolio || [])
    .filter((p) => wanted.includes(String(p._id)))
    .map((p) => ({ portfolioId: p._id, title: p.title, description: p.description, link: p.link, role: p.role, skills: p.skills }));
  if (attachments.length !== wanted.length) throw ApiError.badRequest('Some attached projects were not found in your portfolio');

  const { expectedPay, availability } = req.body;
  const application = await Application.create({
    user: req.user._id,
    job: job._id,
    coverNote: req.body.coverNote,
    proposal: {
      expectedPay: expectedPay ? { ...expectedPay, currency: job.currency || 'USD' } : undefined,
      availability,
      attachments,
    },
    statusHistory: [{ status: 'applied' }],
  });

  // Record the swipe as a like and bump counters
  await Swipe.findOneAndUpdate(
    { user: req.user._id, job: job._id },
    { direction: 'like' },
    { upsert: true }
  );
  await Job.updateOne({ _id: job._id }, { $inc: { applicantsCount: 1, likesCount: 1 } });

  await Notification.create({
    user: req.user._id,
    title: 'Application sent',
    body: `Your application for ${job.title} at ${job.company} was submitted.`,
    type: 'application',
    data: { applicationId: application._id, jobId: job._id },
  });

  logActivity(req, 'application.submitted', {
    meta: {
      applicationId: application._id,
      jobId: job._id,
      jobTitle: job.title,
      company: job.company,
      withCoverNote: !!req.body.coverNote,
      attachments: attachments.length,
      expectedPay: expectedPay ? `${expectedPay.amount}/${expectedPay.period}` : undefined,
    },
  });

  res.status(201).json({ success: true, data: application });
};

exports.withdraw = async (req, res) => {
  const application = await Application.findOne({ _id: req.params.id, user: req.user._id });
  if (!application) throw ApiError.notFound('Application not found');
  if (['offer', 'rejected', 'withdrawn'].includes(application.status)) {
    throw ApiError.badRequest('This application can no longer be withdrawn');
  }
  application.status = 'withdrawn';
  application.statusHistory.push({ status: 'withdrawn', note: 'Withdrawn by candidate' });
  await application.save();
  const job = await Job.findById(application.job).select('title company').lean();
  logActivity(req, 'application.withdrawn', { meta: { applicationId: application._id, jobId: application.job, jobTitle: job?.title, company: job?.company } });
  res.json({ success: true, data: application });
};

// Admin / recruiter: list applications with filters
exports.adminList = async (req, res) => {
  const { status, jobId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (jobId) filter.job = jobId;

  const [items, total] = await Promise.all([
    Application.find(filter)
      .populate('user', 'name email avatarUrl headline')
      .populate('job', 'title company')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean(),
    Application.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page: Number(page), limit: Number(limit), total } });
};

exports.updateStatus = async (req, res) => {
  const application = await Application.findById(req.params.id).populate('job', 'title company');
  if (!application) throw ApiError.notFound('Application not found');

  const from = application.status;
  application.status = req.body.status;
  application.statusHistory.push({ status: req.body.status, note: req.body.note });
  await application.save();
  // Lands on the candidate's timeline, with the recruiter/admin recorded as actor
  logActivity(req, 'application.status_changed', {
    user: application.user,
    meta: { applicationId: application._id, jobTitle: application.job.title, company: application.job.company, from, to: req.body.status },
  });

  await Notification.create({
    user: application.user,
    title: 'Application update',
    body: `Your application for ${application.job.title} is now: ${req.body.status}.`,
    type: 'application',
    data: { applicationId: application._id },
  });

  res.json({ success: true, data: application });
};
