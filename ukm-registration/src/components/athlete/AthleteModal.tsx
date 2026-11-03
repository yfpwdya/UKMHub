import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Trophy, Link2, X, CheckCircle2 } from 'lucide-react';
import { athleteApi } from '../../api/athlete';
import type { AthletePayload } from '../../types/athlete';

interface AthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sportCategory: string;
  onSuccess?: () => void;
}

export const AthleteModal: React.FC<AthleteModalProps> = ({
  isOpen,
  onClose,
  sportCategory,
  onSuccess,
}) => {
  const [level, setLevel] = useState<'Kota' | 'Provinsi' | 'Nasional' | 'Internasional'>('Provinsi');
  const [clubHistory, setClubHistory] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certUrl) {
      setError('Link/URL sertifikat atau piagam prestasi wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    const payload: AthletePayload = {
      sport_category: sportCategory,
      achievement_level: level,
      club_history: clubHistory,
      certificate_url: certUrl,
    };

    try {
      await athleteApi.submit(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch {
      setError('Gagal menyimpan data portofolio. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-6 shadow-2xl relative border-indigo-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Jalur Prestasi Atlet</h2>
            <p className="text-xs text-slate-500">Cabang: <span className="font-semibold text-indigo-600">{sportCategory}</span></p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
          💡 Pendaftar jalur atlet yang sertifikatnya terverifikasi akan mendapatkan <strong>poin afirmasi prioritas</strong> pada sistem seleksi otomatis!
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">Portofolio Berhasil Disimpan!</p>
            <p className="text-xs text-slate-500">Menutup jendela...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
                Tingkat Prestasi Tertinggi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Kota', 'Provinsi', 'Nasional', 'Internasional'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      level === lvl
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Riwayat Klub / Sekolah Asal"
              placeholder="Contoh: Tim Popda Solo / SMA 1 Semarang"
              value={clubHistory}
              onChange={(e) => setClubHistory(e.target.value)}
            />

            <Input
              label="Link File Sertifikat / Piagam (Google Drive / Cloud)"
              placeholder="https://drive.google.com/..."
              icon={<Link2 className="w-4 h-4" />}
              value={certUrl}
              onChange={(e) => setCertUrl(e.target.value)}
            />

            {error && (
              <p className="text-xs text-rose-500 font-medium text-center">{error}</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Batal
              </Button>
              <Button type="submit" loading={loading} className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                Simpan Portofolio
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
