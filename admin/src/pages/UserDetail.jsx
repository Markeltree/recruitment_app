import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { Badge, PageHeader, Spinner } from '../components/UI';
import UserActivity from '../components/UserActivity';
import { ProjectCard } from '../components/ProposalView';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.user(id).then(setData).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]);

  const update = async (patch) => {
    setSaving(true);
    try {
      await adminApi.updateUser(id, patch);
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Permanently delete this user?')) return;
    await adminApi.deleteUser(id);
    navigate('/users');
  };

  if (error) return <p className="text-rose-600">{error}</p>;
  if (!data) return <Spinner />;
  const { user, applications } = data;

  return (
    <>
      <Link to="/users" className="mb-4 inline-block text-sm font-semibold text-brand-600 hover:underline">← Back to users</Link>
      <PageHeader
        title={user.name}
        subtitle={user.email}
        actions={
          <>
            <button disabled={saving} className="btn-ghost" onClick={() => update({ status: user.status === 'active' ? 'suspended' : 'active' })}>
              {user.status === 'active' ? 'Suspend account' : 'Reactivate account'}
            </button>
            <button className="btn-danger" onClick={remove}>Delete user</button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card space-y-4 p-6 animate-fadeUp">
          <div className="flex items-center gap-2"><Badge value={user.role} /><Badge value={user.status} /></div>
          <Info label="Headline" value={user.headline} />
          <Info label="Location" value={user.location} />
          <Info label="Phone" value={user.phone} />
          <Info label="Last login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'} />
          <Info label="Joined" value={new Date(user.createdAt).toLocaleString()} />
          <div>
            <p className="label">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {user.skills?.length ? user.skills.map((s) => <span key={s} className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">{s}</span>) : <span className="text-sm text-ink-500">None</span>}
            </div>
          </div>
          <Info label="Bio" value={user.bio} />
          <div>
            <p className="label">Portfolio ({user.portfolio?.length || 0})</p>
            {user.portfolio?.length ? (
              <div className="space-y-2.5">
                {user.portfolio.map((p) => (
                  <ProjectCard key={p._id} p={p} />
                ))}
              </div>
            ) : (
              <span className="text-sm text-ink-500">No projects added</span>
            )}
          </div>
        </div>

        <div className="card lg:col-span-2 animate-fadeUp">
          <div className="border-b border-ink-200 px-6 py-4">
            <h2 className="font-semibold">Applications ({applications.length})</h2>
          </div>
          <ul className="divide-y divide-ink-100">
            {applications.map((a) => (
              <li key={a._id} className="flex items-center justify-between px-6 py-4 transition hover:bg-ink-50">
                <div>
                  <p className="font-medium text-ink-900">{a.job?.title || 'Removed job'}</p>
                  <p className="text-sm text-ink-500">{a.job?.company} · {new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge value={a.status} />
              </li>
            ))}
            {!applications.length ? <li className="px-6 py-12 text-center text-sm text-ink-500">No applications yet.</li> : null}
          </ul>
        </div>
      </div>

      <UserActivity userId={user._id} />
    </>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="label !mb-0.5">{label}</p>
      <p className="text-sm text-ink-800">{value || '—'}</p>
    </div>
  );
}
