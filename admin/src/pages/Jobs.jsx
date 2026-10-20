import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { Badge, Empty, Modal, Pagination, PageHeader, Spinner, useDebounced } from '../components/UI';
import Select from '../components/Select';
import { FilterBar, SearchInput, STATUS_DOTS, Toggle } from '../components/Controls';


const EMPTY_JOB = {
  title: '',
  company: '',
  location: 'Remote',
  category: 'Engineering',
  type: 'full-time',
  workMode: 'remote',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  description: '',
  skills: '',
  requirements: '',
  experienceYears: 0,
  status: 'open',
  featured: false,
};

const CATEGORIES = ['Design', 'Engineering', 'Product', 'Data', 'Marketing', 'Sales'];

const TYPE_OPTIONS = [
  { value: 'full-time', label: 'Full-time', description: 'Permanent role' },
  { value: 'part-time', label: 'Part-time', description: 'Reduced hours' },
  { value: 'contract', label: 'Contract', description: 'Fixed term' },
  { value: 'internship', label: 'Internship', description: 'Students and graduates' },
];
const MODE_OPTIONS = [
  { value: 'remote', label: 'Remote', description: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', description: 'Mix of office and home' },
  { value: 'onsite', label: 'On-site', description: 'At the office' },
];
const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', dot: STATUS_DOTS.open, description: 'Visible in Discover' },
  { value: 'draft', label: 'Draft', dot: STATUS_DOTS.draft, description: 'Hidden until published' },
  { value: 'closed', label: 'Closed', dot: STATUS_DOTS.closed, description: 'No longer accepting applicants' },
];

function JobForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setValue = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      salaryMin: form.salaryMin === '' ? undefined : Number(form.salaryMin),
      salaryMax: form.salaryMax === '' ? undefined : Number(form.salaryMax),
      experienceYears: Number(form.experienceYears) || 0,
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      const saved = initial._id
        ? await adminApi.updateJob(initial._id, payload)
        : await adminApi.createJob(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.details?.map((d) => `${d.field}: ${d.message}`).join(' · ') || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form id="job-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="label">Job title</label>
        <input required className="input" value={form.title} onChange={set('title')} />
      </div>
      <div>
        <label className="label">Company</label>
        <input required className="input" value={form.company} onChange={set('company')} />
      </div>
      <div>
        <label className="label">Location</label>
        <input className="input" value={form.location} onChange={set('location')} />
      </div>
      <div>
        <label className="label">Category</label>
        <Select label="Category" value={form.category} onChange={setValue('category')} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
      </div>
      <div>
        <label className="label">Type</label>
        <Select label="Type" value={form.type} onChange={setValue('type')} options={TYPE_OPTIONS} />
      </div>
      <div>
        <label className="label">Work mode</label>
        <Select label="Work mode" value={form.workMode} onChange={setValue('workMode')} options={MODE_OPTIONS} />
      </div>
      <div>
        <label className="label">Status</label>
        <Select label="Status" value={form.status} onChange={setValue('status')} options={STATUS_OPTIONS} />
      </div>
      <div>
        <label className="label">Salary min</label>
        <input type="number" className="input" value={form.salaryMin} onChange={set('salaryMin')} />
      </div>
      <div>
        <label className="label">Salary max</label>
        <input type="number" className="input" value={form.salaryMax} onChange={set('salaryMax')} />
      </div>
      <div>
        <label className="label">Years of experience</label>
        <input type="number" min="0" className="input" value={form.experienceYears} onChange={set('experienceYears')} />
      </div>
      <div>
        <label className="label">Currency</label>
        <input maxLength={3} className="input uppercase" value={form.currency} onChange={set('currency')} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Description</label>
        <textarea required rows={4} className="input" value={form.description} onChange={set('description')} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Skills (comma separated)</label>
        <input className="input" value={form.skills} onChange={set('skills')} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Requirements (one per line)</label>
        <textarea rows={3} className="input" value={form.requirements} onChange={set('requirements')} />
      </div>
      <div className="rounded-xl bg-ink-50 p-3 sm:col-span-2">
        <Toggle checked={form.featured} onChange={setValue('featured')} label="Feature this job" description="Featured roles get a boost at the top of candidates' Discover deck." />
      </div>

      {error ? <p className="sm:col-span-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="flex justify-end gap-3 sm:col-span-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : initial._id ? 'Save changes' : 'Publish job'}</button>
      </div>
    </form>
  );
}

export default function Jobs() {
  const [q, setQ] = useState('');
  const debounced = useDebounced(q, 300);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.jobs({ q: debounced, status, page, limit: 12 }).then(setResult).finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [debounced, status]);
  useEffect(load, [debounced, status, page]);

  const toFormState = (job) => ({
    ...EMPTY_JOB,
    ...job,
    salaryMin: job.salaryMin ?? '',
    salaryMax: job.salaryMax ?? '',
    skills: (job.skills || []).join(', '),
    requirements: (job.requirements || []).join('\n'),
  });

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}" and all its applications?`)) return;
    await adminApi.deleteJob(job._id);
    load();
  };

  const quickStatus = async (job, next) => {
    await adminApi.updateJob(job._id, { status: next });
    load();
  };

  const closeAndReload = () => {
    setEditing(null);
    load();
  };

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle={`${result?.pagination?.total ?? 0} listings`}
        actions={<button className="btn-primary" onClick={() => setEditing(EMPTY_JOB)}>+ New job</button>}
      />

      <FilterBar>
        <SearchInput className="w-full sm:w-72" placeholder="Search title or company…" value={q} onChange={setQ} />
        <Select className="w-44" label="Status" value={status} onChange={setStatus} options={[{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS]} />
      </FilterBar>

      <div className="card overflow-hidden animate-fadeUp">
        {loading && !result ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="th">Role</th>
                  <th className="th">Category</th>
                  <th className="th">Status</th>
                  <th className="th">Applicants</th>
                  <th className="th">Views</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-ink-100 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                {result?.data.map((j) => (
                  <tr key={j._id} className="transition hover:bg-ink-50">
                    <td className="td">
                      <p className="font-semibold text-ink-900">{j.title} {j.featured ? <span className="ml-1 rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">FEATURED</span> : null}</p>
                      <p className="text-xs text-ink-500">{j.company} · {j.location}</p>
                    </td>
                    <td className="td">{j.category}</td>
                    <td className="td"><Badge value={j.status} /></td>
                    <td className="td font-semibold">{j.applicantsCount}</td>
                    <td className="td">{j.views}</td>
                    <td className="td">
                      <div className="flex justify-end gap-2">
                        {j.status !== 'closed' ? (
                          <button className="btn-ghost btn-sm" onClick={() => quickStatus(j, 'closed')}>Close</button>
                        ) : (
                          <button className="btn-ghost btn-sm" onClick={() => quickStatus(j, 'open')}>Reopen</button>
                        )}
                        <button className="btn-ghost btn-sm" onClick={() => setEditing(toFormState(j))}>Edit</button>
                        <button className="btn-danger btn-sm" onClick={() => remove(j)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!result?.data.length ? <tr><td colSpan={6}><Empty title="No jobs found" subtitle="Create a listing to start receiving applications." /></td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={result?.pagination?.pages} onChange={setPage} />
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?._id ? 'Edit job' : 'Publish a new job'}
        wide
        footer={null}
      >
        {editing ? <JobForm initial={editing} onSaved={closeAndReload} onCancel={() => setEditing(null)} /> : null}
      </Modal>
    </>
  );
}
