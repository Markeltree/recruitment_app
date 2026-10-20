import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@applyup.app');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative w-full max-w-md animate-fadeUp">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500 text-xl font-extrabold text-white">A</div>
          <div>
            <p className="text-lg font-bold text-white">ApplyUp</p>
            <p className="text-sm text-ink-300">Admin console</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-5 !p-8 ring-0">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Sign in</h1>
            <p className="mt-1 text-sm text-ink-500">Restricted to administrators.</p>
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-sm font-medium text-ink-300 transition hover:text-white">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
