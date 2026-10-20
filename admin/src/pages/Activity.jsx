import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { ActivityTimeline, CATEGORIES, CategoryTabs } from '../components/Activity';
import { Empty, PageHeader, Pagination, Spinner, StatCard, useDebounced } from '../components/UI';
import { SearchInput } from '../components/Controls';

const PAGE_SIZE = 30;

const SUMMARY_CARDS = [
  { key: 'auth', icon: '🔐', tone: 'brand' },
  { key: 'job', icon: '💼', tone: 'green' },
  { key: 'application', icon: '📨', tone: 'violet' },
  { key: 'ai', icon: '✨', tone: 'amber' },
];

export default function Activity() {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q, 350);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPage(1);
  }, [debounced, category]);

  useEffect(() => {
    setLoading(true);
    setError('');
    adminApi
      .activity({ q: debounced || undefined, category: category || undefined, page, limit: PAGE_SIZE })
      .then((res) => {
        setResult(res);
        if (res.summary) setSummary(res.summary);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [debounced, category, page]);

  const label = (key) => CATEGORIES.find((c) => c.key === key)?.label;

  return (
    <>
      <PageHeader title="Activity" subtitle="Everything users do across ApplyUp. Entries are kept for 180 days." />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {SUMMARY_CARDS.map((c) => (
          <StatCard key={c.key} label={label(c.key)} value={summary ? summary[c.key] || 0 : '—'} hint="Last 24 hours" icon={c.icon} tone={c.tone} />
        ))}
      </div>

      <div className="card mb-4 flex flex-wrap items-center gap-3 p-4 animate-fadeUp">
        <SearchInput className="w-full sm:w-72" placeholder="Filter by user name or email…" value={q} onChange={setQ} />
        <CategoryTabs value={category} onChange={setCategory} summary={summary} />
      </div>

      <div className="card overflow-hidden animate-fadeUp">
        {error ? <p className="px-6 py-4 text-sm text-rose-600">{error}</p> : null}
        {loading && !result ? (
          <Spinner />
        ) : result?.data.length ? (
          <div className={`py-2 transition-opacity ${loading ? 'opacity-50' : ''}`}>
            <ActivityTimeline items={result.data} showUser />
          </div>
        ) : (
          <Empty title="No activity matches these filters" subtitle="Try another category or clear the search." />
        )}
        <Pagination page={page} pages={result?.pagination?.pages} onChange={setPage} />
      </div>
    </>
  );
}
