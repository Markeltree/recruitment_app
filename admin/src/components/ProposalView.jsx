import { Badge } from './UI';

const AVAILABILITY = { immediately: 'Immediately', '1-week': 'In 1 week', '2-weeks': 'In 2 weeks', '1-month': 'In a month', flexible: 'Flexible' };

// Only http(s) links are rendered as anchors (the API also enforces this)
export function SafeLink({ href, children }) {
  if (!href || !/^https?:\/\//i.test(href)) return <span className="text-ink-500">{children || href}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
      {children || href}
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
      </svg>
    </a>
  );
}

const hostOf = (link) => {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

export function ProjectCard({ p }) {
  return (
    <div className="rounded-xl border border-ink-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink-900">{p.title}</p>
          {p.role ? <p className="text-xs text-ink-500">{p.role}</p> : null}
        </div>
        {p.link ? <SafeLink href={p.link}>{hostOf(p.link)}</SafeLink> : null}
      </div>
      {p.description ? <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">{p.description}</p> : null}
      {p.skills?.length ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {p.skills.map((s) => (
            <span key={s} className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
              {s}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="rounded-xl bg-ink-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-900">{value || '—'}</p>
    </div>
  );
}

// Full proposal: who, for what, rate, availability, letter and attached work
export default function ProposalView({ application: a }) {
  const pay = a.proposal?.expectedPay;
  const attachments = a.proposal?.attachments || [];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink-900">{a.user?.name || 'Deleted user'}</p>
          <p className="text-sm text-ink-500">{a.user?.email}</p>
        </div>
        <Badge value={a.status} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Fact label="Role" value={a.job ? `${a.job.title} · ${a.job.company}` : 'Removed job'} />
        <Fact label="Expected pay" value={pay?.amount ? `${pay.currency || ''} ${Number(pay.amount).toLocaleString()} / ${pay.period === 'hour' ? 'hour' : 'month'}` : 'Not specified'} />
        <Fact label="Can start" value={AVAILABILITY[a.proposal?.availability] || 'Not specified'} />
      </div>

      <div>
        <p className="label">Cover letter</p>
        {a.coverNote ? (
          <p className="whitespace-pre-line rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-800">{a.coverNote}</p>
        ) : (
          <p className="text-sm text-ink-500">No cover letter was included.</p>
        )}
      </div>

      <div>
        <p className="label">Attached work ({attachments.length})</p>
        {attachments.length ? (
          <div className="space-y-3">
            {attachments.map((p, i) => (
              <ProjectCard key={p.portfolioId || i} p={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-500">No projects attached.</p>
        )}
      </div>

      <p className="text-xs text-ink-500">Submitted {new Date(a.createdAt).toLocaleString()}</p>
    </div>
  );
}
