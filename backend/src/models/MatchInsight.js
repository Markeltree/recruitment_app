const mongoose = require('mongoose');

// Cached AI fit analysis for one candidate/job pair. `fingerprint` changes whenever the
// candidate profile or the job is edited, which marks the cached copy as stale.
const matchInsightSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    fingerprint: { type: String, required: true },
    score: { type: Number, min: 0, max: 100 },
    verdict: String,
    strengths: [String],
    gaps: [String],
    tip: String,
    aiModel: String,
  },
  { timestamps: true }
);

matchInsightSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('MatchInsight', matchInsightSchema);
