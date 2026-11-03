import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { PrivateRoute } from '../components/layout/PrivateRoute';
import { AdminPrivateRoute } from '../components/layout/AdminPrivateRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { QuestionnairePage } from '../pages/QuestionnairePage';
import { ResultPage } from '../pages/ResultPage';
import { SelectUKMPage } from '../pages/SelectUKMPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { SuccessPage } from '../pages/SuccessPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminPendaftarPage } from '../pages/admin/AdminPendaftarPage';
import { AdminDetailPage } from '../pages/admin/AdminDetailPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { StaffDashboardPage } from '../pages/staff/StaffDashboardPage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <PrivateRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/questionnaire', element: <QuestionnairePage /> },
          { path: '/result', element: <ResultPage /> },
          { path: '/select-ukm', element: <SelectUKMPage /> },
          { path: '/confirm', element: <ConfirmationPage /> },
          { path: '/success', element: <SuccessPage /> },
        ],
      },
    ],
  },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    element: <AdminPrivateRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboardPage /> },
          { path: '/admin/registrations', element: <AdminPendaftarPage /> },
          { path: '/admin/registrations/:id', element: <AdminDetailPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/schedules', element: <StaffDashboardPage /> },
        ],
      },
    ],
  },
]);
