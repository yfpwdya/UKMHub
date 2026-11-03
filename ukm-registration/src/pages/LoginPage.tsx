import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Lock, CreditCard, Sparkles, ArrowRight } from 'lucide-react';

const schema = z.object({
  nim: z.string().min(1, 'NIM wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await authApi.login(data);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch {
      setError('NIM atau password salah. Silakan periksa kembali.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 bg-slate-50/50">
      <Card className="w-full max-w-md p-8 shadow-xl shadow-slate-200/60 border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang Kembali</h1>
          <p className="text-sm text-slate-500 mt-1">Masuk untuk mengelola pendaftaran UKM-mu</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="NIM"
            placeholder="Masukkan Nomor Induk Mahasiswa"
            icon={<CreditCard className="w-4 h-4" />}
            error={errors.nim?.message}
            {...register('nim')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-medium text-rose-600 text-center">
              {error}
            </div>
          )}

          <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-2">
            Masuk ke Akun <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-sm text-slate-500">
            Belum mendaftar?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold underline-offset-4 hover:underline">
              Buat Akun Sekarang
            </Link>
          </p>
          <p className="text-xs text-slate-400">
            Pengelola atau Pengurus UKM?{' '}
            <Link to="/admin/login" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              Masuk Portal Admin
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
