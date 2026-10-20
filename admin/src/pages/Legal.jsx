import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { publicApi } from '../lib/api';

// Contact address shown on every legal page; set VITE_SUPPORT_EMAIL before publishing
export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || '';
const EFFECTIVE_DATE = 'October 20, 2026';

function Email() {
  if (!SUPPORT_EMAIL) return <span className="rounded bg-amber-100 px-1.5 font-semibold text-amber-800">[support email not set]</span>;
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-600 hover:underline">
      {SUPPORT_EMAIL}
    </a>
  );
}

function LegalLayout({ title, subtitle, children }) {
  useEffect(() => {
    document.title = `${title} · ApplyUp`;
    window.scrollTo(0, 0);
  }, [title]);

  const tab = ({ isActive }) =>
    `whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-ink-900 text-white' : 'text-ink-500 hover:bg-ink-100 hover:text-ink-900'}`;

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <header className="sticky top-0 z-30 border-b border-ink-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-extrabold text-white">A</span>
            <span className="font-extrabold tracking-tight text-ink-900">ApplyUp</span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto">
            <NavLink to="/privacy" className={tab}>Privacy</NavLink>
            <NavLink to="/terms" className={tab}>Terms</NavLink>
            <NavLink to="/delete-account" className={tab}>Delete account</NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="animate-fadeUp">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-ink-500">{subtitle || `Effective ${EFFECTIVE_DATE}`}</p>
        </div>
        <article className="card mt-8 animate-fadeUp p-6 text-[15px] leading-relaxed text-ink-700 sm:p-10 [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink-900 [&_h2:first-child]:mt-0 [&_li]:mt-1.5 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
          {children}
        </article>
      </main>

      <footer className="border-t border-ink-200/70 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-ink-500 sm:px-6">
          <p>© {new Date().getFullYear()} ApplyUp</p>
          <div className="flex gap-5">
            <Link to="/" className="hover:text-ink-900">Home</Link>
            <Link to="/privacy" className="hover:text-ink-900">Privacy</Link>
            <Link to="/terms" className="hover:text-ink-900">Terms</Link>
            <Link to="/delete-account" className="hover:text-ink-900">Delete account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p className="!mt-0">
        This Privacy Policy explains how ApplyUp ("ApplyUp", "we", "us") collects, uses and shares information when you use the ApplyUp mobile app and
        website (together, the "Service"). By using the Service you agree to this policy.
      </p>

      <h2>1. Information we collect</h2>
      <p><strong>Information you give us</strong></p>
      <ul>
        <li><strong>Account details:</strong> your name, email address and password. Passwords are stored only as a secure hash, never in plain text.</li>
        <li><strong>Profile details:</strong> headline, bio, phone number, location, skills, work experience, profile photo link and job preferences (job types, categories, minimum salary, remote preference).</li>
        <li><strong>Portfolio:</strong> projects you add, including titles, descriptions, links, your role and skills used.</li>
        <li><strong>Applications:</strong> the proposals you send, including cover notes, expected pay, availability and the portfolio items you attach.</li>
      </ul>
      <p><strong>Information created as you use the Service</strong></p>
      <ul>
        <li><strong>Activity in the app:</strong> jobs you save or pass on, applications and their status, and in-app notifications.</li>
        <li><strong>Security and activity logs:</strong> actions such as signing in, updating your profile or applying, together with the IP address and device/browser type (user agent) used.</li>
        <li><strong>AI results:</strong> match scores, match explanations and cover-note drafts generated for you.</li>
      </ul>
      <p>We do not collect your precise location, contacts, photos, or payment information, and we do not use advertising identifiers.</p>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To create and secure your account and keep you signed in.</li>
        <li>To show you relevant jobs and calculate how well you match them.</li>
        <li>To send your applications and portfolio to the job listings you apply for, and to show you their status.</li>
        <li>To send you in-app notifications about your applications and announcements about the Service.</li>
        <li>To prevent abuse, investigate problems and keep the Service safe.</li>
      </ul>
      <p>We do not sell your personal information and we do not use it for third-party advertising.</p>

      <h2>3. AI features</h2>
      <p>
        When you use the AI match score or AI cover-note features, the relevant parts of your profile (such as skills, experience and preferences) and the job
        details are sent to our AI provider, Anthropic, to generate the result. This data is used only to provide the feature to you, and under Anthropic's
        commercial terms it is not used to train their models.
      </p>

      <h2>4. How information is shared</h2>
      <ul>
        <li><strong>Job listings and the ApplyUp team:</strong> when you apply for a job, your application, profile and attached portfolio items can be seen by the administrators who manage that listing.</li>
        <li><strong>Service providers:</strong> we use trusted providers to run the Service: MongoDB Atlas (database hosting), Vercel (server hosting) and Anthropic (AI features). They process data only on our behalf.</li>
        <li><strong>Legal reasons:</strong> we may disclose information if required by law or to protect the rights, safety and property of our users or the public.</li>
      </ul>

      <h2>5. Data security</h2>
      <p>
        All data is sent over encrypted connections (HTTPS). Passwords are hashed, your sign-in token is kept in the device's secure storage, and access to
        administrative tools is restricted. No method of storage or transmission is completely secure, but we work to protect your information.
      </p>

      <h2>6. Data retention and deletion</h2>
      <p>
        We keep your information for as long as your account is active. You can delete your account at any time in the app under{' '}
        <strong>Profile → Delete account</strong>, or on our <Link to="/delete-account" className="font-semibold text-brand-600 hover:underline">account deletion page</Link>.
        Deleting your account permanently removes your profile, portfolio, applications, saved and passed jobs, AI results, personal notifications and activity
        logs. Copies in routine hosting backups are overwritten within 30 days.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You can view and edit your profile in the app at any time. Depending on where you live, you may also have the right to request a copy of your data,
        ask us to correct or delete it, or object to how it is used. To make a request, contact us at <Email />.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is meant for job seekers and is not directed at children under 16. We do not knowingly collect information from children under 16. If you
        believe a child has given us information, contact us and we will delete it.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>We may update this policy from time to time. We will change the effective date above and, for significant changes, notify you in the app.</p>

      <h2>10. Contact us</h2>
      <p>If you have questions about this policy or your data, email us at <Email />.</p>
    </LegalLayout>
  );
}

