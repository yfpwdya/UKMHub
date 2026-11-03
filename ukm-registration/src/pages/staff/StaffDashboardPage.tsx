import { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { scheduleApi } from '../../api/schedule';
import type { Schedule } from '../../types/schedule';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Plus, Trash2, Clock, MapPin, Users, Sparkles } from 'lucide-react';

export const StaffDashboardPage = () => {
  const { admin } = useAdminStore();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [quota, setQuota] = useState(20);
  const [type, setType] = useState<'kegiatan' | 'wawancara' | 'audisi' | 'latihan'>('wawancara');
  const [submitting, setSubmitting] = useState(false);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const res = await scheduleApi.getAll({ ukm_id: admin?.ukm_id || undefined });
      setSchedules(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [admin?.ukm_id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await scheduleApi.create({
        ukm_id: admin?.ukm_id || undefined,
        title,
        date,
        start_time: startTime,
        end_time: endTime,
        location,
        quota,
        type,
      });
      setShowModal(false);
      // Reset
      setTitle('');
      setDate('');
      setLocation('');
      loadSchedules();
    } catch {
      alert('Gagal membuat jadwal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus jadwal kegiatan ini?')) return;
    try {
      await scheduleApi.delete(id);
      loadSchedules();
    } catch {
      alert('Gagal menghapus jadwal');
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Badge color="indigo" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Panel Staff UKM: {admin?.ukm_name || 'Unit Kegiatan Mahasiswa'}
          </Badge>
          <h1 className="text-2xl font-extrabold text-white mt-1">Kelola Jadwal & Agenda</h1>
          <p className="text-sm text-slate-400">
            Atur jadwal wawancara, tes fisik, audisi, atau latihan perdana untuk calon anggota UKM.
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Jadwal Baru
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : schedules.length === 0 ? (
        <Card className="bg-slate-950 border-slate-800 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-300 text-base">Belum Ada Jadwal</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Klik tombol "Tambah Jadwal Baru" di atas untuk membuat slot waktu wawancara atau agenda perdana.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((s) => {
            const booked = parseInt(String(s.booked_count || 0));
            return (
              <Card key={s.id} className="bg-slate-950 border-slate-800 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <Badge color={s.type === 'wawancara' ? 'purple' : 'indigo'}>
                      {s.type.toUpperCase()}
                    </Badge>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-base mb-3">{s.title}</h3>

                  <div className="space-y-2 text-xs text-slate-400 mb-4">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)} WIB
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      {s.location}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" /> Terisi:
                  </span>
                  <span className="font-bold text-indigo-400">
                    {booked} / {s.quota} Mahasiswa
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Jadwal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-6 text-white relative">
            <h2 className="text-lg font-bold mb-4">Tambah Jadwal Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Nama Agenda / Sesi"
                placeholder="Contoh: Wawancara Sesi Pagi / First Gathering"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Jenis Agenda</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="wawancara">Wawancara</option>
                    <option value="audisi">Audisi</option>
                    <option value="latihan">Latihan</option>
                    <option value="kegiatan">Kegiatan Umum</option>
                  </select>
                </div>
                <Input
                  label="Tanggal"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Jam Mulai"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-white"
                />
                <Input
                  label="Jam Selesai"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    label="Lokasi / Link Virtual"
                    placeholder="Ruang Sidang Gedung B / Google Meet"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <Input
                  label="Kuota"
                  type="number"
                  value={quota}
                  onChange={(e) => setQuota(parseInt(e.target.value) || 1)}
                  required
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 text-slate-300">
                  Batal
                </Button>
                <Button type="submit" loading={submitting} className="flex-1">
                  Simpan Jadwal
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
