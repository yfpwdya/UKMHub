import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminStats } from '../../api/admin';
import { Card } from '../../components/ui/Card';
import { Users, FileCheck, Clock, CheckCircle2, XCircle, Trophy, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan statistik pendaftaran UKM terkini dan tren minat mahasiswa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/registrations">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5">
              Lihat Data Pendaftar <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Cards Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Total Mahasiswa',
            val: stats?.totalUsers,
            icon: <Users className="w-5 h-5 text-indigo-600" />,
            bg: 'bg-indigo-50/50',
            border: 'border-indigo-100',
          },
          {
            label: 'Total Pendaftaran',
            val: stats?.totalRegistrations,
            icon: <FileCheck className="w-5 h-5 text-blue-600" />,
            bg: 'bg-blue-50/50',
            border: 'border-blue-100',
          },
          {
            label: 'Menunggu Seleksi',
            val: stats?.pending,
            icon: <Clock className="w-5 h-5 text-amber-600" />,
            bg: 'bg-amber-50/50',
            border: 'border-amber-100',
          },
          {
            label: 'Diterima',
            val: stats?.accepted,
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
            bg: 'bg-emerald-50/50',
            border: 'border-emerald-100',
          },
          {
            label: 'Ditolak',
            val: stats?.rejected,
            icon: <XCircle className="w-5 h-5 text-rose-600" />,
            bg: 'bg-rose-50/50',
            border: 'border-rose-100',
          },
        ].map(({ label, val, icon, bg, border }) => (
          <Card key={label} className={`p-5 bg-white ${border} shadow-sm shadow-slate-200/50`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-500 font-semibold">{label}</span>
              <div className={`p-2 rounded-xl ${bg}`}>{icon}</div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{val ?? 0}</p>
          </Card>
        ))}
      </div>

      {/* UKM Terfavorit Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 bg-white border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" /> UKM Paling Banyak Diminati
            </h2>
            <Link
              to="/admin/ukm"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Kelola UKM <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.topUKM && stats.topUKM.length > 0 ? (
            <div className="space-y-3">
              {stats.topUKM.map((item, idx) => (
                <div
                  key={item.ukm_name}
                  className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-7 h-7 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center text-xs shadow-sm shadow-indigo-500/20">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{item.ukm_name}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                    {item.total} Pemilih
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              Belum ada data pendaftar UKM.
            </div>
          )}
        </Card>

        {/* Quick Info / Tips */}
        <Card className="p-6 bg-gradient-to-br from-indigo-900 to-violet-900 text-white border-0 shadow-lg shadow-indigo-950/10 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              Panduan Administrator
            </span>
            <h3 className="text-xl font-bold mt-2 mb-3">Manajemen Pendaftaran Terpadu</h3>
            <p className="text-indigo-100/80 text-sm leading-relaxed mb-6">
              Anda dapat menyetujui atau menolak pendaftaran mahasiswa langsung dari halaman Data Pendaftar, melihat hasil tes bakat psikometrik pendaftar, atau menambahkan UKM baru ke dalam sistem.
            </p>
          </div>
          <div className="space-y-2 pt-4 border-t border-indigo-800/80">
            <Link
              to="/admin/registrations"
              className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium text-white transition-colors"
            >
              <span>Review Pendaftaran Masuk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/admin/ukm"
              className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-medium text-white transition-colors"
            >
              <span>Tambah Unit Kegiatan Baru</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
