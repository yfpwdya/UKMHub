import { Sparkles, Heart, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-lg">UKMHub</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <p className="text-sm text-slate-400 text-center md:text-left">
              Platform pendaftaran UKM cerdas berbasis rekomendasi bakat dan minat mahasiswa.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors shrink-0"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Admin
            </Link>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} UKMHub. Hak cipta dilindungi.</p>
          <p className="flex items-center gap-1">
            Dibuat dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Mahasiswa Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};
