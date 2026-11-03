import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionnaireApi } from '../api/questionnaire';
import { useRegistrationStore } from '../store/registrationStore';
import type { Question } from '../types/questionnaire';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const QuestionnairePage = () => {
  const navigate = useNavigate();
  const { answers, setAnswer, setScores, setRecommended } = useRegistrationStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    questionnaireApi.getQuestions().then((res) => {
      setQuestions(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const progress = questions.length ? Math.round(((current + 1) / questions.length) * 100) : 0;
  const question = questions[current];
  const isLast = current === questions.length - 1;
  const hasAnswer = question ? answers[question.id] !== undefined : false;

  const handleNext = () => {
    if (isLast) handleSubmit();
    else setCurrent((c) => c + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await questionnaireApi.submitAnswers(answers);
      setScores(res.data.scores);
      setRecommended([]);
      navigate('/result');
    } catch {
      alert('Gagal mengirim jawaban. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <p className="text-slate-500">Soal kuisioner belum tersedia saat ini.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <Badge color="indigo" icon={<Sparkles className="w-3 h-3" />}>
            Tes Psikometrik UKM
          </Badge>
          <span className="text-xs font-bold text-slate-400">
            Soal {current + 1} Dari {questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200/50">
          <div
            className="bg-gradient-to-r from-indigo-600 to-violet-600 h-2 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <Card className="p-8 shadow-xl shadow-slate-200/60 border-slate-100 mb-8">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">
          Kategori: {question.category}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-8 leading-snug">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.answers.map((ans) => {
            const isSelected = answers[question.id] === ans.id;
            return (
              <label
                key={ans.id}
                onClick={() => setAnswer(question.id, ans.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-500/5'
                    : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-indigo-950 font-semibold' : 'text-slate-700'}`}>
                    {ans.text}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </Card>

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Sebelumnya
        </Button>

        <Button onClick={handleNext} disabled={!hasAnswer} loading={submitting} size="lg">
          {isLast ? 'Kirim & Lihat Hasil' : 'Selanjutnya'} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
