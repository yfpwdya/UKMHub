import { Navigate, Outlet } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';

export const AdminPrivateRoute = () => {
  const { isAuthenticated } = useAdminStore();
  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};
