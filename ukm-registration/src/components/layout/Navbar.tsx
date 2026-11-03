import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { Sparkles, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">UKM</span>
            <span className="font-bold text-indigo-600 text-lg tracking-tight">Hub</span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isCurrent('/dashboard') ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200/50">
                  {user?.name?.charAt(0)}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                  {user?.name?.split(' ')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Masuk
              </Link>
              <Link to="/register">
                <Button size="sm">Daftar Sekarang</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
