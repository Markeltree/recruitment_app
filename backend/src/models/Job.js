const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, required: true, trim: true },
    companyLogo: String,
    location: { type: String, default: 'Remote' },
    category: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    workMode: { type: String, enum: ['onsite', 'hybrid', 'remote'], default: 'remote' },
    salaryMin: Number,
    salaryMax: Number,
    currency: { type: String, default: 'USD' },
    description: { type: String, required: true },
    requirements: [String],
    skills: [String],
    experienceYears: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'open', 'closed'], default: 'open' },
    featured: { type: Boolean, default: false },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    views: { type: Number, default: 0 },
    applicantsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    expiresAt: Date,
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', skills: 'text', description: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
