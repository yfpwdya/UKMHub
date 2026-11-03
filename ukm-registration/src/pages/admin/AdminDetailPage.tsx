import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { athleteApi } from '../../api/athlete';
import type { AdminRegistrationDetail } from '../../api/admin';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeft, CheckCircle2, XCircle, User, BookOpen, Brain, Calendar, Trophy, ExternalLink } from 'lucide-react';

const statusBadge: Record<string, { color: 'yellow' | 'green' | 'red'; label: string }> = {
  pending: { color: 'yellow', label: 'Menunggu Seleksi' },
  accepted: { color: 'green', label: 'Diterima' },
  rejected: { color: 'red', label: 'Ditolak' },
};

export const AdminDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AdminRegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const loadDetail = () => {
    if (id) {
      adminApi.getRegistrationDetail(id).then((res) => {
        setData(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleUpdate = async (status: 'accepted' | 'rejected') => {
    if (!data) return;
    setUpdating(true);
    try {
      const ukmId = status === 'accepted' ? data.ukm_choices[0]?.ukm.id : undefined;
      const note = status === 'accepted' ? `Diterima manual oleh Admin di ${data.ukm_choices[0]?.ukm.name}` : 'Ditolak manual oleh Admin';
      await adminApi.updateStatus(data.id, status, ukmId, note);
      loadDetail();
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyAthlete = async (status: 'verified' | 'rejected') => {
    if (!data?.athlete_portfolio) return;
    setVerifying(true);
    try {
      await athleteApi.verify(data.athlete_portfolio.id, status);
      loadDetail();
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-20">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Data pendaftaran tidak ditemukan.</p>
        <Button onClick={() => navigate('/admin/registrations')} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin/registrations')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Tabel
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={() => handleUpdate('accepted')}
            loading={updating}
            disabled={data.status === 'accepted'}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> Terima Mahasiswa
          </Button>
          <Button
            onClick={() => handleUpdate('rejected')}
            loading={updating}
            disabled={data.status === 'rejected'}
            variant="danger"
          >
            <XCircle className="w-4 h-4 mr-1" /> Tolak Pendaftaran
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="bg-slate-950 border-slate-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-indigo-400">{data.reference_number}</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">{data.name}</h1>
            <p className="text-sm text-slate-400">NIM: {data.nim} • Email: {data.email}</p>
          </div>
          <Badge color={statusBadge[data.status]?.color}>
            {statusBadge[data.status]?.label}
          </Badge>
        </div>
      </Card>

      {/* FITUR 1: Portofolio Atlet jika ada */}
      {data.athlete_portfolio && (
        <Card className="bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 border-amber-500/40 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Portofolio Jalur Prestasi Atlet
                </h2>
                <p className="text-xs text-amber-400">Cabang: {data.athlete_portfolio.sport_category}</p>
              </div>
            </div>
            <Badge color={data.athlete_portfolio.verified_status === 'verified' ? 'green' : data.athlete_portfolio.verified_status === 'rejected' ? 'red' : 'yellow'}>
              {data.athlete_portfolio.verified_status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300 mb-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <p><span className="text-slate-500">Tingkat Prestasi:</span> <strong className="text-white">{data.athlete_portfolio.achievement_level}</strong></p>
            <p><span className="text-slate-500">Riwayat Klub / Asal:</span> <span className="text-slate-300">{data.athlete_portfolio.club_history || '-'}</span></p>
            <div className="col-span-full pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-xs">Bukti Dokumen Sertifikat:</span>
              <a
                href={data.athlete_portfolio.certificate_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                Lihat File Sertifikat <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {data.athlete_portfolio.verified_status === 'pending' && (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="danger"
                loading={verifying}
                onClick={() => handleVerifyAthlete('rejected')}
              >
                Tolak Portofolio
              </Button>
              <Button
                size="sm"
                loading={verifying}
                onClick={() => handleVerifyAthlete('verified')}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Verifikasi & Beri Afirmasi
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Akademik */}
        <Card className="bg-slate-950 border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Informasi Akademik
          </h2>
          <div className="space-y-2 text-sm text-slate-300">
            <p><span className="text-slate-500">Fakultas:</span> {data.faculty}</p>
            <p><span className="text-slate-500">Program Studi:</span> {data.major}</p>
            <p><span className="text-slate-500">Semester:</span> {data.semester}</p>
            <p className="flex items-center gap-1 text-slate-500 text-xs mt-3 pt-3 border-t border-slate-800">
              <Calendar className="w-3.5 h-3.5" /> Didaftarkan pada: {new Date(data.submitted_at).toLocaleString('id-ID')}
            </p>
          </div>
        </Card>

        {/* Skor Psikometrik */}
        <Card className="bg-slate-950 border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" /> Hasil Tes Psikometrik
          </h2>
          {data.scores ? (
            <div className="space-y-2">
              {Object.entries(data.scores).map(([cat, score]) => (
                <div key={cat} className="flex justify-between items-center text-sm p-2 bg-slate-900 rounded-lg">
                  <span className="capitalize font-semibold text-slate-300">{cat}</span>
                  <span className="font-bold text-indigo-400">{score} Poin</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Tidak ada skor tes.</p>
          )}
        </Card>
      </div>

      {/* Choices List */}
      <Card className="bg-slate-950 border-slate-800 p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" /> Prioritas Pilihan UKM
        </h2>
        <div className="space-y-3">
          {data.ukm_choices.map((c) => (
            <div key={c.ukm.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                  #{c.priority}
                </span>
                <span className="font-bold text-white text-sm">{c.ukm.name}</span>
              </div>
              <Badge color="gray">{c.ukm.category}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
