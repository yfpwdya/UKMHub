import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationApi } from '../api/registration';
import { useRegistrationStore } from '../store/registrationStore';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, ArrowLeft, Send } from 'lucide-react';

const categoryColor: Record<string, 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'gray'> = {
  Olahraga: 'green',
  Seni: 'yellow',
  Teknologi: 'indigo',
  Sosial: 'red',
  Akademik: 'purple',
};

export const ConfirmationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedUKM, scores } = useRegistrationStore();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await registrationApi.submit(selectedUKM);
      navigate('/success');
    } catch {
      setError('Gagal mengirim pendaftaran. Silakan periksa kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  const topCategory = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <Badge color="indigo" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Finalisasi Pendaftaran
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Konfirmasi Data & Pilihan</h1>
        <p className="text-slate-500 mt-1">Pastikan seluruh informasi sudah sesuai sebelum mengirim.</p>
      </div>

      <div className="space-y-6">
        {/* Data Diri Card */}
        <Card className="p-6 border-slate-100 shadow-md">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
            Profil Pendaftar
          </h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Nama Lengkap</span>
              <span className="font-semibold text-slate-800">{user?.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">NIM / Semester</span>
              <span className="font-semibold text-slate-800">{user?.nim} (Sem {user?.semester})</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Fakultas</span>
              <span className="font-semibold text-slate-800">{user?.faculty}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Program Studi</span>
              <span className="font-semibold text-slate-800">{user?.major}</span>
            </div>
          </div>
        </Card>

        {/* Hasil Psikometrik Summary */}
        {topCategory && (
          <Card className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50/50 border-indigo-100 shadow-sm">
            <h2 className="text-sm font-bold text-indigo-950 mb-1">Kecenderungan Minat Utama</h2>
            <p className="text-sm text-indigo-900/80 leading-relaxed">
              Berdasarkan hasil tes, kamu memiliki dominasi pada bidang{' '}
              <span className="font-bold text-indigo-700 uppercase tracking-wide">{topCategory[0]}</span>{' '}
              dengan skor <span className="font-bold">{topCategory[1]} poin</span>.
            </p>
          </Card>
        )}

        {/* Pilihan UKM Final List */}
        <Card className="p-6 border-slate-100 shadow-md">
          <h2 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
            Daftar UKM Didaftarkan (Berdasarkan Skala Prioritas)
          </h2>
          <div className="space-y-3">
            {selectedUKM.map((c) => (
              <div
                key={c.ukm.id}
                className="flex items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-100"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                    #{c.priority}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{c.ukm.name}</h3>
                    <p className="text-xs text-slate-400">{c.ukm.description}</p>
                  </div>
                </div>
                <Badge color={categoryColor[c.ukm.category] || 'gray'}>{c.ukm.category}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Agreement Checkbox */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 accent-indigo-600 rounded"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              Saya menyatakan bahwa seluruh data diri yang diisikan adalah benar. Saya bersedia mengikuti alur seleksi dan komitmen organisasi sesuai prioritas yang telah saya tentukan.
            </span>
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-medium text-rose-600 text-center">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/select-ukm')} className="w-1/3">
            <ArrowLeft className="w-4 h-4 mr-1" /> Ubah Pilihan
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!agreed || selectedUKM.length === 0}
            loading={submitting}
            size="lg"
            className="w-2/3 shadow-xl"
          >
            Kirim Pendaftaran Sekarang <Send className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
