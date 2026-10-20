import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center animate-fadeUp">
      <p className="text-6xl font-extrabold text-brand-500">404</p>
      <p className="text-ink-500">This page does not exist.</p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
