require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Job = require('../models/Job');

const jobs = [
  {
    title: 'Senior UX Designer',
    company: 'Copper Inc.',
    location: 'New York, NY',
    category: 'Design',
    type: 'full-time',
    workMode: 'hybrid',
    salaryMin: 110000,
    salaryMax: 140000,
    description: 'Lead end-to-end product design for our mobile and web platforms. You will own research, prototyping and design systems.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    requirements: ['5+ years in product design', 'Strong portfolio of shipped mobile apps'],
    experienceYears: 5,
    featured: true,
  },
  {
    title: 'React Native Engineer',
    company: 'Glassdoor',
    location: 'Remote',
    category: 'Engineering',
    type: 'full-time',
    workMode: 'remote',
    salaryMin: 95000,
    salaryMax: 130000,
    description: 'Build and scale our cross-platform mobile app used by millions. Work closely with product and backend teams.',
    skills: ['React Native', 'TypeScript', 'Expo', 'Redux'],
    requirements: ['3+ years React Native', 'Experience shipping to App Store and Play Store'],
    experienceYears: 3,
    featured: true,
  },
  {
    title: 'Product Manager, Growth',
    company: 'Lumen Labs',
    location: 'San Francisco, CA',
    category: 'Product',
    type: 'full-time',
    workMode: 'onsite',
    salaryMin: 120000,
    salaryMax: 150000,
    description: 'Own the growth roadmap, run experiments and partner with engineering and marketing to drive activation.',
    skills: ['Analytics', 'A/B Testing', 'SQL', 'Roadmapping'],
    experienceYears: 4,
  },
  {
    title: 'Node.js Backend Developer',
    company: 'Stackwise',
    location: 'Remote',
    category: 'Engineering',
    type: 'contract',
    workMode: 'remote',
    salaryMin: 70000,
    salaryMax: 90000,
    description: 'Design and maintain REST APIs and background jobs on Node.js with MongoDB for a fast-growing SaaS.',
    skills: ['Node.js', 'MongoDB', 'Express', 'Docker'],
    experienceYears: 2,
  },
  {
    title: 'Frontend Developer (Tailwind)',
    company: 'Pixelcraft',
    location: 'Berlin, DE',
    category: 'Engineering',
    type: 'part-time',
    workMode: 'hybrid',
    salaryMin: 45000,
    salaryMax: 60000,
    description: 'Craft responsive, accessible interfaces with React and Tailwind CSS for our client dashboards.',
    skills: ['React', 'Tailwind CSS', 'JavaScript', 'Accessibility'],
    experienceYears: 1,
  },
  {
    title: 'Data Analyst Intern',
    company: 'Northwind',
    location: 'Cairo, EG',
    category: 'Data',
    type: 'internship',
    workMode: 'onsite',
    salaryMin: 800,
    salaryMax: 1200,
    description: 'Support the analytics team with dashboards, data cleaning and reporting. Great first step into data science.',
    skills: ['SQL', 'Excel', 'Python', 'Power BI'],
    experienceYears: 0,
  },
];

const isProd = config.env === 'production';
const DEFAULT_ADMIN_PASSWORD = 'Admin@12345';

(async () => {
  // The default credentials are in the public repo, so never use them for a real deployment
  if (isProd && (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD)) {
    throw new Error('Set a strong ADMIN_PASSWORD before seeding a production database');
  }

  await mongoose.connect(config.mongoUri);
  console.log('Seeding database...');

  const adminEmail = config.admin.email;
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'ApplyUp Admin',
      email: adminEmail,
      password: config.admin.password,
      role: 'admin',
      onboarded: true,
    });
    console.log(`Admin created: ${adminEmail}`);
  }

  const demoEmail = 'candidate@applyup.app';
  // Demo account has a published password, so it is only created outside production
  if (!isProd && !(await User.findOne({ email: demoEmail }))) {
    await User.create({
      name: 'Demo Candidate',
      email: demoEmail,
      password: 'Demo@12345',
      role: 'candidate',
      headline: 'Product Designer & React Native Developer',
      skills: ['React Native', 'Figma', 'JavaScript'],
      preferences: { categories: ['Design', 'Engineering'], jobTypes: ['full-time'] },
      onboarded: true,
    });
    console.log(`Demo candidate created: ${demoEmail} / Demo@12345`);
  }

  if ((await Job.countDocuments()) === 0) {
    await Job.insertMany(jobs.map((j) => ({ ...j, postedBy: admin._id })));
    console.log(`Inserted ${jobs.length} sample jobs`);
  }

  console.log('Seed complete');
  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
