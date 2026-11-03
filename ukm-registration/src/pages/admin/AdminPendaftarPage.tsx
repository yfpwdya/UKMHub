import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminRegistrationItem } from '../../api/admin';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  FileSpreadsheet,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const statusBadge: Record<string, { color: 'yellow' | 'green' | 'red'; label: string }> = {
  pending: { color: 'yellow', label: 'Menunggu' },
  accepted: { color: 'green', label: 'Diterima' },
  rejected: { color: 'red', label: 'Ditolak' },
};

export const AdminPendaftarPage = () => {
  const [data, setData] = useState<AdminRegistrationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('semua');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [runningSelection, setRunningSelection] = useState(false);
  const [selectionResult, setSelectionResult] = useState<{ message: string; acceptedTotal: number; rejectedTotal: number } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getRegistrations({
        status: statusFilter,
        search,
        page,
        limit: 10,
      });
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutoSelection = async () => {
    if (!window.confirm('Jalankan seleksi otomatis untuk semua pendaftaran? Sistem akan mencocokkan hasil kuisioner dan prioritas pilihan mahasiswa ke kuota UKM yang tersedia.')) {
      return;
    }
    setRunningSelection(true);
    setSelectionResult(null);
    try {
      const res = await adminApi.runAutoSelection();
      setSelectionResult({
        message: res.data.message,
        acceptedTotal: res.data.acceptedTotal,
        rejectedTotal: res.data.rejectedTotal,
      });
      await loadData();
    } catch {
      alert('Gagal menjalankan proses seleksi otomatis.');
    } finally {
      setRunningSelection(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleUpdateStatus = async (id: number, status: 'accepted' | 'rejected') => {
    try {
      await adminApi.updateStatus(id, status);
      loadData();
    } catch {
      alert('Gagal mengupdate status');
    }
  };

  // Export to CSV feature
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = ['ID Ref', 'Nama', 'NIM', 'Email', 'Fakultas', 'Prodi', 'Semester', 'Status', 'Prioritas UKM', 'Tanggal Submit'];
    const rows = data.map((item) => [
      item.reference_number,
      `"${item.name}"`,
      item.nim,
      item.email,
      `"${item.faculty}"`,
      `"${item.major}"`,
      item.semester,
      item.status,
      `"${item.ukm_choices.map((c) => `P${c.priority}: ${c.ukm.name}`).join(', ')}"`,
      item.submitted_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_pendaftar_ukm_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Pendaftaran UKM</h1>
          <p className="text-sm text-slate-500 mt-1">Total {total} mahasiswa telah mendaftar ke unit kegiatan.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRunAutoSelection}
            loading={runningSelection}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
          >
            <Zap className="w-4 h-4 mr-1.5" /> Jalankan Seleksi Otomatis
          </Button>

          <Button
            variant="secondary"
            onClick={exportToCSV}
            disabled={data.length === 0}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      {selectionResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-emerald-900 text-sm">{selectionResult.message}</p>
              <p className="text-xs text-emerald-700">
                {selectionResult.acceptedTotal} Mahasiswa Diterima • {selectionResult.rejectedTotal} Mahasiswa Melebihi Kuota
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectionResult(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold px-2 py-1"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card className="bg-white border-slate-100 p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Cari Nama atau NIM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200/80">
              {['semua', 'pending', 'accepted', 'rejected'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st === 'semua' ? 'Semua' : statusBadge[st]?.label || st}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Card>

      {/* Table */}
      <Card className="bg-white border-slate-100 p-0 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            Tidak ada data pendaftaran ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="p-4">No. Ref / Mahasiswa</th>
                  <th className="p-4">Prodi & Semester</th>
                  <th className="p-4">Pilihan Prioritas UKM</th>
                  <th className="p-4">Hasil Seleksi</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <p className="font-mono text-xs text-indigo-600 font-semibold">{item.reference_number}</p>
                      <p className="font-bold text-slate-900 mt-0.5">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.nim}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{item.major}</p>
                      <p className="text-xs text-slate-500">Sem {item.semester} • {item.faculty}</p>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {item.ukm_choices.map((c) => (
                          <div key={c.ukm.id} className="flex items-center gap-1.5 text-xs">
                            <span className="w-4 h-4 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] flex items-center justify-center font-bold">
                              {c.priority}
                            </span>
                            <span className="text-slate-700 font-medium">{c.ukm.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <Badge color={statusBadge[item.status]?.color}>
                          {statusBadge[item.status]?.label}
                        </Badge>
                        {item.status === 'accepted' && item.accepted_ukm_name && (
                          <p className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 mt-1 inline-block">
                            UKM: {item.accepted_ukm_name}
                          </p>
                        )}
                        {item.selection_note && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs" title={item.selection_note}>
                            {item.selection_note}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/registrations/${item.id}`}>
                          <Button size="sm" variant="secondary" className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
                            <Eye className="w-3.5 h-3.5 mr-1" /> Detail
                          </Button>
                        </Link>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'accepted')}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200/50"
                              title="Terima Pendaftaran"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'rejected')}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200/50"
                              title="Tolak Pendaftaran"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Halaman {page} dari {totalPages}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="bg-white border border-slate-200 text-slate-700"
              >
                Sebelumnya
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="bg-white border border-slate-200 text-slate-700"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
