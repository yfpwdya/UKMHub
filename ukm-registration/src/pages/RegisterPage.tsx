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
import { User, CreditCard, Mail, Building, GraduationCap, Lock, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  nim: z.string().min(1, 'NIM wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  faculty: z.string().min(2, 'Fakultas wajib diisi'),
  major: z.string().min(2, 'Jurusan wajib diisi'),
  semester: z.string().min(1, 'Semester wajib diisi'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      await authApi.register({ ...data, semester: parseInt(data.semester, 10) });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Pendaftaran gagal. Pastikan backend server berjalan dan data valid.';
      setError(msg);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-12 bg-slate-50/50">
      <Card className="w-full max-w-xl p-8 shadow-xl shadow-slate-200/60 border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Registrasi Mahasiswa</h1>
          <p className="text-sm text-slate-500 mt-1">Lengkapi data akademikmu untuk pendaftaran UKM</p>
        </div>

        {success ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Akun Berhasil Dibuat!</h3>
            <p className="text-sm text-slate-500 mt-2">Mengalihkan kamu ke halaman masuk...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Nama Lengkap"
              placeholder="Sesuai Kartu Tanda Mahasiswa"
              icon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="NIM"
                placeholder="Nomor Induk Mahasiswa"
                icon={<CreditCard className="w-4 h-4" />}
                error={errors.nim?.message}
                {...register('nim')}
              />
              <Input
                label="Semester"
                type="number"
                placeholder="Contoh: 1, 3, 5"
                icon={<GraduationCap className="w-4 h-4" />}
                error={errors.semester?.message}
                {...register('semester')}
              />
            </div>

            <Input
              label="Email Kampus / Pribadi"
              type="email"
              placeholder="mahasiswa@kampus.ac.id"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Fakultas"
                placeholder="Fakultas Ilmu Komputer"
                icon={<Building className="w-4 h-4" />}
                error={errors.faculty?.message}
                {...register('faculty')}
              />
              <Input
                label="Program Studi / Jurusan"
                placeholder="Teknik Informatika"
                icon={<GraduationCap className="w-4 h-4" />}
                error={errors.major?.message}
                {...register('major')}
              />
            </div>

            <Input
              label="Password Akun"
              type="password"
              placeholder="Minimal 6 karakter"
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
              Daftar Akun Baru
            </Button>
          </form>
        )}

        {!success && (
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline-offset-4 hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
