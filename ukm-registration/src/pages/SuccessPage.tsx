import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/dashboard'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Berhasil Dikirim!</h1>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed">
          Terima kasih telah melakukan pendaftaran. Data dan prioritas pilihanmu telah berhasil disimpan di sistem.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          Mengalihkan otomatis ke dashboard dalam 5 detik...
        </p>
        <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full shadow-md">
          Ke Dashboard Sekarang <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
