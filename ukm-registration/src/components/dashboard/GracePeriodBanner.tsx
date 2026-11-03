import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock } from 'lucide-react';
import { registrationApi } from '../../api/registration';
import { useNavigate } from 'react-router-dom';

interface GracePeriodBannerProps {
  graceDeadline?: string;
  status: string;
  onCancelled?: () => void;
}

export const GracePeriodBanner: React.FC<GracePeriodBannerProps> = ({
  graceDeadline,
  status,
  onCancelled,
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!graceDeadline) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(graceDeadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [graceDeadline]);

  if (status !== 'pending' || isExpired || !timeLeft) return null;

  const handleCancel = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pendaftaran ini? Anda dapat mendaftar kembali setelah dibatalkan.')) {
      return;
    }

    setCancelling(true);
    try {
      await registrationApi.cancel();
      alert('Pendaftaran berhasil dibatalkan.');
      if (onCancelled) onCancelled();
      else window.location.reload();
    } catch {
      alert('Gagal membatalkan pendaftaran.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-amber-300/80 p-5 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                Masa Tenggang 24 Jam Aktif
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm mt-1">
              Sisa Waktu Ubah/Batal:{' '}
              <span className="font-mono text-amber-600 font-extrabold">
                {String(timeLeft.hours).padStart(2, '0')} Jam{' '}
                {String(timeLeft.minutes).padStart(2, '0')} Menit{' '}
                {String(timeLeft.seconds).padStart(2, '0')} Detik
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Anda masih dapat mengubah susunan prioritas UKM atau membatalkan formulir sebelum berkas dikunci untuk seleksi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/select-ukm')}
            className="border-amber-500 text-amber-700 hover:bg-amber-100 text-xs w-full md:w-auto"
          >
            Ubah Pilihan
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={cancelling}
            onClick={handleCancel}
            className="text-xs w-full md:w-auto"
          >
            Batalkan
          </Button>
        </div>
      </div>
    </Card>
  );
};
