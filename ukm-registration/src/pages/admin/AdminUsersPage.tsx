import { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import type { AdminUserItem } from '../../api/admin';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, Mail, Building, Calendar } from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(search);
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Semua Mahasiswa Terdaftar</h1>
        <p className="text-sm text-slate-500 mt-1">Daftar seluruh mahasiswa yang telah memiliki akun di sistem UKM.</p>
      </div>

      <Card className="bg-white border-slate-100 p-4">
        <form onSubmit={handleSearchSubmit} className="max-w-md">
          <Input
            placeholder="Cari Nama atau NIM mahasiswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </form>
      </Card>

      <Card className="bg-white border-slate-100 p-0 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">Tidak ada mahasiswa terdaftar.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="p-4">Mahasiswa</th>
                  <th className="p-4">NIM</th>
                  <th className="p-4">Fakultas / Prodi</th>
                  <th className="p-4">Status Pendaftaran</th>
                  <th className="p-4">Tanggal Registrasi Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-semibold text-indigo-600 text-xs">{u.nim}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{u.major}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Building className="w-3 h-3" /> {u.faculty} (Sem {u.semester})
                      </p>
                    </td>
                    <td className="p-4">
                      {u.reg_status ? (
                        <div>
                          <Badge
                            color={
                              u.reg_status === 'accepted'
                                ? 'green'
                                : u.reg_status === 'rejected'
                                ? 'red'
                                : 'yellow'
                            }
                          >
                            {u.reg_status === 'accepted'
                              ? 'Diterima'
                              : u.reg_status === 'rejected'
                              ? 'Ditolak'
                              : 'Menunggu'}
                          </Badge>
                          <p className="font-mono text-[11px] text-slate-400 mt-1">{u.reference_number}</p>
                        </div>
                      ) : (
                        <Badge color="gray">Belum Submit UKM</Badge>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(u.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
