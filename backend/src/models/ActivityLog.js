const mongoose = require('mongoose');

const CATEGORIES = ['auth', 'profile', 'job', 'application', 'ai', 'admin'];
const RETENTION_DAYS = 180;

// One row per meaningful user action. `user` is whose timeline the entry belongs to;
// `actor` is set when someone else did it (e.g. an admin suspending the user).
const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    meta: mongoose.Schema.Types.Mixed,
    ip: String,
    userAgent: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ category: 1, createdAt: -1 });
// Old entries are removed automatically by MongoDB
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.RETENTION_DAYS = RETENTION_DAYS;
