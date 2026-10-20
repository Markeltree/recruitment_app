import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

const sections = [
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
      { to: '/activity', label: 'Activity', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { to: '/users', label: 'Users', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75' },
      { to: '/jobs', label: 'Jobs', icon: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z' },
      { to: '/applications', label: 'Applications', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    ],
  },
  {
    title: 'Engage',
    items: [
      { to: '/notifications', label: 'Broadcasts', icon: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-5-5.9V4a1 1 0 00-2 0v1.1A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1' },
    ],
  },
];
const allItems = sections.flatMap((s) => s.items);

function Icon({ d, className = 'h-[18px] w-[18px]' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-[0_8px_20px_-8px_rgba(47,107,255,0.8)]">
        <Icon d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[15px] font-extrabold leading-none tracking-tight">ApplyUp</p>
        <p className="mt-1 text-[11px] font-medium text-ink-500">Admin console</p>
      </div>
    </div>
  );
}

// Account chip at the bottom of the sidebar with a small popover menu
function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initials = user?.name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {open ? (
        <div className="absolute bottom-full left-0 right-0 mb-2 origin-bottom animate-scaleIn rounded-xl bg-white p-1.5 shadow-pop ring-1 ring-ink-200/80">
          <div className="border-b border-ink-100 px-2.5 pb-2 pt-1.5">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-ink-500">{user?.email}</p>
          </div>
          <button onClick={onLogout} className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
            <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition ${open ? 'bg-ink-100' : 'hover:bg-ink-50'}`}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ink-800 to-ink-900 text-xs font-bold text-white">{initials}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-ink-500">Administrator</p>
        </div>
        <svg viewBox="0 0 20 20" className={`h-4 w-4 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="currentColor">
          <path d="M14.8 12.8a.75.75 0 01-1.06-.02L10 8.9l-3.74 3.88a.75.75 0 11-1.08-1.04l4.28-4.44a.75.75 0 011.08 0l4.28 4.44a.75.75 0 01-.02 1.06z" />
        </svg>
      </button>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const current = allItems.find((i) => pathname.startsWith(i.to)) || allItems[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-200/70 bg-white/80 px-4 pb-4 pt-5 backdrop-blur md:flex">
        <div className="mb-7 px-2">
          <Logo />
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-300">{section.title}</p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-500 transition-all duration-300 ${
                            isActive ? 'opacity-100' : 'scale-y-0 opacity-0'
                          }`}
                        />
                        <span className={`transition-transform duration-200 ${isActive ? '' : 'group-hover:translate-x-0.5'}`}>
                          <Icon d={item.icon} />
                        </span>
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 border-t border-ink-100 pt-3">
          <AccountMenu user={user} onLogout={handleLogout} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop top bar */}
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-ink-200/70 bg-white/70 px-8 py-3.5 backdrop-blur-md md:flex">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-500">Admin</span>
            <span className="text-ink-300">/</span>
            <span className="font-semibold text-ink-900">{current.label}</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-ink-100/80 px-3 py-1.5 text-xs font-medium text-ink-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            {today}
          </div>
        </header>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-200 bg-white/85 px-4 py-3 backdrop-blur md:hidden">
          <Logo />
          <button onClick={handleLogout} className="btn-ghost btn-sm text-rose-600">
            Sign out
          </button>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-ink-200 bg-white px-4 py-2 md:hidden">
          {allItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${isActive ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8">
          <div key={pathname} className="mx-auto max-w-7xl animate-fadeUp">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
