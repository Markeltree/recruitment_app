const mongoose = require('mongoose');

// Records every swipe so the discovery feed never repeats a job.
const swipeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    direction: { type: String, enum: ['like', 'pass', 'save'], required: true },
  },
  { timestamps: true }
);

swipeSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('Swipe', swipeSchema);
