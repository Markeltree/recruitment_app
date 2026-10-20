const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

// Only http(s) links: these are rendered as clickable links in the admin console
const httpUrl = z
  .string()
  .trim()
  .max(500)
  .url('Enter a valid link')
  .refine((u) => /^https?:\/\//i.test(u), 'Link must start with http:// or https://');

const AVAILABILITY = ['immediately', '1-week', '2-weeks', '1-month', 'flexible'];

const portfolioItem = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(600).optional(),
  link: httpUrl.optional().or(z.literal('')),
  role: z.string().trim().max(80).optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(15).optional(),
});

const register = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(72),
  role: z.enum(['candidate', 'recruiter']).default('candidate'),
});

const login = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const profileUpdate = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  headline: z.string().max(120).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(30).optional(),
  location: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string().trim().max(40)).max(40).optional(),
  onboarded: z.boolean().optional(),
  pushToken: z.string().optional(),
  preferences: z
    .object({
      jobTypes: z.array(z.enum(['full-time', 'part-time', 'contract', 'internship'])).optional(),
      minSalary: z.number().min(0).optional(),
      remoteOnly: z.boolean().optional(),
      categories: z.array(z.string()).optional(),
    })
    .optional(),
  experience: z
    .array(
      z.object({
        title: z.string().max(120),
        company: z.string().max(120),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
        current: z.boolean().optional(),
        description: z.string().max(1000).optional(),
      })
    )
    .optional(),
});

const changePassword = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6).max(72),
});

const jobInput = z.object({
  title: z.string().trim().min(3).max(120),
  company: z.string().trim().min(2).max(120),
  companyLogo: z.string().url().optional().or(z.literal('')),
  location: z.string().max(120).optional(),
  category: z.string().trim().min(2).max(60),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  workMode: z.enum(['onsite', 'hybrid', 'remote']).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  description: z.string().min(20),
  requirements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  status: z.enum(['draft', 'open', 'closed']).optional(),
  featured: z.boolean().optional(),
});

const jobQuery = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional(),
  workMode: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sort: z.enum(['newest', 'salary', 'popular']).default('newest'),
});

const applyBody = z.object({
  coverNote: z.string().max(1000).optional(),
  expectedPay: z
    .object({
      amount: z.number().positive().max(100000000),
      period: z.enum(['month', 'hour']),
    })
    .optional(),
  availability: z.enum(AVAILABILITY).optional(),
  portfolioIds: z.array(objectId).max(3, 'Attach up to 3 projects').optional(),
});

const aiCoverNote = z.object({
  tone: z.enum(['professional', 'friendly', 'concise']).optional(),
});

const swipeBody = z.object({
  jobId: objectId,
  direction: z.enum(['like', 'pass', 'save']),
});

const applicationStatus = z.object({
  status: z.enum(['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn']),
  note: z.string().max(300).optional(),
});

const notificationInput = z.object({
  title: z.string().min(2).max(120),
  body: z.string().min(2).max(500),
  audience: z.enum(['all', 'candidates']).default('all'),
});

const userAdminUpdate = z.object({
  status: z.enum(['active', 'suspended']).optional(),
  role: z.enum(['candidate', 'recruiter', 'admin']).optional(),
});

module.exports = {
  objectId,
  register,
  login,
  profileUpdate,
  changePassword,
  jobInput,
  jobQuery,
  applyBody,
  aiCoverNote,
  portfolioItem,
  swipeBody,
  applicationStatus,
  notificationInput,
  userAdminUpdate,
};
