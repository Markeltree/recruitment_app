const ActivityLog = require('../models/ActivityLog');

/**
 * Records an activity entry without blocking or failing the request.
 * action: '<category>.<verb>', e.g. 'auth.login', 'application.submitted'.
 * opts.user  - whose timeline it belongs to (defaults to the signed-in user)
 * opts.meta  - small, non-sensitive context (ids, titles, field names). Never pass passwords.
 */
function logActivity(req, action, { user, meta } = {}) {
  const subject = user || req.user?._id;
  if (!subject) return;
  const actor = req.user?._id && String(req.user._id) !== String(subject) ? req.user._id : undefined;

  ActivityLog.create({
    user: subject,
    actor,
    action,
    category: action.split('.')[0],
    meta,
    ip: req.ip,
    userAgent: req.get('user-agent')?.slice(0, 300),
  }).catch((err) => console.error('[activity] failed to record', action, err.message));
}

module.exports = { logActivity };
