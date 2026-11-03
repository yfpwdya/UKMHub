import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { questionnaireApi } from '../api/questionnaire';
import { ukmApi } from '../api/ukm';
import { useRegistrationStore } from '../store/registrationStore';
import type { UKM } from '../types/ukm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';

const categoryColor: Record<string, 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'gray'> = {
  Olahraga: 'green',
  Seni: 'yellow',
  Teknologi: 'indigo',
  Sosial: 'red',
  Akademik: 'purple',
};

export const ResultPage = () => {
  const navigate = useNavigate();
  const { scores, setScores, recommended, setRecommended } = useRegistrationStore();
  const [loading, setLoading] = useState(Object.keys(scores).length === 0);
  const [allUKM, setAllUKM] = useState<UKM[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        if (Object.keys(scores).length === 0) {
          const res = await questionnaireApi.getResult();
          setScores(res.data.scores);
        }
        const ukmRes = await ukmApi.getAll();
        setAllUKM(ukmRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!allUKM.length || !Object.keys(scores).length) return;
    const sorted = [...allUKM].sort((a, b) => {
      const scoreA = scores[a.category.toLowerCase()] || 0;
      const scoreB = scores[b.category.toLowerCase()] || 0;
      return scoreB - scoreA;
    });
    setRecommended(sorted.slice(0, 6));
  }, [allUKM, scores]);

  const chartData = Object.entries(scores).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: val,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <Badge color="indigo" icon={<Sparkles className="w-3.5 h-3.5" />}>
          Hasil Analisis Bakat & Minat
        </Badge>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-3 mb-2">Profil Potensi Diri</h1>
        <p className="text-slate-500">
          Berdasarkan hasil tes psikometrik, berikut adalah visualisasi minat utama dan rekomendasi UKM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Visual Radar Chart */}
        <Card className="p-6 border-indigo-100 shadow-md flex flex-col justify-between">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" /> Radar Dominasi Minat
          </h2>
          {chartData.length > 0 ? (
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                  <Radar name="Skor Dominasi" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">Skor tidak tersedia</p>
          )}
        </Card>

        {/* Detail Breakdown */}
        <Card className="p-6 border-slate-100 shadow-md">
          <h2 className="font-bold text-slate-800 mb-6">Breakdown Skor per Bidang</h2>
          <div className="space-y-4">
            {Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, score], index) => {
                const maxScore = Math.max(...Object.values(scores));
                const pct = maxScore ? Math.round((score / maxScore) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-semibold text-slate-700 flex items-center gap-2">
                        {index === 0 && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        {cat}
                      </span>
                      <span className="font-bold text-indigo-600">{score} Poin</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-gradient-to-r from-indigo-600 to-violet-600' : 'bg-indigo-300'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Rekomendasi UKM Terbaik</h2>
            <p className="text-sm text-slate-500">Paling cocok dengan karakter dan bakatmu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommended.map((ukm, i) => (
            <Card
              key={ukm.id}
              className={`relative flex flex-col justify-between ${
                i === 0 ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 bg-indigo-50/20' : ''
              }`}
            >
              {i === 0 && (
                <div className="absolute -top-3 left-6">
                  <Badge color="indigo" icon={<CheckCircle2 className="w-3 h-3" />}>
                    Top Match #1
                  </Badge>
                </div>
              )}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge color={categoryColor[ukm.category] || 'gray'}>{ukm.category}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{ukm.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{ukm.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center">
        <Button size="lg" onClick={() => navigate('/select-ukm')} className="px-10 shadow-xl">
          Lanjut Pilih Prioritas UKM <ArrowRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
