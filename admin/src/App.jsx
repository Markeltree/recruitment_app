import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './store/auth';
import Layout from './components/Layout';
import { Spinner } from './components/UI';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import Notifications from './pages/Notifications';
import Activity from './pages/Activity';
import NotFound from './pages/NotFound';

function Protected({ children }) {
  const { user, booting } = useAuth();
  const location = useLocation();
  if (booting) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export default function App() {
  const bootstrap = useAuth((s) => s.bootstrap);
  const logout = useAuth((s) => s.logout);

  useEffect(() => {
    bootstrap();
    const onLogout = () => logout();
    window.addEventListener('applyup:logout', onLogout);
    return () => window.removeEventListener('applyup:logout', onLogout);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="applications" element={<Applications />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="activity" element={<Activity />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
