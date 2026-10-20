export const colors = {
  brand: '#2F6BFF',
  brandDark: '#1A46BD',
  brandDeep: '#14286B',
  brandSoft: '#EEF4FF',
  ink: '#0B1220',
  inkSoft: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  border: '#E2E8F0',
  line: '#E8ECF3',
  surface: '#FFFFFF',
  background: '#F5F7FB',
  success: '#16A34A',
  danger: '#E11D48',
  warning: '#F59E0B',
  violet: '#7C3AED',
};

// Soft, layered shadows. iOS uses shadow*, Android uses elevation.
export const shadow = {
  sm: { shadowColor: '#0B1220', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  md: { shadowColor: '#0B1220', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  lg: { shadowColor: '#0B1220', shadowOpacity: 0.12, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 10 },
  brand: { shadowColor: '#2F6BFF', shadowOpacity: 0.3, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
};

export const statusMeta = {
  applied: { label: 'Applied', bg: 'bg-brand-50', text: 'text-brand-600', dot: '#2F6BFF', step: 1 },
  reviewing: { label: 'Reviewing', bg: 'bg-amber-50', text: 'text-amber-700', dot: '#F59E0B', step: 2 },
  interview: { label: 'Interview', bg: 'bg-violet-50', text: 'text-violet-700', dot: '#7C3AED', step: 3 },
  offer: { label: 'Offer', bg: 'bg-green-50', text: 'text-green-700', dot: '#16A34A', step: 4 },
  rejected: { label: 'Not selected', bg: 'bg-rose-50', text: 'text-rose-600', dot: '#E11D48', step: 0 },
  withdrawn: { label: 'Withdrawn', bg: 'bg-slate-100', text: 'text-slate-500', dot: '#94A3B8', step: 0 },
};

// Deterministic tint per company so initials-logos look intentional, not random
const LOGO_TINTS = [
  { bg: '#EEF2FF', fg: '#4338CA' },
  { bg: '#ECFDF5', fg: '#047857' },
  { bg: '#FFF7ED', fg: '#C2410C' },
  { bg: '#FDF2F8', fg: '#BE185D' },
  { bg: '#F0F9FF', fg: '#0369A1' },
  { bg: '#F5F3FF', fg: '#6D28D9' },
  { bg: '#FEFCE8', fg: '#A16207' },
];

export const tintFor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return LOGO_TINTS[h % LOGO_TINTS.length];
};

export const initialsOf = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

export const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return 'Salary undisclosed';
  const fmt = (n) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`;
  return `${currency} ${fmt(min || max)} - ${fmt(max || min)}`;
};

export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};
