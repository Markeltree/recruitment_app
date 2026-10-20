import { Link } from 'react-router-dom';

export const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'auth', label: 'Sign-in & security' },
  { key: 'profile', label: 'Profile' },
  { key: 'job', label: 'Jobs' },
  { key: 'application', label: 'Applications' },
  { key: 'ai', label: 'AI' },
  { key: 'admin', label: 'Admin' },
];

const TONES = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-100',
  green: 'bg-green-50 text-green-600 ring-green-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  ink: 'bg-ink-100 text-ink-700 ring-ink-200',
};

// Feather-style icon paths
const ICONS = {
  login: 'M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3',
  alert: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  key: 'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 11-7.8 7.8 5.5 5.5 0 017.8-7.8zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.1 2.1 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  bookmark: 'M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z',
  x: 'M18 6L6 18M6 6l12 12',
  undo: 'M3 7v6h6M21 17a9 9 0 00-15-6.7L3 13',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 100-6 3 3 0 000 6z',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  briefcase: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z',
  trash: 'M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6',
  sparkles: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  check: 'M20 6L9 17l-5-5',
};

const job = (m) => (m?.jobTitle ? `${m.jobTitle}${m.company ? ` at ${m.company}` : ''}` : 'a job');

// action -> how it reads in the admin timeline
const ACTIONS = {
  'auth.register': { icon: 'user', tone: 'green', text: (m) => `Created an account${m?.role ? ` as ${m.role}` : ''}` },
  'auth.login': { icon: 'login', tone: 'brand', text: () => 'Signed in' },
  'auth.login_failed': {
    icon: 'alert',
    tone: 'rose',
    text: (m) => (m?.reason === 'suspended' ? 'Sign-in blocked (account suspended)' : 'Failed sign-in attempt (wrong password)'),
  },
  'auth.password_changed': { icon: 'key', tone: 'violet', text: () => 'Changed password' },
  'auth.password_change_failed': { icon: 'alert', tone: 'amber', text: () => 'Password change failed (wrong current password)' },
  'profile.onboarded': { icon: 'check', tone: 'green', text: (m) => `Completed onboarding${m?.categories?.length ? ` · ${m.categories.join(', ')}` : ''}` },
  'profile.portfolio_added': { icon: 'briefcase', tone: 'green', text: (m) => `Added portfolio project "${m?.title || ''}"` },
  'profile.portfolio_updated': { icon: 'edit', tone: 'ink', text: (m) => `Edited portfolio project "${m?.title || ''}"` },
  'profile.portfolio_removed': { icon: 'trash', tone: 'amber', text: (m) => `Removed portfolio project "${m?.title || ''}"` },
  'profile.updated': { icon: 'edit', tone: 'ink', text: (m) => `Updated profile${m?.fields?.length ? `: ${m.fields.join(', ')}` : ''}` },
  'job.viewed': { icon: 'eye', tone: 'ink', text: (m) => `Viewed ${job(m)}` },
  'job.saved': { icon: 'bookmark', tone: 'brand', text: (m) => `Saved ${job(m)}` },
  'job.passed': { icon: 'x', tone: 'ink', text: (m) => `Passed on ${job(m)}` },
  'job.swipe_undone': { icon: 'undo', tone: 'amber', text: (m) => `Undid ${m?.was === 'pass' ? 'pass' : 'save'} on ${job(m)}` },
  'job.created': { icon: 'briefcase', tone: 'green', text: (m) => `Posted ${job(m)}` },
  'job.updated': { icon: 'edit', tone: 'ink', text: (m) => `Edited ${job(m)}` },
  'job.deleted': { icon: 'trash', tone: 'rose', text: (m) => `Deleted ${job(m)}` },
  'application.submitted': {
    icon: 'send',
    tone: 'green',
    text: (m) => {
      const extras = [m?.withCoverNote && 'cover letter', m?.attachments && `${m.attachments} project${m.attachments > 1 ? 's' : ''}`, m?.expectedPay && `rate ${m.expectedPay}`].filter(Boolean);
      return `Sent a proposal for ${job(m)}${extras.length ? ` · ${extras.join(', ')}` : ''}`;
    },
  },
  'application.withdrawn': { icon: 'undo', tone: 'amber', text: (m) => `Withdrew application for ${job(m)}` },
  'application.status_changed': { icon: 'flag', tone: 'violet', text: (m) => `Application for ${job(m)} moved ${m?.from || '?'} → ${m?.to || '?'}` },
  'ai.cover_note': { icon: 'sparkles', tone: 'violet', text: (m) => `Generated an AI cover note for ${job(m)}${m?.tone ? ` (${m.tone})` : ''}` },
  'ai.match_insight': {
    icon: 'sparkles',
    tone: 'violet',
    text: (m) => `AI match insight for ${job(m)}${m?.score != null ? ` · score ${m.score}` : ''}${m?.cached ? ' (cached)' : ''}`,
  },
  'admin.user_suspended': { icon: 'shield', tone: 'rose', text: () => 'Account suspended' },
  'admin.user_reactivated': { icon: 'shield', tone: 'green', text: () => 'Account reactivated' },
  'admin.user_updated': {
    icon: 'shield',
    tone: 'amber',
    text: (m) => (m?.fromRole && m?.toRole && m.fromRole !== m.toRole ? `Role changed ${m.fromRole} → ${m.toRole}` : `Account updated: ${(m?.fields || []).join(', ')}`),
  },
  'admin.user_deleted': { icon: 'trash', tone: 'rose', text: (m) => `Deleted user ${m?.name || ''}${m?.email ? ` (${m.email})` : ''}` },
};

