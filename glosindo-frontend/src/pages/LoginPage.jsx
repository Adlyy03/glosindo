import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { LOGO, APP_NAME, APP_FULL_NAME } from '../constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login({ email, password });

    if (result.success) {
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login gagal');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-6 relative overflow-hidden select-none">
      {/* Ambient Corporate Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-navy/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        {/* Brand & Kiosk Title Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 mb-4 shadow-xl">
            <img src={LOGO} alt={APP_NAME} className="h-20 w-20 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">{APP_NAME}</h1>
          <p className="text-slate-300 text-xs font-semibold mt-1 tracking-wide">{APP_FULL_NAME}</p>
          <div className="mt-3 inline-block">
            <Badge variant="cyan" dot>Digital Guestbook System</Badge>
          </div>
        </div>

        {/* Login Card */}
        <Card padding="p-8" className="bg-white/95 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Portal Petugas</h2>
              <p className="text-xs text-slate-500 font-medium">Masuk untuk mengelola sistem buku tamu</p>
            </div>
            <div className="p-2 rounded-xl bg-brand-navy/10 text-brand-navy">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Email Petugas
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@glosindo.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all bg-slate-50/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={ArrowRight}
            >
              Masuk ke Dashboard
            </Button>
          </form>

          {/* Demo Credentials Card */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              <KeyRound className="w-4 h-4 text-brand-cyan" />
              <span>Kredensial Demo:</span>
            </div>
            <div className="text-xs text-slate-600 space-y-1 font-mono">
              <p><span className="font-bold text-brand-navy">Admin:</span> admin@glosindo.com / Admin123!</p>
              <p><span className="font-bold text-brand-navy">Receptionist:</span> receptionist@glosindo.com / Recep123!</p>
            </div>
          </div>
        </Card>

        {/* Footer copyright */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          © 2026 {APP_NAME}. Global Media Pratama Solusindo.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
