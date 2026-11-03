import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { registrationApi } from '../api/registration';
import { questionnaireApi } from '../api/questionnaire';
import type { Registration } from '../types/registration';
import type { QuestionnaireResult } from '../types/questionnaire';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { GracePeriodBanner } from '../components/dashboard/GracePeriodBanner';
import { InterviewBookingCard } from '../components/dashboard/InterviewBookingCard';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Brain,
  FileCheck,
  User,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

const statusColor: Record<string, 'yellow' | 'green' | 'red'> = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
};

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  accepted: <CheckCircle2 className="w-3.5 h-3.5" />,
  rejected: <XCircle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
};

const statusLabel: Record<string, string> = {
  pending: 'Proses Seleksi',
  accepted: 'Diterima',
  rejected: 'Tidak Lolos',
};

export const DashboardPage = () => {
  const { user } = useAuthStore();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [result, setResult] = useState<QuestionnaireResult | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [regRes, qRes] = await Promise.allSettled([
        registrationApi.getStatus(),
        questionnaireApi.getResult(),
      ]);
      if (regRes.status === 'fulfilled') setRegistration(regRes.value.data);
      if (qRes.status === 'fulfilled') setResult(qRes.value.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStep = () => {
    if (registration && registration.status !== 'cancelled') return 'submitted';
    if (result) return 'has-result';
    return 'new';
  };

  const step = getStep();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-8 mb-6 shadow-xl shadow-indigo-950/10 relative overflow-hidden">
        <div className="relative z-10">
          <Badge color="indigo" icon={<Sparkles className="w-3 h-3" />}>
            Dashboard Pendaftar
          </Badge>
          <h1 className="text-3xl font-extrabold mt-3 mb-1">
            Selamat Datang, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-indigo-200 text-sm max-w-xl">
            Kelola proses pendaftaran UKM-mu dari sini. Pantau status seleksi dan pilih jadwal wawancara.
          </p>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* FITUR 5: Grace Period 24 Jam Countdown */}
      {registration && registration.status === 'pending' && (
        <GracePeriodBanner
          graceDeadline={registration.grace_deadline}
          status={registration.status}
          onCancelled={() => {
            setRegistration(null);
            loadData();
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* FITUR 4: Sesi Wawancara / Gathering Interaktif jika DITERIMA */}
          {registration && registration.status === 'accepted' && (
            <InterviewBookingCard
              ukmId={registration.accepted_ukm_id}
              ukmName={registration.accepted_ukm_name}
              registrationId={registration.id}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Action Card */}
            <Card className="lg:col-span-2 border-indigo-100 shadow-md">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" /> Status Alur Pendaftaran
              </h2>

              {step === 'new' && (
                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Langkah 1 Dari 3</span>
                    <h3 className="text-lg font-bold text-slate-800">Isi Kuisioner Bakat & Minat</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      Jawab beberapa pertanyaan singkat untuk membantu kami merekomendasikan UKM paling cocok.
                    </p>
                  </div>
                  <Link to="/questionnaire">
                    <Button size="lg" className="whitespace-nowrap shadow-md">
                      Mulai Kuisioner <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}

              {step === 'has-result' && (
                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Langkah 2 Dari 3</span>
                    <h3 className="text-lg font-bold text-slate-800">Pilih Skala Prioritas UKM</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      Kuisioner selesai! Pilih maksimal 4 UKM dan tentukan urutan prioritas pendaftaranmu.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Link to="/result" className="flex-1 sm:flex-initial">
                      <Button variant="outline" className="w-full">Lihat Skor</Button>
                    </Link>
                    <Link to="/select-ukm" className="flex-1 sm:flex-initial">
                      <Button className="w-full">Pilih UKM</Button>
                    </Link>
                  </div>
                </div>
              )}

              {step === 'submitted' && registration && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Nomor Referensi</span>
                      <p className="font-mono font-bold text-slate-800 text-sm">{registration.reference_number}</p>
                    </div>
                    <Badge color={statusColor[registration.status]} icon={statusIcon[registration.status]}>
                      {statusLabel[registration.status]}
                    </Badge>
                  </div>

                  {registration.status === 'accepted' && registration.accepted_ukm_name && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Hasil Seleksi</span>
                      <p className="text-sm font-bold text-emerald-950 mt-1">
                        Selamat! Anda resmi diterima di {registration.accepted_ukm_name}
                      </p>
                      {registration.selection_note && (
                        <p className="text-xs text-emerald-700 mt-1">{registration.selection_note}</p>
                      )}
                    </div>
                  )}

                  {registration.status === 'rejected' && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                      <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">Hasil Seleksi</span>
                      <p className="text-xs text-rose-700 mt-1">
                        {registration.selection_note || 'Kuota pendaftaran pada seluruh pilihan UKM telah terpenuhi.'}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Prioritas UKM yang Didaftarkan:</h3>
                    <div className="space-y-2.5">
                      {registration.ukm_choices.map((c) => {
                        const isAcceptedHere = registration.status === 'accepted' && registration.accepted_ukm_id === c.ukm.id;

                        return (
                          <div
                            key={c.ukm.id}
                            className={`flex items-center justify-between p-3.5 rounded-xl border ${
                              isAcceptedHere
                                ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                                : 'bg-white border-slate-100 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isAcceptedHere ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white shadow-sm'
                              }`}>
                                P{c.priority}
                              </span>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{c.ukm.name}</p>
                                <p className="text-xs text-slate-400">{c.ukm.category}</p>
                              </div>
                            </div>

                            {isAcceptedHere ? (
                              <Badge color="green">Diterima di Sini</Badge>
                            ) : (
                              <Badge color="gray">Prioritas #{c.priority}</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Profile Side Info */}
            <div className="space-y-6">
              <Card>
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-slate-400">
                  <User className="w-4 h-4 text-indigo-600" /> Data Mahasiswa
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">NIM / Semester</p>
                      <p className="font-semibold text-slate-700">{user?.nim} (Sem {user?.semester})</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Fakultas / Program Studi</p>
                      <p className="font-semibold text-slate-700">{user?.faculty}</p>
                      <p className="text-xs text-slate-500">{user?.major}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0 shadow-lg shadow-indigo-500/10">
                <Brain className="w-8 h-8 opacity-80 mb-3" />
                <h3 className="font-bold text-lg mb-1">Rekomendasi Pintar</h3>
                <p className="text-indigo-100 text-xs leading-relaxed">
                  Sistem menganalisis jawaban psikometrikmu dan menyelaraskan dengan kapasitas UKM secara adil.
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
