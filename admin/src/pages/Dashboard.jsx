import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { PageHeader, Spinner, StatCard, Badge } from '../components/UI';
import { ActivityTimeline } from '../components/Activity';

function Bars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (!data.length) return <p className="py-10 text-center text-sm text-ink-500">No signups in the last 14 days.</p>;
  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((d, i) => (
        <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
          <div
            className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400 transition-all duration-500 group-hover:from-brand-600"
            style={{ height: `${(d.count / max) * 100}%`, minHeight: 6, animationDelay: `${i * 40}ms` }}
          />
          <span className="pointer-events-none absolute -top-8 hidden rounded-md bg-ink-900 px-2 py-1 text-xs text-white group-hover:block">
            {d.count}
          </span>
          <span className="mt-2 text-[10px] text-ink-500">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then(setData).catch((e) => setError(e.message));
    // Recent activity is optional; the dashboard still renders if it fails
    adminApi.activity({ limit: 8 }).then((r) => setRecent(r.data)).catch(() => setRecent([]));
  }, []);

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return <Spinner />;

  const statuses = ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn'];

  return (
    <>
      <PageHeader title="Overview" subtitle="A live snapshot of users, jobs and applications." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={data.users.total} hint={`+${data.users.newThisWeek} this week`} icon="👥" />
        <StatCard label="Open jobs" value={data.jobs.open} hint={`${data.jobs.total} total`} icon="💼" tone="green" />
        <StatCard label="Applications" value={data.applications.total} hint={`+${data.applications.thisWeek} this week`} icon="📨" tone="violet" />
        <StatCard label="Swipe likes" value={data.engagement.likes} hint="Across all candidates" icon="❤️" tone="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2 animate-fadeUp">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold">New signups</h2>
              <p className="text-xs text-ink-500">Last 14 days</p>
            </div>
            <span className="text-xs text-ink-500">Candidates {data.users.candidates} · Recruiters {data.users.recruiters}</span>
          </div>
          <Bars data={data.signupsByDay} />
        </div>

        <div className="card p-6 animate-fadeUp">
          <h2 className="font-semibold">Application pipeline</h2>
          <p className="mb-5 text-xs text-ink-500">Current status breakdown</p>
          <div className="space-y-4">
            {statuses.map((s) => {
              const n = data.applications.byStatus[s] || 0;
              const pct = data.applications.total ? Math.round((n / data.applications.total) * 100) : 0;
              return (
                <div key={s}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <Badge value={s} />
                    <span className="font-medium text-ink-700">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card mt-6 animate-fadeUp">
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
          <div>
            <h2 className="font-semibold">Recent activity</h2>
            <p className="text-xs text-ink-500">Latest actions across the platform</p>
          </div>
          <Link to="/activity" className="text-sm font-semibold text-brand-600 hover:underline">View all →</Link>
        </div>
        {recent === null ? (
          <Spinner />
        ) : recent.length ? (
          <div className="py-2">
            <ActivityTimeline items={recent} showUser />
          </div>
        ) : (
          <p className="px-6 py-10 text-center text-sm text-ink-500">No activity yet.</p>
        )}
      </div>

      <div className="card mt-6 animate-fadeUp">
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
          <h2 className="font-semibold">Most popular jobs</h2>
          <Link to="/jobs" className="text-sm font-semibold text-brand-600 hover:underline">Manage jobs →</Link>
        </div>
        <table className="w-full">
          <thead className="bg-ink-50"><tr><th className="th">Role</th><th className="th">Company</th><th className="th text-right">Applicants</th></tr></thead>
          <tbody className="divide-y divide-ink-100">
            {data.topJobs.map((j) => (
              <tr key={j._id} className="transition hover:bg-ink-50">
                <td className="td font-medium text-ink-900">{j.title}</td>
                <td className="td">{j.company}</td>
                <td className="td text-right font-semibold">{j.applicantsCount}</td>
              </tr>
            ))}
            {!data.topJobs.length ? <tr><td colSpan={3} className="td text-center text-ink-500">No open jobs yet</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
