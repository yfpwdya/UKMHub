import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Users,
  BrainCircuit,
  Target,
} from 'lucide-react';

const FEATURED_UKM = [
  { id: 1, name: 'Basket', category: 'Olahraga', desc: 'Tim basket kampus berprestasi di kancah regional dan nasional.', members: '45+ Mahasiswa' },
  { id: 2, name: 'Paduan Suara', category: 'Seni', desc: 'Kelompok olah vokal dengan berbagai kejuaraan festival internasional.', members: '60+ Mahasiswa' },
  { id: 3, name: 'Robotika', category: 'Teknologi', desc: 'Laboratorium riset dan kompetisi robotika tingkat nasional.', members: '30+ Mahasiswa' },
  { id: 4, name: 'KSR PMI', category: 'Sosial', desc: 'Organisasi relawan kemanusiaan dan aksi tanggap bencana.', members: '80+ Mahasiswa' },
  { id: 5, name: 'Fotografi', category: 'Seni', desc: 'Wadah eksplorasi seni visual dan fotografi jurnalistik.', members: '40+ Mahasiswa' },
  { id: 6, name: 'Debat Bahasa Inggris', category: 'Akademik', desc: 'Komunitas pemikir kritis yang aktif bertanding di ajang NUDC.', members: '25+ Mahasiswa' },
];

const categoryColor: Record<string, 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'gray'> = {
  Olahraga: 'green',
  Seni: 'yellow',
  Teknologi: 'indigo',
  Sosial: 'red',
  Akademik: 'purple',
};

export const LandingPage = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 px-6 bg-gradient-to-b from-indigo-50/50 via-white to-white">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Badge color="indigo" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Platform Pendaftaran UKM Terintegrasi
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mt-6 mb-6 leading-[1.15]">
            Temukan UKM yang Paling <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Sesuai Minat & Bakatmu
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Ikuti tes psikometrik kuisioner singkat kami, dapatkan analisis potensi diri, dan tentukan pilihan UKM terbaikmu hingga 4 skala prioritas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Mulai Pendaftaran Now <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sudah Punya Akun
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative blur elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-200/30 rounded-full blur-3xl -z-10" />
      </section>

      {/* Feature / Workflow Section */}
      <section className="py-20 px-6 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Bagaimana Cara Kerjanya?</h2>
            <p className="text-slate-500">4 langkah mudah menemukan kegiatan kemahasiswaan impianmu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              {
                icon: <Users className="w-6 h-6 text-indigo-600" />,
                step: '01',
                title: 'Buat Akun',
                desc: 'Registrasi menggunakan NIM dan data akademik resmi kampusmu.',
              },
              {
                icon: <BrainCircuit className="w-6 h-6 text-indigo-600" />,
                step: '02',
                title: 'Tes Psikometrik',
                desc: 'Jawab pertanyaan kuisioner interaktif seputar kecenderungan bakatmu.',
              },
              {
                icon: <Target className="w-6 h-6 text-indigo-600" />,
                step: '03',
                title: 'Analisis Skor',
                desc: 'Sistem menganalisis radar minat dan memberikan rekomendasi otomatis.',
              },
              {
                icon: <Trophy className="w-6 h-6 text-indigo-600" />,
                step: '04',
                title: 'Pilih Prioritas',
                desc: 'Pilih maks. 4 UKM favoritmu dan atur urutan prioritas dengan drag & drop.',
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  {icon}
                </div>
                <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">Step {step}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured UKM Grid */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Pilihan UKM Populer</h2>
              <p className="text-slate-500">Temukan puluhan UKM berkualitas di berbagai bidang</p>
            </div>
            <Link to="/register">
              <Button variant="outline" className="hidden sm:inline-flex">
                Lihat Semua UKM
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_UKM.map((ukm) => (
              <Card key={ukm.id} className="flex flex-col justify-between hover:border-indigo-200">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge color={categoryColor[ukm.category] || 'gray'}>{ukm.category}</Badge>
                    <span className="text-xs font-medium text-slate-400">{ukm.members}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{ukm.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6">{ukm.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pendaftaran Buka
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap Mengembangkan Potensi Dirimu?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Jangan sampai salah memilih organisasi. Mulai kuisioner bakat minatmu sekarang dan daftarkan diri dalam hitungan menit!
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-xl">
              Daftar UKM Sekarang
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
