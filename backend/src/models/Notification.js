const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    // null user => broadcast to everyone (admin announcements)
    audience: { type: String, enum: ['user', 'all', 'candidates'], default: 'user' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['application', 'match', 'system', 'announcement'],
      default: 'system',
    },
    data: mongoose.Schema.Types.Mixed,
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
