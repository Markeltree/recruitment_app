const Swipe = require('../models/Swipe');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

// Records a swipe. 'like' via swipe does not auto-apply; the client then calls /applications.
exports.record = async (req, res) => {
  const { jobId, direction } = req.body;

  const job = await Job.findById(jobId).select('_id status title company');
  if (!job) throw ApiError.notFound('Job not found');

  const swipe = await Swipe.findOneAndUpdate(
    { user: req.user._id, job: jobId },
    { direction },
    { upsert: true, new: true }
  );

  if (direction === 'like') {
    await Job.updateOne({ _id: jobId }, { $inc: { likesCount: 1 } });
  }

  logActivity(req, direction === 'pass' ? 'job.passed' : 'job.saved', { meta: { jobId: job._id, jobTitle: job.title, company: job.company } });

  const alreadyApplied = await Application.exists({ user: req.user._id, job: jobId });
  res.json({ success: true, data: swipe, alreadyApplied: !!alreadyApplied });
};

// Saved jobs = swipes with direction 'save'
exports.saved = async (req, res) => {
  const swipes = await Swipe.find({ user: req.user._id, direction: 'save' })
    .populate('job')
    .sort({ updatedAt: -1 })
    .lean();
  res.json({ success: true, data: swipes.filter((s) => s.job).map((s) => s.job) });
};

exports.undo = async (req, res) => {
  const swipe = await Swipe.findOneAndDelete({ user: req.user._id, job: req.params.jobId });
  if (!swipe) throw ApiError.notFound('No swipe to undo');
  const job = await Job.findById(req.params.jobId).select('title company').lean();
  logActivity(req, 'job.swipe_undone', { meta: { jobId: req.params.jobId, jobTitle: job?.title, company: job?.company, was: swipe.direction } });
  res.json({ success: true, message: 'Swipe undone' });
};
