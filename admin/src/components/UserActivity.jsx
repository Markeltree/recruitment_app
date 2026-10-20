import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { ActivityTimeline, CategoryTabs } from './Activity';
import { Empty, Spinner } from './UI';

const PAGE_SIZE = 25;

// Activity log card on the user detail page, with category filter and "load more"
export default function UserActivity({ userId }) {
  const [category, setCategory] = useState('');
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPage = async (p, reset) => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.userActivity(userId, { category: category || undefined, page: p, limit: PAGE_SIZE });
      setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
      if (res.summary) setSummary(res.summary);
      setPage(p);
      setPages(res.pagination.pages);
      setTotal(res.pagination.total);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1, true);
  }, [userId, category]);

  return (
    <div className="card mt-6 animate-fadeUp">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 px-6 py-4">
        <div>
          <h2 className="font-semibold">Activity log</h2>
          <p className="text-xs text-ink-500">{total} events · counts on tabs are from the last 24 hours</p>
        </div>
        <button className="btn-ghost btn-sm" onClick={() => fetchPage(1, true)} disabled={loading}>
          Refresh
        </button>
      </div>
      <div className="border-b border-ink-100 px-6 py-3">
        <CategoryTabs value={category} onChange={setCategory} summary={summary} />
      </div>

      {error ? <p className="px-6 py-4 text-sm text-rose-600">{error}</p> : null}
      {loading && !items.length ? (
        <Spinner />
      ) : items.length ? (
        <div className={`py-2 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <ActivityTimeline items={items} subjectId={userId} />
        </div>
      ) : (
        <Empty title="No activity recorded" subtitle="Actions this user takes in the app will appear here." />
      )}

      {page < pages ? (
        <div className="border-t border-ink-100 px-6 py-3 text-center">
          <button className="btn-ghost" disabled={loading} onClick={() => fetchPage(page + 1)}>
            {loading ? 'Loading…' : 'Load older activity'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
