import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { Badge, Empty, PageHeader, Spinner } from '../components/UI';
import Select from '../components/Select';

export default function Notifications() {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const load = () => adminApi.notifications().then(setItems);
  useEffect(() => { load(); }, []);

  const send = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Send this announcement to ${form.audience === 'all' ? 'everyone' : 'all candidates'}?`)) return;
    setSending(true);
    setFeedback(null);
    try {
      await adminApi.broadcast(form);
      setForm({ title: '', body: '', audience: form.audience });
      setFeedback({ ok: true, msg: 'Announcement sent' });
      load();
    } catch (err) {
      setFeedback({ ok: false, msg: err.details?.map((d) => d.message).join(' · ') || err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader title="Broadcasts" subtitle="Send announcements to every user in the app." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <form onSubmit={send} className="card space-y-4 p-6 lg:col-span-2 animate-fadeUp">
          <h2 className="font-semibold">New announcement</h2>
          <div>
            <label className="label">Audience</label>
            <Select
              label="Audience"
              value={form.audience}
              onChange={(audience) => setForm({ ...form, audience })}
              options={[
                { value: 'all', label: 'Everyone', description: 'Candidates and recruiters', icon: '🌍' },
                { value: 'candidates', label: 'Candidates only', description: 'People looking for work', icon: '🎯' },
              ]}
            />
          </div>
          <div>
            <label className="label">Title</label>
            <input required minLength={2} maxLength={120} className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea required minLength={2} maxLength={500} rows={5} className="input" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <p className="mt-1 text-right text-xs text-ink-500">{form.body.length}/500</p>
          </div>

          {feedback ? (
            <p className={`rounded-xl px-3 py-2 text-sm ${feedback.ok ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>{feedback.msg}</p>
          ) : null}

          <button className="btn-primary w-full" disabled={sending}>{sending ? 'Sending…' : 'Send announcement'}</button>
        </form>

        <div className="card lg:col-span-3 animate-fadeUp">
          <div className="border-b border-ink-200 px-6 py-4">
            <h2 className="font-semibold">Recent broadcasts</h2>
          </div>
          {!items ? <Spinner /> : (
            <ul className="divide-y divide-ink-100">
              {items.filter((n) => n.type === 'announcement').map((n) => (
                <li key={n._id} className="px-6 py-4 transition hover:bg-ink-50">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink-900">{n.title}</p>
                    <span className="text-xs text-ink-500">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-700">{n.body}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
                    <Badge value={n.audience === 'candidates' ? 'candidate' : 'active'} />
                    <span>Read by {n.readBy?.length || 0}</span>
                  </div>
                </li>
              ))}
              {!items.filter((n) => n.type === 'announcement').length ? <Empty title="No broadcasts yet" subtitle="Announcements you send will appear here." /> : null}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