export function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p className="!mt-0">
        These Terms of Service ("Terms") govern your use of the ApplyUp mobile app and website (the "Service"). By creating an account or using the Service,
        you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. Eligibility</h2>
      <p>You must be at least 16 years old to use the Service. You are responsible for making sure your use of the Service follows the laws that apply to you.</p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must provide accurate information and keep it up to date.</li>
        <li>You are responsible for keeping your password secure and for all activity under your account.</li>
        <li>Tell us right away at <Email /> if you think your account has been used without your permission.</li>
      </ul>

      <h2>3. Your content</h2>
      <p>
        You keep ownership of the content you add, such as your profile, portfolio and proposals. You give ApplyUp permission to store, display and share that
        content as needed to run the Service, for example to show your application to the people managing a job listing. You confirm that you have the right to
        share everything you upload and that it is accurate and not misleading.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>post false, misleading or fraudulent information, or impersonate anyone;</li>
        <li>harass, abuse or discriminate against other people;</li>
        <li>upload content that is illegal, infringes others' rights or contains malware;</li>
        <li>scrape, copy or resell the Service or its job listings, or try to access accounts or systems you are not authorised to use;</li>
        <li>interfere with or disrupt the Service or its security.</li>
      </ul>

      <h2>5. AI features</h2>
      <p>
        Match scores, explanations and cover-note drafts are generated automatically and may be incomplete or inaccurate. They are suggestions only: review
        and edit anything before you send it. A match score does not guarantee an interview or a job.
      </p>

      <h2>6. Job listings</h2>
      <p>
        We work to keep listings accurate, but we do not guarantee that any job is available, that its details are correct, or that you will be hired. Decisions
        about applications are made by whoever manages the listing.
      </p>

      <h2>7. Suspension and termination</h2>
      <p>
        You can stop using the Service and delete your account at any time. We may suspend or close accounts that break these Terms or put other users or the
        Service at risk.
      </p>

      <h2>8. Disclaimers and limitation of liability</h2>
      <p>
        The Service is provided "as is" and "as available", without warranties of any kind. To the fullest extent allowed by law, ApplyUp is not liable for
        indirect, incidental or consequential damages, or for lost opportunities, arising from your use of the Service.
      </p>

      <h2>9. Changes</h2>
      <p>We may update these Terms. If we make significant changes we will notify you in the app. Continuing to use the Service after changes means you accept them.</p>

      <h2>10. Contact</h2>
      <p>Questions about these Terms? Email us at <Email />.</p>
    </LegalLayout>
  );
}

export function DeleteAccount() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | busy | done
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('busy');
    try {
      await publicApi.deleteAccount({ email, password });
      setStatus('done');
    } catch (err) {
      setError(err.status === 401 ? 'Email or password is incorrect.' : err.message);
      setStatus('idle');
    }
  };

  return (
    <LegalLayout title="Delete your ApplyUp account" subtitle="Permanently remove your account and its data.">
      <h2>Option 1: In the app</h2>
      <p className="!mt-0">Open the ApplyUp app, go to <strong>Profile</strong>, scroll down and tap <strong>Delete account</strong>, then confirm.</p>

      <h2>Option 2: On this page</h2>
      {status === 'done' ? (
        <div className="mt-3 rounded-2xl bg-green-50 p-5 text-green-800 ring-1 ring-green-600/20">
          <p className="!mt-0 font-semibold">Your account has been deleted.</p>
          <p className="!mt-1 text-sm">All of the data listed below has been removed. You can close this page.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 max-w-md space-y-4 rounded-2xl bg-ink-50 p-5 ring-1 ring-ink-200/70">
          <p className="!mt-0 text-sm text-ink-500">Sign in with the account you want to delete.</p>
          <div>
            <label className="label" htmlFor="del-email">Email</label>
            <input id="del-email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="del-password">Password</label>
            <input id="del-password" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <label className="flex items-start gap-2.5 text-sm text-ink-700">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-rose-600" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
            I understand this permanently deletes my account and cannot be undone.
          </label>
          {error ? <p className="!mt-0 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          <button type="submit" disabled={!confirm || status === 'busy'} className="btn-danger w-full">
            {status === 'busy' ? 'Deleting…' : 'Delete my account'}
          </button>
        </form>
      )}

      <h2>Option 3: By email</h2>
      <p className="!mt-0">
        If you can't sign in, email <Email /> from the address registered to your account with the subject "Delete my account". We will verify the request and
        delete the account within 7 days.
      </p>

      <h2>What gets deleted</h2>
      <ul>
        <li>Your account: name, email, password and profile details (headline, bio, phone, location, skills, experience, preferences)</li>
        <li>Your portfolio projects</li>
        <li>All of your applications and proposals</li>
        <li>Jobs you saved or passed on</li>
        <li>AI match scores and explanations generated for you</li>
        <li>Your personal notifications and activity logs</li>
      </ul>
      <p>
        Deletion happens immediately and is permanent. Nothing is kept afterwards, except copies in routine hosting backups, which are overwritten within 30
        days.
      </p>
    </LegalLayout>
  );
}
