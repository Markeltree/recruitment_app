import { useEffect, useState } from 'react';
import { adminApi } from '../lib/api';
import { Badge, Empty, Modal, Pagination, PageHeader, Spinner } from '../components/UI';
import ProposalView from '../components/ProposalView';
import Select from '../components/Select';
import { STATUS_DOTS } from '../components/Controls';

const STATUSES = ['applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn'];
const LIMIT = 15;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const MOVE_OPTIONS = STATUSES.filter((s) => s !== 'withdrawn').map((s) => ({ value: s, label: cap(s), dot: STATUS_DOTS[s] }));

export default function Applications() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [viewing, setViewing] = useState(null);

  const load = () => {
    setLoading(true);
    adminApi.applications({ status, page, limit: LIMIT }).then(setResult).finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); }, [status]);
  useEffect(load, [status, page]);

  const changeStatus = async (app, next) => {
    setUpdating(app._id);
    try {
      await adminApi.setApplicationStatus(app._id, { status: next });
      setResult((r) => ({ ...r, data: r.data.map((x) => (x._id === app._id ? { ...x, status: next } : x)) }));
    } catch (e) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <PageHeader title="Applications" subtitle={`${result?.pagination?.total ?? 0} total applications`} />

      <div className="card mb-4 flex flex-wrap gap-1.5 p-2 animate-fadeUp">
        {['', ...STATUSES].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatus(s)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold capitalize transition ${
              status === s ? 'bg-ink-900 text-white shadow-sm' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'
            }`}
          >
            {s ? <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_DOTS[s] }} /> : null}
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden animate-fadeUp">
        {loading && !result ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="th">Candidate</th>
                  <th className="th">Role</th>
                  <th className="th">Applied</th>
                  <th className="th">Proposal</th>
                  <th className="th">Status</th>
                  <th className="th">Move to</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-ink-100 transition-opacity ${loading ? 'opacity-50' : ''}`}>
                {result?.data.map((a) => (
                  <tr key={a._id} className="transition hover:bg-ink-50">
                    <td className="td">
                      <p className="font-semibold text-ink-900">{a.user?.name || 'Deleted user'}</p>
                      <p className="text-xs text-ink-500">{a.user?.email}</p>
                    </td>
                    <td className="td">
                      <p className="font-medium text-ink-800">{a.job?.title || 'Removed job'}</p>
                      <p className="text-xs text-ink-500">{a.job?.company}</p>
                    </td>
                    <td className="td text-ink-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="td">
                      <button className="group text-left" onClick={() => setViewing(a)}>
                        <span className="flex flex-wrap items-center gap-1.5 text-xs">
                          {a.proposal?.expectedPay?.amount ? (
                            <span className="rounded-md bg-green-50 px-1.5 py-0.5 font-semibold text-green-700">
                              {a.proposal.expectedPay.currency} {Number(a.proposal.expectedPay.amount).toLocaleString()}/{a.proposal.expectedPay.period === 'hour' ? 'hr' : 'mo'}
                            </span>
                          ) : null}
                          {a.proposal?.attachments?.length ? (
                            <span className="rounded-md bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700">📎 {a.proposal.attachments.length}</span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-brand-600 group-hover:underline">View proposal →</span>
                      </button>
                    </td>
                    <td className="td"><Badge value={a.status} /></td>
                    <td className="td">
                      <Select
                        size="sm"
                        align="right"
                        className="w-36"
                        label={`Move application for ${a.user?.name || 'candidate'}`}
                        disabled={updating === a._id || a.status === 'withdrawn'}
                        value={a.status}
                        placeholder={cap(a.status)}
                        onChange={(next) => changeStatus(a, next)}
                        options={MOVE_OPTIONS}
                      />
                    </td>
                  </tr>
                ))}
                {!result?.data.length ? <tr><td colSpan={6}><Empty title="No applications here" /></td></tr> : null}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={Math.ceil((result?.pagination?.total || 0) / LIMIT)} onChange={setPage} />
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Proposal" wide>
        {viewing ? <ProposalView application={viewing} /> : null}
      </Modal>
    </>
  );
}
