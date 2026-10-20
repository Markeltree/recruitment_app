const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema(
  {
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
  },
  { _id: true }
);

// A past project the candidate can attach to proposals
const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 600 },
    link: { type: String, maxlength: 500 },
    role: { type: String, maxlength: 80 },
    skills: [String],
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['candidate', 'recruiter', 'admin'], default: 'candidate' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    avatarUrl: String,
    headline: { type: String, maxlength: 120 },
    bio: { type: String, maxlength: 1000 },
    phone: String,
    location: String,
    skills: [String],
    experience: [experienceSchema],
    portfolio: { type: [portfolioItemSchema], default: [] },
    preferences: {
      jobTypes: { type: [String], default: [] },
      minSalary: Number,
      remoteOnly: { type: Boolean, default: false },
      categories: { type: [String], default: [] },
    },
    onboarded: { type: Boolean, default: false },
    pushToken: String,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.pushToken;
  delete obj.__v;
  return obj;
};

userSchema.index({ role: 1, status: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
