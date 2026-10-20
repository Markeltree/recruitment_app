import { useEffect, useState } from 'react';

export function StatCard({ label, value, hint, icon, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card animate-fadeUp p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${tones[tone]}`}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink-900">{value ?? '—'}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

const STATUS_STYLES = {
  active: 'bg-green-50 text-green-700 ring-green-600/20',
  suspended: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  open: 'bg-green-50 text-green-700 ring-green-600/20',
  draft: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  closed: 'bg-ink-100 text-ink-500 ring-ink-300/40',
  applied: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  reviewing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  interview: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  offer: 'bg-green-50 text-green-700 ring-green-600/20',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  withdrawn: 'bg-ink-100 text-ink-500 ring-ink-300/40',
  candidate: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  recruiter: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  admin: 'bg-ink-900 text-white ring-ink-900/10',
};

export function Badge({ value }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_STYLES[value] || 'bg-ink-100 text-ink-700 ring-ink-300/40'}`}>
      {value}
    </span>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fadeUp bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`card relative max-h-[90vh] w-full animate-scaleIn overflow-hidden ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Close">✕</button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="flex justify-end gap-3 border-t border-ink-200 bg-ink-50 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-ink-500">
      <span>Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button className="btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <button className="btn-ghost btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export function Empty({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <p className="font-semibold text-ink-700">{title}</p>
      {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 animate-fadeUp">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-3">{actions}</div> : null}
    </div>
  );
}

export function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
