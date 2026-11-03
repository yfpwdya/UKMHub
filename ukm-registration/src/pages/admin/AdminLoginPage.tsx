import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { useAdminStore } from '../../store/adminStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ShieldCheck, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

type FormData = z.infer<typeof schema>;

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { setAdminAuth, isAuthenticated } = useAdminStore();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
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
      const res = await adminApi.login(data);
      setAdminAuth(res.data.admin, res.data.token);
      navigate('/admin/dashboard');
    } catch {
      setError('Email atau password admin salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
          </Link>
        </div>

        <Card className="p-8 shadow-xl shadow-slate-200/60 border-slate-100 bg-white">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm shadow-indigo-500/10">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Portal Admin</h1>
            <p className="text-sm text-slate-500 mt-1">Masuk untuk mengelola pendaftaran dan data UKM</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <Input
                label="Email Administrator"
                placeholder="admin@ukm.ac.id"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs font-medium text-rose-600 text-center">
                {error}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-2">
              Masuk Portal Admin <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Default credentials: <code className="text-indigo-600 font-semibold">admin@ukm.ac.id</code> / <code className="text-indigo-600 font-semibold">admin123</code>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
