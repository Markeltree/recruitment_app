const mongoose = require('mongoose');

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
