import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Calendar,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const AdminLayout = () => {
  const { admin, adminLogout } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Data Pendaftar', path: '/admin/registrations', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Jadwal & Sesi', path: '/admin/schedules', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Semua Mahasiswa', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-6">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight">Admin</span>
              <span className="font-extrabold text-indigo-400 text-lg tracking-tight">Hub</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Profile / Logout */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-sm font-bold text-white truncate">{admin?.name}</p>
              <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
              {admin?.ukm_name && (
                <p className="text-[10px] font-bold text-indigo-400 truncate">Staff {admin.ukm_name}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
              title="Keluar Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-900 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
