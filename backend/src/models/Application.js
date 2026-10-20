const mongoose = require('mongoose');

const AVAILABILITY = ['immediately', '1-week', '2-weeks', '1-month', 'flexible'];

// Projects are copied into the proposal so later portfolio edits don't change what was sent
const attachmentSchema = new mongoose.Schema(
  {
    portfolioId: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    link: String,
    role: String,
    skills: [String],
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    coverNote: { type: String, maxlength: 1000 },
    proposal: {
      expectedPay: {
        amount: Number,
        period: { type: String, enum: ['month', 'hour'] },
        currency: String,
      },
      availability: { type: String, enum: AVAILABILITY },
      attachments: [attachmentSchema],
    },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.AVAILABILITY = AVAILABILITY;
