// Small form controls shared by the admin pages

export const STATUS_DOTS = {
  applied: '#2F6BFF',
  reviewing: '#F59E0B',
  interview: '#7C3AED',
  offer: '#16A34A',
  rejected: '#E11D48',
  withdrawn: '#94A3B8',
  open: '#16A34A',
  draft: '#F59E0B',
  closed: '#94A3B8',
  active: '#16A34A',
  suspended: '#E11D48',
  candidate: '#2F6BFF',
  recruiter: '#7C3AED',
  admin: '#0B1220',
};

// Text input with a leading magnifier and a clear button
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input className="input !pl-9 !pr-9" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

// Accessible on/off switch
export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-1">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 ${
          checked ? 'bg-brand-500' : 'bg-ink-300'
        }`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
      <span>
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        {description ? <span className="block text-xs text-ink-500">{description}</span> : null}
      </span>
    </label>
  );
}

// Label + control + optional hint
export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label ? <label className="label">{label}</label> : null}
      {children}
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </div>
  );
}

// Card that holds a row of filters
export function FilterBar({ children }) {
  return <div className="card mb-4 flex flex-wrap items-center gap-3 p-3 animate-fadeUp">{children}</div>;
}
