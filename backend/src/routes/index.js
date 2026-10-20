const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const s = require('../utils/schemas');
const auth = require('../controllers/auth.controller');
const jobs = require('../controllers/job.controller');
const apps = require('../controllers/application.controller');
const swipes = require('../controllers/swipe.controller');
const users = require('../controllers/user.controller');
const notifs = require('../controllers/notification.controller');
const admin = require('../controllers/admin.controller');
const ai = require('../controllers/ai.controller');
const activity = require('../controllers/activity.controller');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });

// AI calls cost money per request, so cap them per user (not per IP)
const aiLimiter = (limit) =>
  rateLimit({
    windowMs: 60 * 60 * 1000,
    limit,
    keyGenerator: (req) => String(req.user._id),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'AI limit reached for this hour, please try again later' },
  });

const admins = [requireAuth, requireRole('admin')];
const recruiterOrAdmin = [requireAuth, requireRole('admin', 'recruiter')];
const H = asyncHandler;

// Health
router.get('/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date() }));

// ---------- Auth ----------
router.post('/auth/register', authLimiter, validate(s.register), H(auth.register));
router.post('/auth/login', authLimiter, validate(s.login), H(auth.login));
router.get('/auth/me', requireAuth, H(auth.me));
router.post('/auth/change-password', requireAuth, validate(s.changePassword), H(auth.changePassword));

// ---------- Jobs ----------
router.get('/jobs', validate(s.jobQuery, 'query'), H(jobs.list));
router.get('/jobs/categories', H(jobs.categories));
router.get('/jobs/feed', requireAuth, H(jobs.feed));
router.get('/jobs/:id', requireAuth, H(jobs.getOne));
router.post('/jobs', recruiterOrAdmin, validate(s.jobInput), H(jobs.create));
router.patch('/jobs/:id', recruiterOrAdmin, validate(s.jobInput.partial()), H(jobs.update));
router.delete('/jobs/:id', admins, H(jobs.remove));

// ---------- Swipes ----------
router.post('/swipes', requireAuth, validate(s.swipeBody), H(swipes.record));
router.get('/swipes/saved', requireAuth, H(swipes.saved));
router.delete('/swipes/:jobId', requireAuth, H(swipes.undo));

// ---------- Applications ----------
router.get('/applications/me', requireAuth, H(apps.mine));
router.post('/applications/:jobId', requireAuth, validate(s.applyBody), H(apps.apply));
router.post('/applications/:id/withdraw', requireAuth, H(apps.withdraw));
router.get('/applications', recruiterOrAdmin, H(apps.adminList));
router.patch('/applications/:id/status', recruiterOrAdmin, validate(s.applicationStatus), H(apps.updateStatus));

// ---------- AI ----------
router.post('/ai/cover-note/:jobId', requireAuth, aiLimiter(20), validate(s.aiCoverNote), H(ai.coverNote));
router.get('/ai/match/:jobId', requireAuth, aiLimiter(60), H(ai.matchInsight));

// ---------- Users / profile ----------
router.patch('/users/me', requireAuth, validate(s.profileUpdate), H(users.updateProfile));
router.get('/users/me/stats', requireAuth, H(users.stats));
router.delete('/users/me', requireAuth, H(users.deleteAccount));

// ---------- Notifications ----------
router.get('/notifications', requireAuth, H(notifs.list));
router.post('/notifications/read-all', requireAuth, H(notifs.markAllRead));
router.post('/notifications/:id/read', requireAuth, H(notifs.markRead));

// ---------- Admin ----------
router.get('/admin/dashboard', admins, H(admin.dashboard));
router.get('/admin/jobs', admins, H(admin.listJobs));
router.get('/admin/users', admins, H(admin.listUsers));
router.get('/admin/users/:id', admins, H(admin.getUser));
router.get('/admin/users/:id/activity', admins, H(activity.forUser));
router.get('/admin/activity', admins, H(activity.list));
router.patch('/admin/users/:id', admins, validate(s.userAdminUpdate), H(admin.updateUser));
router.delete('/admin/users/:id', admins, H(admin.deleteUser));
router.get('/admin/notifications', admins, H(notifs.adminList));
router.post('/admin/notifications', admins, validate(s.notificationInput), H(notifs.broadcast));

module.exports = router;
