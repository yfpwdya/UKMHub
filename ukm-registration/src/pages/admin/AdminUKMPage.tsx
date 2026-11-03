import { useEffect, useState } from 'react';
import { ukmApi } from '../../api/ukm';
import type { UKM } from '../../types/ukm';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Shapes,
  FolderPlus,
} from 'lucide-react';

const CATEGORIES = ['Semua', 'Olahraga', 'Seni', 'Teknologi', 'Sosial', 'Akademik', 'Keagamaan'];

const categoryBadgeColor: Record<string, 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'gray'> = {
  Olahraga: 'green',
  Seni: 'yellow',
  Teknologi: 'indigo',
  Sosial: 'red',
  Akademik: 'purple',
  Keagamaan: 'blue',
};

export const AdminUKMPage = () => {
  const [ukms, setUkms] = useState<UKM[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUkm, setEditingUkm] = useState<UKM | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Olahraga',
    description: '',
    logo_url: '',
    capacity: 30,
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await ukmApi.getAll(selectedCategory !== 'Semua' ? selectedCategory : undefined);
      setUkms(res.data);
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat data UKM' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const openCreateModal = () => {
    setEditingUkm(null);
    setFormData({
      name: '',
      category: 'Olahraga',
      description: '',
      logo_url: '',
      capacity: 30,
    });
    setFeedback(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ukm: UKM) => {
    setEditingUkm(ukm);
    setFormData({
      name: ukm.name,
      category: ukm.category,
      description: ukm.description || '',
      logo_url: ukm.logo_url || '',
      capacity: ukm.capacity || 30,
    });
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama UKM wajib diisi');
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      if (editingUkm) {
        await ukmApi.update(editingUkm.id, formData);
        setFeedback({ type: 'success', message: 'Data UKM berhasil diperbarui!' });
      } else {
        await ukmApi.create(formData);
        setFeedback({ type: 'success', message: 'UKM baru berhasil ditambahkan!' });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        loadData();
      }, 700);
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan saat menyimpan data.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ukmApi.delete(id);
      setDeleteConfirmId(null);
      loadData();
    } catch {
      alert('Gagal menghapus UKM');
    }
  };

  const filteredUkms = ukms.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Daftar UKM</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tambah, perbarui informasi, atau kelola kategori unit kegiatan mahasiswa.
          </p>
        </div>
        <Button onClick={openCreateModal} className="shadow-md shadow-indigo-500/20">
          <Plus className="w-4 h-4 mr-1.5" /> Tambah UKM Baru
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 bg-white border-slate-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="w-full lg:w-80">
            <Input
              placeholder="Cari nama atau deskripsi UKM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* UKM Grid / List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : filteredUkms.length === 0 ? (
        <Card className="text-center py-16">
          <Shapes className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-base">Tidak ada UKM ditemukan</p>
          <p className="text-slate-400 text-sm mt-1">Coba sesuaikan pencarian atau tambah UKM baru.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUkms.map((ukm) => (
            <Card
              key={ukm.id}
              className="flex flex-col justify-between border-slate-100 hover:border-indigo-100 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                      {ukm.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {ukm.name}
                      </h3>
                      <Badge color={categoryBadgeColor[ukm.category] || 'gray'}>
                        {ukm.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {ukm.description || 'Belum ada deskripsi untuk UKM ini.'}
                </p>

                {/* Quota Progress */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Kuota Terisi:</span>
                    <span className="text-slate-800 font-bold">
                      {ukm.accepted_count ?? 0} / {ukm.capacity ?? 30}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all rounded-full ${
                        ((ukm.accepted_count ?? 0) / (ukm.capacity ?? 30)) >= 1
                          ? 'bg-rose-500'
                          : ((ukm.accepted_count ?? 0) / (ukm.capacity ?? 30)) >= 0.8
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((ukm.accepted_count ?? 0) / (ukm.capacity ?? 30)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Sisa Kuota: {ukm.remaining_quota ?? ukm.capacity ?? 30} kursi</span>
                    <span>
                      {Math.round(((ukm.accepted_count ?? 0) / (ukm.capacity ?? 30)) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">ID: #{ukm.id}</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(ukm)}
                    className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteConfirmId(ukm.id)}
                    className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Add / Edit UKM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingUkm ? 'Edit Data UKM' : 'Tambah UKM Baru'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingUkm ? 'Perbarui informasi UKM yang ada' : 'Masukkan rincian unit kegiatan mahasiswa'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {feedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      : 'bg-rose-50 border-rose-100 text-rose-700'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  {feedback.message}
                </div>
              )}

              <Input
                label="Nama UKM"
                placeholder="Contoh: Robotika, Paduan Suara"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer font-medium"
                  >
                    {CATEGORIES.filter((c) => c !== 'Semua').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Kapasitas / Kuota Mahasiswa"
                  type="number"
                  min={1}
                  placeholder="30"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan fokus kegiatan, program kerja, dan keunggulan UKM..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400"
                />
              </div>

              <Input
                label="URL Logo (Opsional)"
                placeholder="https://example.com/logo.png"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button type="submit" loading={submitting}>
                  {editingUkm ? 'Simpan Perubahan' : 'Tambahkan UKM'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm p-6 bg-white border-slate-100 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hapus UKM?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini tidak dapat dibatalkan. Mahasiswa tidak akan dapat memilih UKM ini lagi.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeleteConfirmId(null)}>
                Batal
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Ya, Hapus UKM
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
