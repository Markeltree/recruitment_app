import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';

// Set VITE_APK_URL to the EAS build link (or any hosted .apk) to turn on the download buttons
const APK_URL = import.meta.env.VITE_APK_URL;

const ICONS = {
  briefcase: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z',
  sparkle: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z',
  doc: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M8 13h8M8 17h5',
  bell: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-5-5.9V4a1 1 0 00-2 0v1.1A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  users: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
  arrow: 'M5 12h14M13 5l7 7-7 7',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  plus: 'M12 5v14M5 12h14',
  menu: 'M4 6h16M4 12h16M4 18h16',
  android: 'M7 10v6M17 10v6M9 18v3M15 18v3M6 8h12v10H6zM8 4l1.5 2.5M16 4l-1.5 2.5',
};

function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Logo({ light }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-[0_8px_20px_-8px_rgba(47,107,255,0.8)]">
        <Icon name="briefcase" className="h-[18px] w-[18px]" />
      </div>
      <span className={`text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink-900'}`}>ApplyUp</span>
    </div>
  );
}

// Fades a section in the first time it scrolls into view
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return setShown(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-700 ease-out motion-reduce:transition-none ${shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
}

// Primary app CTA: downloads the APK when a link is configured, otherwise says it's coming soon
function GetAppButton({ className = '' }) {
  if (APK_URL) {
    return (
      <a href={APK_URL} className={`btn-primary !h-12 !rounded-2xl !px-6 !text-[15px] ${className}`}>
        <Icon name="download" className="h-[18px] w-[18px]" />
        Download for Android
      </a>
    );
  }
  return (
    <span className={`inline-flex h-12 cursor-default items-center gap-2 rounded-2xl bg-white px-6 text-[15px] font-semibold text-ink-900 ${className}`}>
      <Icon name="android" className="h-[18px] w-[18px]" />
      Android app coming soon
    </span>
  );
}

function SectionHeading({ eyebrow, title, text, light }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${light ? 'text-brand-100' : 'text-brand-600'}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-extrabold tracking-tight sm:text-[42px] sm:leading-[1.1] ${light ? 'text-white' : 'text-ink-900'}`}>{title}</h2>
      {text ? <p className={`mt-4 text-lg ${light ? 'text-ink-300' : 'text-ink-500'}`}>{text}</p> : null}
    </div>
  );
}

/* ---------- Hero visual ---------- */

function JobCard({ company, initial, tone, title, meta, tags, match }) {
  return (
    <div className="rounded-[22px] border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold ${tone}`}>{initial}</div>
        <div>
          <p className="text-[13px] font-bold text-ink-900">{company}</p>
          <p className="text-[10px] text-ink-500">{meta}</p>
        </div>
      </div>
      <p className="mt-3 text-[17px] font-extrabold leading-tight text-ink-900">{title}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="rounded-md bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-700">{t}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50 p-2.5">
        <Icon name="sparkle" className="h-4 w-4 text-brand-600" />
        <p className="text-[11px] font-semibold text-brand-700">{match}% AI match with your profile</p>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-2 rounded bg-ink-100" />
        <div className="h-2 w-4/5 rounded bg-ink-100" />
        <div className="h-2 w-3/5 rounded bg-ink-100" />
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      <div className="relative rounded-[46px] bg-gradient-to-b from-ink-700 to-ink-900 p-[10px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/15">
        <div className="absolute left-1/2 top-[18px] z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink-900" />
        <div className="h-[580px] overflow-hidden rounded-[37px] bg-[#F5F7FB]">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-5 pb-5 pt-11 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-white/70">Good morning 👋</p>
                <p className="text-lg font-extrabold">Ayesha</p>
              </div>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Icon name="bell" className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400" />
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              {[['12', 'Picks left'], ['5', 'Saved'], ['3', 'Applied']].map(([v, l]) => (
                <div key={l} className="flex-1 rounded-xl border border-white/15 bg-white/10 px-2 py-1.5">
                  <p className="text-[9px] font-semibold text-white/75">{l}</p>
                  <p className="text-sm font-extrabold">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative px-4 pt-5">
            <div className="absolute inset-x-8 top-8 h-[250px] rotate-[5deg] rounded-[22px] border border-ink-200 bg-white/60" />
            <div className="absolute inset-x-6 top-6 h-[250px] rotate-[-3deg] rounded-[22px] border border-ink-200 bg-white/80" />
            <div className="relative rotate-[-1.5deg]">
              <JobCard
                company="Nimbus Labs"
                initial="N"
                tone="bg-violet-100 text-violet-600"
                meta="Remote · Full-time"
                title="Senior React Native Developer"
                tags={['React Native', 'TypeScript', '$4k–6k/mo']}
                match={92}
              />
            </div>
            <div className="mt-5 flex items-end justify-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-white text-rose-600 shadow-card">
                <Icon name="x" className="h-5 w-5" strokeWidth={2.4} />
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-[0_10px_20px_-8px_rgba(47,107,255,0.8)]">
                <Icon name="bookmark" className="h-5 w-5" />
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-white shadow-card">
                <Icon name="send" className="h-[18px] w-[18px]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingChip({ icon, tone, title, text, className, delay = '0s' }) {
  return (
    <div
      style={{ animationDelay: delay }}
      className={`absolute z-20 hidden w-max animate-float items-center gap-3 rounded-2xl bg-white/95 p-3 pr-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] ring-1 ring-black/5 backdrop-blur sm:flex ${className}`}
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <div>
        <p className="text-[13px] font-bold text-ink-900">{title}</p>
        <p className="text-[11px] text-ink-500">{text}</p>
      </div>
    </div>
  );
}

/* ---------- Feature visuals ---------- */

function MatchRing({ value }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#EEF4FF" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="url(#ring)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2F6BFF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-ink-900">{value}%</span>
        <span className="text-[10px] font-semibold text-ink-500">match</span>
      </div>
    </div>
  );
}

function BentoCard({ className = '', title, text, children, delay }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="card flex h-full flex-col overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-pop sm:p-7">
        <div className="flex-1">{children}</div>
        <h3 className="mt-6 text-lg font-bold text-ink-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{text}</p>
      </div>
    </Reveal>
  );
}

const PIPELINE = [
  { label: 'Applied', tone: 'bg-brand-500' },
  { label: 'Reviewing', tone: 'bg-amber-500' },
  { label: 'Interview', tone: 'bg-violet-500' },
  { label: 'Offer', tone: 'bg-green-500' },
];

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Features" title="Everything you need to land the role" text="Fewer tabs, better applications. ApplyUp puts discovery, matching and proposals in one place." />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {/* Swipe */}
          <BentoCard className="md:col-span-3" title="Swipe to discover" text="A personal feed of roles. Swipe right to save, left to pass, and undo if you change your mind.">
            <div className="relative flex h-44 items-center justify-center">
              <div className="absolute h-32 w-52 -rotate-[10deg] rounded-2xl border border-ink-200 bg-ink-50" />
              <div className="absolute h-32 w-52 rotate-[6deg] rounded-2xl border border-ink-200 bg-white" />
              <div className="relative h-32 w-52 translate-x-6 rotate-[12deg] rounded-2xl border border-brand-500/40 bg-white p-4 shadow-pop">
                <span className="absolute -top-3 left-4 rounded-lg bg-brand-500 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">Save</span>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100" />
                  <div className="space-y-1.5">
                    <div className="h-2 w-20 rounded bg-ink-200" />
                    <div className="h-2 w-12 rounded bg-ink-100" />
                  </div>
                </div>
                <div className="mt-4 h-3 w-36 rounded bg-ink-200" />
                <div className="mt-2 h-3 w-24 rounded bg-ink-100" />
              </div>
            </div>
          </BentoCard>

          {/* AI match */}
          <BentoCard className="md:col-span-3" delay={80} title="AI match score" text="Every job is scored against your skills and experience, with the reasons spelled out.">
            <div className="flex h-44 items-center gap-6">
              <MatchRing value={92} />
              <ul className="space-y-2.5 text-sm">
                {['5 of 6 required skills', 'Seniority matches', 'Remote preference fits'].map((r) => (
                  <li key={r} className="flex items-center gap-2 text-ink-700">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <Icon name="check" className="h-3 w-3" strokeWidth={2.6} />
                    </span>
                    {r}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-ink-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <Icon name="plus" className="h-3 w-3" strokeWidth={2.6} />
                  </span>
                  Learn GraphQL to reach 100%
                </li>
              </ul>
            </div>
          </BentoCard>

          {/* Proposal */}
          <BentoCard className="md:col-span-2" delay={0} title="Upwork-style proposals" text="Apply with a cover note, expected pay and availability. AI drafts the note in your tone.">
            <div className="h-44 rounded-2xl bg-ink-50 p-4 ring-1 ring-ink-200/70">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-600">
                <Icon name="sparkle" className="h-3.5 w-3.5" /> AI draft · Friendly tone
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-700">
                Hi! I've shipped three React Native apps to production and would love to bring that experience to Nimbus…
              </p>
              <div className="mt-3 flex gap-2">
                <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-ink-700 ring-1 ring-ink-200">$5,000 / mo</span>
                <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-ink-700 ring-1 ring-ink-200">Starts in 2 weeks</span>
              </div>
            </div>
          </BentoCard>

          {/* Portfolio */}
          <BentoCard className="md:col-span-2" delay={80} title="Portfolio attachments" text="Showcase projects once, then attach the right ones to each proposal.">
            <div className="grid h-44 grid-cols-2 gap-3">
              {[
                ['from-brand-500 to-violet-600', 'Fintech app'],
                ['from-amber-400 to-rose-500', 'E-commerce'],
                ['from-green-400 to-teal-600', 'Health tracker'],
                ['from-sky-400 to-brand-600', 'SaaS dashboard'],
              ].map(([g, label], i) => (
                <div key={label} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${g} p-2.5`}>
                  <p className="text-[11px] font-bold text-white">{label}</p>
                  {i < 2 ? (
                    <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-brand-600">
                      <Icon name="check" className="h-3 w-3" strokeWidth={2.8} />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Tracking */}
          <BentoCard className="md:col-span-2" delay={160} title="Track to the offer" text="Follow every application through each stage, and get notified the moment it moves.">
            <div className="flex h-44 flex-col justify-center">
              <div className="relative ml-2 space-y-4 border-l-2 border-dashed border-ink-200 pl-6">
                {PIPELINE.map((s, i) => (
                  <div key={s.label} className="relative flex items-center justify-between">
                    <span className={`absolute -left-[33px] h-3.5 w-3.5 rounded-full ring-4 ring-white ${i <= 2 ? s.tone : 'bg-ink-200'}`} />
                    <span className={`text-sm font-semibold ${i <= 2 ? 'text-ink-900' : 'text-ink-300'}`}>{s.label}</span>
                    {i === 2 ? <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Thu, 3 PM</span> : null}
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

/* ---------- Page sections ---------- */

const CATEGORIES = ['Engineering', 'Design', 'Product', 'Data', 'Marketing', 'Sales', 'Remote', 'Full-time', 'Contract', 'Internships'];

const STEPS = [
  { icon: 'users', title: 'Create your profile', text: 'Pick your role, skills and preferences in a 60-second onboarding.' },
  { icon: 'sparkle', title: 'Swipe through matches', text: 'Save the roles that fit and see exactly why each one matches you.' },
  { icon: 'send', title: 'Send a proposal', text: 'Apply with a cover note and portfolio, then track it all the way to an offer.' },
];

const ADMIN_POINTS = [
  { icon: 'users', text: 'Live overview of users, jobs and applications' },
  { icon: 'briefcase', text: 'Post, edit and close job listings' },
  { icon: 'doc', text: 'Review proposals and move candidates through stages' },
  { icon: 'shield', text: 'Suspend accounts and broadcast announcements' },
];

const FAQS = [
  { q: 'Is ApplyUp free for job seekers?', a: 'Yes. Creating a profile, swiping, saving jobs and sending proposals are all free for candidates.' },
  { q: 'How does the AI match score work?', a: "We compare a job's requirements with your skills, experience and preferences, then show a score along with the reasons behind it, including what would raise it." },
  { q: 'Can I attach my previous work to an application?', a: 'Yes. Add projects to your portfolio once, then pick which ones to attach to each proposal.' },
  { q: 'Is there an iPhone version?', a: 'ApplyUp is available on Android first. iOS is on the roadmap.' },
];

function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        </Reveal>
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group card px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
                  {f.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500 transition-transform duration-300 group-open:rotate-45">
                    <Icon name="plus" className="h-4 w-4" strokeWidth={2.2} />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const user = useAuth((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const consoleTo = user ? '/dashboard' : '/login';
  const consoleLabel = user ? 'Open dashboard' : 'Admin sign in';
  const nav = [
    ['#features', 'Features'],
    ['#how', 'How it works'],
    ['#admin', 'For admins'],
    ['#faq', 'FAQ'],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F6F8FC]">
      {/* Hero (dark) */}
      <div className="relative overflow-hidden bg-ink-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)',
          }}
        />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-500/30 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 top-40 h-[30rem] w-[30rem] rounded-full bg-violet-600/25 blur-[120px]" />

        {/* Nav */}
        <header className="relative z-40">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
            <Logo light />
            <nav className="hidden items-center gap-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10 md:flex">
              {nav.map(([href, label]) => (
                <a key={href} href={href} className="rounded-full px-4 py-1.5 text-sm font-medium text-ink-300 transition hover:bg-white/10 hover:text-white">
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Link to={consoleTo} className="hidden h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink-900 transition hover:bg-ink-100 sm:inline-flex">
                {consoleLabel}
              </Link>
              <button onClick={() => setMenuOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-xl text-white ring-1 ring-white/15 md:hidden" aria-label="Menu">
                <Icon name={menuOpen ? 'x' : 'menu'} />
              </button>
            </div>
          </div>
          {menuOpen ? (
            <div className="mx-4 mb-2 animate-scaleIn rounded-2xl bg-ink-800 p-2 ring-1 ring-white/10 md:hidden">
              {nav.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-ink-300 hover:bg-white/5 hover:text-white">
                  {label}
                </a>
              ))}
              <Link to={consoleTo} className="mt-1 block rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-ink-900">
                {consoleLabel}
              </Link>
            </div>
          ) : null}
        </header>

        <section className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 pb-24 pt-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-28 lg:pt-16">
          <div className="animate-fadeUp text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 py-1 pl-1 pr-3 text-xs font-semibold text-ink-300 ring-1 ring-white/10">
              <span className="rounded-full bg-gradient-to-r from-brand-500 to-violet-600 px-2 py-0.5 text-white">New</span>
              AI cover notes in your own tone
            </span>
            <h1 className="mt-6 text-[40px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[60px]">
              Find your next job <span className="bg-gradient-to-r from-brand-500 via-[#6E8CFF] to-violet-400 bg-clip-text text-transparent">one swipe</span> at a time.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-300 lg:mx-0">
              ApplyUp turns job hunting into a fast, focused feed. See how well you match, send a polished proposal with your portfolio, and track every application in one app.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
              <GetAppButton />
              <a href="#how" className="inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-[15px] font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/10">
                How it works
                <Icon name="arrow" className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 lg:justify-start">
              {[
                ['Free', 'for candidates'],
                ['AI', 'match on every job'],
                ['1 tap', 'proposals'],
              ].map(([big, small]) => (
                <div key={big} className="text-left">
                  <p className="text-2xl font-extrabold text-white">{big}</p>
                  <p className="text-sm text-ink-300">{small}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fadeUp [animation-delay:150ms]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/30 blur-[90px]" />
            <PhoneMockup />
            <FloatingChip icon="sparkle" tone="bg-violet-100 text-violet-600" title="92% match" text="5 of 6 skills" className="-left-6 top-24 lg:-left-16" />
            <FloatingChip icon="send" tone="bg-brand-50 text-brand-600" title="Proposal sent" text="Nimbus Labs · just now" className="-right-4 top-[19rem] lg:-right-14" delay="1.5s" />
            <FloatingChip icon="calendar" tone="bg-green-50 text-green-600" title="Interview booked" text="Thursday, 3:00 PM" className="-left-2 bottom-12 lg:-left-10" delay="3s" />
          </div>
        </section>

        {/* Category marquee */}
        <div className="relative border-t border-white/10 py-5 [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee gap-3 motion-reduce:animate-none">
            {[...CATEGORIES, ...CATEGORIES].map((c, i) => (
              <span key={i} className="whitespace-nowrap rounded-full bg-white/5 px-4 py-1.5 text-sm font-medium text-ink-300 ring-1 ring-white/10">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Features />

      {/* How it works */}
      <section id="how" className="scroll-mt-20 bg-white py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="From profile to offer in three steps" />
          </Reveal>
          <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-brand-500/0 via-brand-500/40 to-brand-500/0 md:block" />
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-[0_14px_30px_-12px_rgba(47,107,255,0.8)]">
                  <Icon name={s.icon} className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white ring-4 ring-white">{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-ink-900">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-500">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Admin console */}
      <section id="admin" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-ink-900 px-6 py-14 sm:px-12 lg:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  <Icon name="shield" className="h-3.5 w-3.5" />
                  Admin console
                </span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Run the whole platform from one place</h2>
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {ADMIN_POINTS.map((p) => (
                    <li key={p.text} className="flex items-start gap-3 rounded-2xl bg-white/5 p-3.5 text-sm text-ink-300 ring-1 ring-white/10">
                      <Icon name={p.icon} className="mt-0.5 h-[18px] w-[18px] shrink-0 text-brand-100" />
                      {p.text}
                    </li>
                  ))}
                </ul>
                <Link to={consoleTo} className="btn-primary mt-8 !h-12 !rounded-2xl !px-6 !text-[15px]">
                  {user ? 'Open dashboard' : 'Sign in to the console'}
                  <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>

              {/* Mini dashboard preview */}
              <div className="rounded-2xl bg-white p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                <div className="mb-3 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-3 text-[11px] font-semibold text-ink-500">Admin / Dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['users', 'Users', 'bg-brand-50 text-brand-600'],
                    ['briefcase', 'Open jobs', 'bg-green-50 text-green-600'],
                    ['doc', 'Applications', 'bg-violet-50 text-violet-600'],
                  ].map(([icon, label, tone]) => (
                    <div key={label} className="rounded-xl p-3 ring-1 ring-ink-200/70">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone}`}>
                        <Icon name={icon} className="h-4 w-4" />
                      </span>
                      <p className="mt-2 text-[11px] font-medium text-ink-500">{label}</p>
                      <div className="mt-1.5 h-3 w-12 rounded bg-ink-200" />
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl p-4 ring-1 ring-ink-200/70">
                  <p className="text-[11px] font-semibold text-ink-500">Applications this week</p>
                  <div className="mt-3 flex h-28 items-end gap-2">
                    {[40, 65, 50, 80, 60, 95, 75].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-500" style={{ height: `${h}%`, opacity: 0.55 + i * 0.065 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <Faq />

      {/* Final CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-500 via-brand-600 to-violet-700 px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Ready to start swiping?</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/80">Install ApplyUp on your Android phone and get your first matches in minutes.</p>
            <div className="relative mt-9 flex justify-center">
              <GetAppButton className="!bg-white !from-white !to-white !text-brand-700 !shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-ink-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 py-10 text-sm text-ink-500 sm:flex-row sm:px-6">
          <Logo />
          <div className="flex flex-wrap justify-center gap-6">
            {nav.map(([href, label]) => (
              <a key={href} href={href} className="hover:text-ink-900">{label}</a>
            ))}
            <Link to={consoleTo} className="font-semibold text-ink-700 hover:text-brand-600">Admin console</Link>
          </div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-ink-900">Privacy</Link>
            <Link to="/terms" className="hover:text-ink-900">Terms</Link>
            <Link to="/delete-account" className="hover:text-ink-900">Delete account</Link>
            <span>© {new Date().getFullYear()} ApplyUp</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
