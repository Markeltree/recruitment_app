import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../lib/api';
import { Badge, Empty, Pagination, PageHeader, Spinner, useDebounced } from '../components/UI';
import { useAuth } from '../store/auth';
import Select from '../components/Select';
import { FilterBar, SearchInput, STATUS_DOTS } from '../components/Controls';


export default function Users() {
  const me = useAuth((s) => s.user);
  const [q, setQ] = useState('');
  const debounced = useDebounced(q, 350);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi
      .users({ q: debounced, role, status, page, limit: 15 })
      .then(setResult)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [debounced, role, status]);
  useEffect(load, [debounced, role, status, page]);

  const toggleSuspend = async (u) => {
    setBusyId(u._id);
    try {
      await adminApi.updateUser(u._id, { status: u.status === 'active' ? 'suspended' : 'active' });
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This removes their applications too.`)) return;
    try {
      await adminApi.deleteUser(u._id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Users" subtitle={`${result?.pagination?.total ?? 0} accounts`} />

      <FilterBar>
        <SearchInput className="w-full sm:w-72" placeholder="Search name or email…" value={q} onChange={setQ} />
        <Select
          className="w-44"
          label="Role"
          value={role}
          onChange={setRole}
          options={[
            { value: '', label: 'All roles' },
            { value: 'candidate', label: 'Candidates', dot: STATUS_DOTS.candidate, description: 'Looking for work' },
            { value: 'recruiter', label: 'Recruiters', dot: STATUS_DOTS.recruiter, description: 'Hiring on ApplyUp' },
            { value: 'admin', label: 'Admins', dot: STATUS_DOTS.admin, description: 'Console access' },
          ]}
        />
        <Select
          className="w-40"
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'Any status' },
            { value: 'active', label: 'Active', dot: STATUS_DOTS.active },
            { value: 'suspended', label: 'Suspended', dot: STATUS_DOTS.suspended },
          ]}
        />
        {q || role || status ? (
          <button className="btn-ghost btn-sm ml-auto" onClick={() => { setQ(''); setRole(''); setStatus(''); }}>
            Reset filters
          </button>
        ) : null}
      </FilterBar>

      <div className="card overflow-hidden animate-fadeUp">
        {loading && !result ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="th">User</th>
                  <th className="th">Role</th>
                  <th className="th">Status</th>
                  <th className="th">Joined</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-ink-100 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                {result?.data.map((u) => (
                  <tr key={u._id} className="transition hover:bg-ink-50">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-600">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link to={`/users/${u._id}`} className="font-semibold text-ink-900 hover:text-brand-600">{u.name}</Link>
                          <p className="text-xs text-ink-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td"><Badge value={u.role} /></td>
                    <td className="td"><Badge value={u.status} /></td>
                    <td className="td text-ink-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="td">
                      <div className="flex justify-end gap-2">
                        <Link to={`/users/${u._id}`} className="btn-ghost btn-sm">View</Link>
                        {u._id !== me?._id ? (
                          <>
                            <button disabled={busyId === u._id} onClick={() => toggleSuspend(u)} className="btn-ghost btn-sm">
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button onClick={() => remove(u)} className="btn-danger btn-sm">Delete</button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {!result?.data.length ? (
                  <tr><td colSpan={5}><Empty title="No users match these filters" /></td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={Math.ceil((result?.pagination?.total || 0) / 15)} onChange={setPage} />
      </div>
    </>
  );
}
