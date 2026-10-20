# ApplyUp — Swipe-based Job Platform

A production-ready job-discovery platform:

| Part | Stack | Folder |
|---|---|---|
| Mobile app (iOS / Android / Web) | Expo SDK 52, Expo Router, NativeWind (Tailwind), Reanimated, Gesture Handler, Zustand | `mobile/` |
| REST API | Node.js, Express, MongoDB (Mongoose), JWT, Zod, Helmet, rate limiting | `backend/` |
| Admin dashboard | React 18, Vite, Tailwind CSS, React Router, Zustand | `admin/` |

## Features

**Candidate app**
- Onboarding (interests, job type, skills) that personalises the feed
- Swipe deck: drag or tap to *Save* / *Pass*, undo, haptics, animated card stack
- Job details with cover note, one-tap apply, save/unsave
- Applications tracker with status filters and withdraw
- Saved jobs, notifications with unread badge, mark-read
- Profile: edit, change password, stats, job preferences, delete account

**Admin dashboard**
- Overview: KPIs, 14-day signup chart, application pipeline, top jobs
- Users: search, filter by role/status, suspend / reactivate, delete, detail view with applications
- Jobs: create / edit / close / reopen / delete with validation, featured flag
- Applications: filter by status and move candidates through the pipeline (candidate is notified)
- Broadcasts: send announcements to everyone or candidates only

**Backend**
- JWT auth with bcrypt (cost 12), suspended-account enforcement on every request
- Role-based access (`candidate`, `recruiter`, `admin`)
- Zod validation on every write; consistent error shape `{ success, message, details? }`
- Rate-limited auth endpoints, Helmet, compression, CORS allow-list
- Text + regex job search, pagination, sorting, skill-based feed ranking
- Notifications created automatically on apply and status change

---

## 1. Prerequisites

- Node.js 18+ and npm
- MongoDB 6+ (local, Docker, or Atlas)
- For mobile: the Expo Go app on a phone, or Xcode / Android Studio

Start MongoDB quickly with Docker:

```bash
docker compose up -d
```

## 2. Backend

```bash
cd backend
cp .env.example .env        # edit JWT_SECRET for anything beyond local dev
npm install
npm run seed                # creates admin, demo candidate and 6 sample jobs
npm run dev                 # http://localhost:5000/api/v1/health
```

Seeded accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@applyup.app` | `Admin@12345` (from `.env`) |
| Candidate | `candidate@applyup.app` | `Demo@12345` |

### API overview

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | — | Create account (candidate / recruiter) |
| POST | `/auth/login` | — | Get JWT |
| GET | `/auth/me` | user | Current user |
| POST | `/auth/change-password` | user | Change password |
| GET | `/jobs` | — | Public list with `q`, `category`, `type`, `workMode`, `sort`, `page` |
| GET | `/jobs/feed` | user | Personalised swipe deck |
| GET | `/jobs/:id` | user | Job detail with my application/swipe state |
| POST / PATCH / DELETE | `/jobs[/:id]` | recruiter / admin | Manage jobs |
| POST | `/swipes` | user | Record `save` / `pass` / `like` |
| GET | `/swipes/saved` | user | Saved jobs |
| DELETE | `/swipes/:jobId` | user | Undo swipe |
| POST | `/applications/:jobId` | user | Apply (with optional cover note) |
| GET | `/applications/me` | user | My applications |
| POST | `/applications/:id/withdraw` | user | Withdraw |
| GET / PATCH | `/applications[/:id/status]` | recruiter / admin | Review pipeline |
| PATCH / DELETE | `/users/me` | user | Update profile / delete account |
| GET | `/users/me/stats` | user | Application counts by status |
| GET | `/notifications` | user | Notifications + unread count |
| POST | `/notifications/:id/read`, `/read-all` | user | Mark read |
| GET | `/admin/dashboard` | admin | KPIs and charts |
| GET | `/admin/users`, `/admin/users/:id` | admin | Users |
| PATCH / DELETE | `/admin/users/:id` | admin | Suspend, change role, delete |
| GET | `/admin/jobs` | admin | All jobs (any status) |
| GET / POST | `/admin/notifications` | admin | Broadcasts |

## 3. Admin dashboard

```bash
cd admin
npm install
npm run dev                 # http://localhost:5173  (proxies /api to :5000)
```

Sign in with the admin account. For production builds set `VITE_API_URL` to your API origin and run `npm run build`.

## 4. Mobile app

```bash
cd mobile
npm install
npx expo start
```

- Physical device: set `EXPO_PUBLIC_API_URL=http://<your-LAN-ip>:5000/api/v1` in `mobile/.env`, and add your Expo dev URL to `CLIENT_ORIGINS` if you test on web.
- Android emulator: use `http://10.0.2.2:5000/api/v1`.

Build installers with EAS:

```bash
npm i -g eas-cli
eas build --platform all --profile production
```

---

## Production checklist

- [ ] Set a strong `JWT_SECRET` (the server refuses to start in production without one)
- [ ] Use MongoDB Atlas or a managed replica set, with backups enabled
- [ ] Put the API behind HTTPS (Nginx, Caddy, or a PaaS load balancer) and set `CLIENT_ORIGINS` accordingly
- [ ] Change the seeded admin password immediately
- [ ] Serve `admin/dist` from a static host (Netlify, Vercel, S3 + CloudFront)
- [ ] Configure push delivery (Expo Push) using the stored `pushToken` for the alerts tab
- [ ] Set `NODE_ENV=production` so stack traces are hidden from clients

## Project structure

```
applyup/
├── backend/
│   └── src/
│       ├── config/        env + database connection
│       ├── models/        User, Job, Application, Swipe, Notification
│       ├── controllers/   auth, job, application, swipe, user, notification, admin
│       ├── routes/        single router mounted at /api/v1
│       ├── middleware/    auth (JWT + roles), zod validation, error handler
│       └── utils/         ApiError, jwt, schemas, seed
├── mobile/
│   ├── app/               Expo Router screens
│   │   ├── welcome, onboarding, edit-profile, change-password
│   │   ├── (auth)/        login, register
│   │   ├── (tabs)/        discover, applications, saved, notifications, profile
│   │   └── job/[id].js    job details
│   ├── components/        SwipeDeck, JobCard, Button, Input, EmptyState, StatusBadge
│   ├── lib/               axios client, secure token storage
│   └── store/             zustand auth + notification stores
├── admin/
│   └── src/
│       ├── pages/         Login, Dashboard, Users, UserDetail, Jobs, Applications, Notifications
│       ├── components/    Layout, UI kit
│       ├── lib/api.js     API client
│       └── store/auth.js
└── docker-compose.yml
```