export function describe(log) {
  const def = ACTIONS[log.action];
  return {
    icon: ICONS[def?.icon] || ICONS.check,
    tone: TONES[def?.tone] || TONES.ink,
    text: def ? def.text(log.meta) : log.action,
  };
}

// Rough client label from the User-Agent header
export function deviceLabel(ua = '') {
  if (!ua) return 'Unknown device';
  if (/okhttp/i.test(ua)) return 'Android app';
  if (/CFNetwork|Darwin/i.test(ua)) return 'iOS app';
  if (/Expo/i.test(ua)) return 'Mobile app';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : null;
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Linux/.test(ua) ? 'Linux' : null;
  if (browser || os) return [browser, os].filter(Boolean).join(' on ');
  return ua.split(' ')[0].slice(0, 40);
}

export function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export function ActionIcon({ path, tone, size = 'h-9 w-9' }) {
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${tone}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </span>
  );
}

/**
 * Vertical timeline. `subjectId` is the user whose page we're on: entries performed by
 * someone else on that user show "by <actor>", entries the subject did to others show the target.
 */
export function ActivityTimeline({ items, showUser, subjectId }) {
  return (
    <ol className="relative">
      {items.map((log, i) => {
        const d = describe(log);
        // On a user's page: entries where that user acted on someone else read "... for <target>"
        const onOther = subjectId && log.user && String(log.user._id) !== String(subjectId);
        // Otherwise, entries someone else performed carry a "by <actor>" badge
        const showActor = log.actor && !onOther;
        return (
          <li key={log._id} className="group relative flex gap-4 px-6 py-3.5 transition hover:bg-ink-50 animate-fadeUp" style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
            {i < items.length - 1 ? <span className="absolute bottom-0 left-[42px] top-12 w-px bg-ink-200" aria-hidden /> : null}
            <ActionIcon path={d.icon} tone={d.tone} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-900">
                {showUser && log.user ? (
                  <Link to={`/users/${log.user._id}`} className="font-semibold hover:text-brand-600">
                    {log.user.name}
                  </Link>
                ) : null}
                {showUser && log.user ? <span className="text-ink-500"> · </span> : null}
                {d.text}
                {onOther && log.user ? (
                  <>
                    {' '}
                    <span className="text-ink-500">for</span>{' '}
                    <Link to={`/users/${log.user._id}`} className="font-semibold hover:text-brand-600">
                      {log.user.name}
                    </Link>
                  </>
                ) : null}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-500">
                <span title={new Date(log.createdAt).toLocaleString()}>{timeAgo(log.createdAt)}</span>
                <span>·</span>
                <span>{deviceLabel(log.userAgent)}</span>
                {log.ip ? (
                  <>
                    <span>·</span>
                    <span className="font-mono">{log.ip}</span>
                  </>
                ) : null}
                {showActor ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                    by {log.actor.name} ({log.actor.role})
                  </span>
                ) : null}
              </p>
            </div>
            <span className="hidden shrink-0 text-xs text-ink-300 sm:block">{new Date(log.createdAt).toLocaleString()}</span>
          </li>
        );
      })}
    </ol>
  );
}

// Horizontal category tabs with optional 24h counts
export function CategoryTabs({ value, onChange, summary }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {CATEGORIES.map((c) => {
        const n = c.key ? summary?.[c.key] : null;
        const active = value === c.key;
        return (
          <button
            key={c.key || 'all'}
            onClick={() => onChange(c.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            {c.label}
            {n ? <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-white/20' : 'bg-white text-ink-500'}`}>{n}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
