import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { scheduleApi } from '../../api/schedule';
import { interviewApi } from '../../api/interview';
import type { Schedule, InterviewBooking } from '../../types/schedule';

interface InterviewBookingCardProps {
  ukmId?: number;
  ukmName?: string;
  registrationId: number;
}

export const InterviewBookingCard: React.FC<InterviewBookingCardProps> = ({
  ukmId,
  ukmName,
  registrationId,
}) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [myBooking, setMyBooking] = useState<InterviewBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedRes, bookRes] = await Promise.allSettled([
        scheduleApi.getAll({ ukm_id: ukmId }),
        interviewApi.getMyBooking(),
      ]);

      if (schedRes.status === 'fulfilled') setSchedules(schedRes.value.data);
      if (bookRes.status === 'fulfilled') setMyBooking(bookRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ukmId]);

  const handleBook = async (schedId: number) => {
    setBookingId(schedId);
    try {
      await interviewApi.book({ schedule_id: schedId, registration_id: registrationId });
      alert('Sesi berhasil dipilih!');
      loadData();
    } catch {
      alert('Gagal memilih sesi. Sesi mungkin sudah penuh.');
    } finally {
      setBookingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-indigo-100 mb-6">
        <div className="flex justify-center py-6">
          <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-indigo-100 shadow-md mb-6 bg-gradient-to-br from-white via-indigo-50/20 to-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Badge color="indigo" icon={<Calendar className="w-3 h-3" />}>
            Jadwal Sesi Wawancara / First Gathering
          </Badge>
          <h2 className="text-base font-bold text-slate-900 mt-1">
            Pilih Slot Waktu di {ukmName || 'UKM Pilihan'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tentukan jadwal wawancara atau pertemuan yang sesuai dengan ketersediaan waktumu.
          </p>
        </div>
      </div>

      {myBooking ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Jadwal Kamu Telah Dikonfirmasi
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-0.5">{myBooking.title}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {new Date(myBooking.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {myBooking.start_time.slice(0, 5)} - {myBooking.end_time.slice(0, 5)} WIB
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {myBooking.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : schedules.length === 0 ? (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
          <p className="text-xs text-slate-500 font-medium">
            Pengurus UKM belum menerbitkan slot jadwal wawancara / pertemuan untuk saat ini. Silakan pantau secara berkala.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {schedules.map((s) => {
            const booked = parseInt(String(s.booked_count || 0));
            const isFull = booked >= s.quota;

            return (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isFull
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-800 text-sm">{s.title}</h3>
                  <Badge color={isFull ? 'red' : 'green'}>
                    {isFull ? 'Penuh' : `Sisa ${s.quota - booked} Slot`}
                  </Badge>
                </div>

                <div className="space-y-1 text-xs text-slate-500 mb-3">
                  <p className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)} WIB
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    {s.location}
                  </p>
                </div>

                <Button
                  size="sm"
                  disabled={isFull}
                  loading={bookingId === s.id}
                  onClick={() => handleBook(s.id)}
                  className="w-full text-xs"
                >
                  {isFull ? 'Kuota Penuh' : 'Pilih Sesi Ini'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
