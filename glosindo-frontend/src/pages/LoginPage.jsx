import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { LOGO, APP_NAME, LOGIN_MASCOT } from '../constants';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processedMascot, setProcessedMascot] = useState(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  // Dynamic Browser-side HTML5 Canvas Background Removal
  // untuk membuat mascot menjadi PNG transparan
  useEffect(() => {
    const img = new Image();
    img.src = LOGIN_MASCOT;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Jika pixel putih / hampir putih
        if (r > 238 && g > 238 && b > 238) {
          data[i + 3] = 0;
        } else if (r > 210 && g > 210 && b > 210) {
          // Soft edge anti-aliasing agar tidak ada white halo
          const avg = (r + g + b) / 3;
          data[i + 3] = Math.max(
            0,
            Math.round((255 - avg) * 5)
          );
        }
      }

      ctx.putImageData(imgData, 0, 0);

      setProcessedMascot(canvas.toDataURL('image/png'));
    };
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  console.log('🔥 HANDLE SUBMIT');
  console.log('🔥 LOGIN FUNCTION:', login);

  setLoading(true);

  const result = await login({
    email,
    password,
  });

  console.log('🔥 LOGIN RESULT:', result);

  if (result.success) {
    toast.success('Login berhasil!');
    navigate('/dashboard');
  } else {
    toast.error(result.message || 'Login gagal');
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#4c65e8] relative overflow-hidden select-none">

      {/* =========================
          BACKGROUND
      ========================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Soft Radial Ambient Glows */}
        <div className="absolute top-1/4 -right-16 w-[550px] h-[550px] bg-blue-400/20 rounded-full blur-[130px]" />

        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-indigo-600/35 rounded-full blur-[110px]" />

        {/* Elegant Parallel Wave Lines */}
        <svg
          className="absolute top-0 right-0 h-full w-[50%] md:w-[42%] opacity-40"
          viewBox="0 0 500 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M50,-50 C300,250 200,550 550,850"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          <path
            d="M100,-50 C350,250 250,550 600,850"
            stroke="white"
            strokeWidth="2.5"
            opacity="0.9"
          />

          <path
            d="M150,-50 C400,250 300,550 650,850"
            stroke="white"
            strokeWidth="1"
          />

          <path
            d="M200,-50 C450,250 350,550 700,850"
            stroke="white"
            strokeWidth="3"
            opacity="0.8"
          />

          <path
            d="M250,-50 C500,250 400,550 750,850"
            stroke="white"
            strokeWidth="1.5"
          />

          <path
            d="M300,-50 C550,250 450,550 800,850"
            stroke="white"
            strokeWidth="2"
            opacity="0.7"
          />
        </svg>

        {/* Floating Accent Dots */}
        <div className="absolute top-14 left-10 w-2.5 h-2.5 bg-white/70 rounded-full shadow-[0_0_8px_white]" />

        <div className="absolute bottom-16 right-12 w-3 h-3 bg-white/60 rounded-full shadow-[0_0_10px_white]" />

        <div className="absolute bottom-8 left-1/3 w-2 h-2 bg-orange-300/80 rounded-full" />
      </div>


      {/* =========================
          MAIN SPLIT CARD
      ========================== */}
      <div className="w-full max-w-[800px] rounded-[32px] overflow-hidden bg-white shadow-[0_25px_70px_-15px_rgba(20,35,110,0.4)] border border-white/40 flex flex-col md:flex-row relative z-10 my-auto animate-fadeIn">

        {/* =========================
            LEFT COLUMN
        ========================== */}
        <div className="w-full md:w-[48%] bg-[#4c65e8] p-7 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden min-h-[380px] sm:min-h-[440px]">

          {/* Organic Wavy Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">

            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl" />

            <div className="absolute top-1/3 -right-20 w-48 h-48 bg-blue-300/15 rounded-full blur-xl" />

            <svg
              className="absolute bottom-0 right-0 w-full h-48 opacity-15 text-white"
              viewBox="0 0 400 200"
              fill="currentColor"
            >
              <path d="M0,100 C150,200 250,50 400,150 L400,200 L0,200 Z" />
            </svg>

            <div className="absolute top-1/2 left-5 w-2 h-2 bg-white/50 rounded-full" />

            <div className="absolute top-1/4 right-8 w-2.5 h-2.5 bg-white/30 rounded-full" />
          </div>


          {/* =========================
              BRAND + TEXT
          ========================== */}
          <div className="relative z-20">

            {/* Top Brand Badge */}
            <div className="flex items-center gap-2.5 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 w-fit mb-6 shadow-xs">

              <span className="w-2.5 h-2.5 bg-white rounded-full inline-block shadow-xs" />

              <span className="font-extrabold text-[11px] tracking-wider uppercase text-white">
                {APP_NAME}
              </span>

            </div>


            {/* Main Headline */}
            <h2 className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-white mb-2 leading-[1.25]">
              Kelola Tamu
              <br />
              <span className="text-blue-100">
                dengan mudah
              </span>
            </h2>

            <p className="text-xs text-blue-100/90 leading-relaxed font-normal max-w-[270px]">
              Selamat datang kembali. Pantau dan kelola seluruh kegiatan kunjungan tamu dalam satu tempat.
            </p>

          </div>


          {/* =========================
              MASCOT
              REVISI SESUAI SCREENSHOT
          ========================== */}
          <div className="relative z-10 flex justify-center items-end mt-auto pt-2 -mb-16">

            <img
              src={processedMascot || LOGIN_MASCOT}
              alt="GLOSINDO Guestbook Mascot"
              className="
                w-[400px]
                sm:w-[430px]
                max-w-none
                h-auto
                object-contain
                translate-y-2
                transition-transform
                duration-300
                hover:scale-103
              "
            />

          </div>

        </div>


        {/* =========================
            RIGHT COLUMN
        ========================== */}
        <div className="w-full md:w-[52%] p-7 sm:p-9 lg:p-10 bg-white flex flex-col justify-between relative z-10">

          <div>

            {/* Header */}
            <div className="mb-6">

              <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight mb-1">
                Login
              </h1>

              <p className="text-xs font-medium text-slate-400">
                Masuk ke akun Anda untuk melanjutkan.
              </p>

            </div>


            {/* =========================
                LOGIN FORM
            ========================== */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log('🔥 FORM SUBMIT KEPIJIT');
                handleSubmit(e);
              }}
              className="space-y-4"
            >

              {/* Email */}
              <div>

                <div className="relative flex items-center">

                  <div className="absolute left-3 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>

                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama@glosindo.com"
                    className="w-full pl-13 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-xs"
                  />

                </div>

              </div>


              {/* Password */}
              <div>

                <div className="relative flex items-center">

                  <div className="absolute left-3 w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full pl-13 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-xs"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                </div>

              </div>


              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between pt-1">

                <label className="flex items-center gap-2 cursor-pointer group select-none">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-600"
                  />

                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                    Ingat saya
                  </span>

                </label>


                <button
                  type="button"
                  onClick={() =>
                    toast(
                      'Silakan hubungi administrator untuk mereset kata sandi.',
                      {
                        icon: 'ℹ️',
                      }
                    )
                  }
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Lupa Password?
                </button>

              </div>


              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#4c65e8] hover:bg-[#3c55d9] active:bg-[#2e45c2] disabled:bg-blue-400 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >

                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Login'
                )}

              </button>

            </form>

          </div>


          {/* =========================
              FOOTER
          ========================== */}
          <div className="mt-6 pt-4 border-t border-slate-100">

            <p className="text-[11px] text-slate-400 text-center mb-3 leading-relaxed font-normal">
              Belum punya akun? Akun dibuat oleh admin — hubungi admin untuk mendapatkan akses.
            </p>


            {/* Demo Credentials */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 font-medium">

              <div className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">

                <KeyRound className="w-3.5 h-3.5 text-blue-600" />

                <span>
                  Kredensial Demo:
                </span>

              </div>


              <div className="space-y-0.5 font-mono text-[10.5px] text-slate-600">

                <p>
                  <span className="font-semibold text-slate-800">
                    Admin:
                  </span>{' '}
                  admin@glosindo.com / Admin123!
                </p>

                <p>
                  <span className="font-semibold text-slate-800">
                    Receptionist:
                  </span>{' '}
                  receptionist@glosindo.com / Recep123!
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginPage;