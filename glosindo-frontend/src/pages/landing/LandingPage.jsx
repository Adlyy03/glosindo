import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ScanFace,
  QrCode,
  UserCheck,
  BookOpen,
  Activity,
  FileText,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
  Menu,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  UserPlus,
  LogIn,
  Eye,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { LOGO as glosindoLogo, APP_NAME, APP_FULL_NAME } from '../../constants';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTabMockup, setActiveTabMockup] = useState('kiosk'); // 'kiosk' | 'dashboard'
  const [activeSection, setActiveSection] = useState('beranda');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  // Hero carousel slides cycling through key features
  const heroSlides = [
    {
      id: 'overview',
      badge: 'Sistem Buku Tamu Digital',
      badgeIcon: Sparkles,
      prefix: 'Kelola Kunjungan dengan ',
      highlight: 'Lebih Mudah dan Modern.',
      desc: 'Sistem Buku Tamu Digital Glosindo membantu perusahaan mengelola data pengunjung secara praktis, cepat, dan terorganisir melalui teknologi digital.',
      mockupTab: 'kiosk',
    },
    {
      id: 'face-recognition',
      badge: 'AI Biometrik Presisi',
      badgeIcon: ScanFace,
      prefix: 'Identifikasi Tamu dengan ',
      highlight: 'Pengenalan Wajah AI.',
      desc: 'Verifikasi biometrik kilat kurang dari 1 detik untuk pengunjung terdaftar tanpa perlu mengantre di meja resepsionis dengan akurasi presisi 99.8%.',
      mockupTab: 'kiosk',
    },
    {
      id: 'qr-code',
      badge: 'Check-in Mandiri Praktis',
      badgeIcon: QrCode,
      prefix: 'Check-in Cepat Mandiri dengan ',
      highlight: 'Pemindaian QR Code.',
      desc: 'Cukup tunjukkan kode QR tanda masuk pengunjung ke kamera layar kiosk untuk konfirmasi kedatangan instan tanpa hambatan administrasi.',
      mockupTab: 'kiosk',
    },
    {
      id: 'monitoring',
      badge: 'Visibilitas Tamu Terpadu',
      badgeIcon: Activity,
      prefix: 'Pantau Kehadiran dengan ',
      highlight: 'Monitoring Real-Time.',
      desc: 'Memudahkan petugas resepsionis & keamanan memantau data tamu aktif, waktu masuk, serta pihak yang dituju secara langsung dalam satu dasbor.',
      mockupTab: 'dashboard',
    },
    {
      id: 'reports',
      badge: '100% Bebas Kertas (Paperless)',
      badgeIcon: FileText,
      prefix: 'Kelola Rekapitulasi dengan ',
      highlight: 'Laporan Digital Terpadu.',
      desc: 'Tinggalkan buku catatan fisik yang rawan hilang dengan arsip data kunjungan terenkripsi yang siap diekspor ke Excel dan PDF untuk kebutuhan audit.',
      mockupTab: 'dashboard',
    },
  ];

  // Auto-play timer for hero text slider: 3 detik (3000 ms), berjalan otomatis tanpa terhenti mouse
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection(1);
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Sync interactive mockup tab with active slide
  useEffect(() => {
    if (heroSlides[currentSlide]) {
      setActiveTabMockup(heroSlides[currentSlide].mockupTab);
    }
  }, [currentSlide]);

  const nextSlide = () => {
    setSlideDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setSlideDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToSlide = (idx) => {
    setSlideDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  // Scroll listener for sticky navbar & active section spy
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ['beranda', 'tentang', 'fitur', 'cara-kerja', 'keunggulan', 'kontak'];
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const navLinks = [
    { name: 'Beranda', id: 'beranda' },
    { name: 'Tentang Sistem', id: 'tentang' },
    { name: 'Fitur Unggulan', id: 'fitur' },
    { name: 'Cara Kerja', id: 'cara-kerja' },
    { name: 'Keunggulan', id: 'keunggulan' },
    { name: 'Kontak', id: 'kontak' },
  ];

  const features = [
    {
      icon: ScanFace,
      title: 'Face Recognition',
      desc: 'Proses identifikasi pengunjung menggunakan teknologi pengenalan wajah secara instan dan akurat.',
      badge: 'AI Biometrik',
      color: 'from-blue-600 to-cyan-500',
    },
    {
      icon: QrCode,
      title: 'QR Code Check-in',
      desc: 'Mempermudah proses pencatatan kunjungan menggunakan QR Code tanda masuk tanpa perlu antre.',
      badge: 'Cepat & Praktis',
      color: 'from-emerald-600 to-teal-500',
    },
    {
      icon: UserCheck,
      title: 'Manual Check-in',
      desc: 'Mendukung pencatatan pengunjung secara manual untuk tamu tanpa janji temu dengan verifikasi staf.',
      badge: 'Fleksibel',
      color: 'from-indigo-600 to-blue-500',
    },
    {
      icon: BookOpen,
      title: 'Digital Guestbook',
      desc: 'Semua data kunjungan tersimpan secara digital, aman, dan terorganisir rapi dalam database terpusat.',
      badge: 'Paperless',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Activity,
      title: 'Monitoring Pengunjung',
      desc: 'Memudahkan petugas memantau aktivitas dan status kehadiran tamu di lingkungan kantor secara real-time.',
      badge: 'Real-Time',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: FileText,
      title: 'Laporan Kunjungan',
      desc: 'Menyediakan rekapitulasi data kunjungan komprehensif (Excel & PDF) untuk kebutuhan audit dan administrasi.',
      badge: 'Analitik & Ekspor',
      color: 'from-violet-600 to-purple-500',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Pengunjung Melakukan Registrasi',
      desc: 'Tamu mendaftar mandiri via layar kiosk di lobi atau registrasi awal via link online sebelum hari kunjungan.',
      icon: UserPlus,
    },
    {
      step: '02',
      title: 'Verifikasi atau Check-In',
      desc: 'Pengunjung melakukan verifikasi kilat menggunakan kamera pemindai wajah (face scan) atau pemindaian QR Code.',
      icon: ScanFace,
    },
    {
      step: '03',
      title: 'Petugas Memantau Data Kunjungan',
      desc: 'Petugas resepsionis & keamanan memantau data tamu aktif, waktu masuk, dan pihak perusahaan yang dituju.',
      icon: Activity,
    },
    {
      step: '04',
      title: 'Check-Out & Data Tersimpan',
      desc: 'Pengunjung melakukan check-out saat selesai, seluruh riwayat tercatat permanen dan terenkripsi aman.',
      icon: ShieldCheck,
    },
  ];

  const benefits = [
    {
      title: 'Proses Administrasi Lebih Praktis',
      desc: 'Menghilangkan antrean tamu di meja resepsionis dan menggantikan buku fisik yang rawan terselip.',
    },
    {
      title: 'Data Pengunjung Lebih Terorganisir',
      desc: 'Pencarian riwayat kunjungan dalam hitungan detik dengan filter tanggal, instansi, maupun nama tamu.',
    },
    {
      title: 'Mengurangi Pencatatan Manual',
      desc: 'Meminimalkan kesalahan pengetikan atau tulisan tangan yang sulit dibaca oleh petugas front office.',
    },
    {
      title: 'Mempermudah Monitoring Kunjungan',
      desc: 'Visibilitas realtime terhadap jumlah tamu yang saat ini sedang berada di dalam gedung (active visitors).',
    },
    {
      title: 'Mendukung Keamanan & Ketertiban Perusahaan',
      desc: 'Dilengkapi foto bukti kedatangan, identitas terverifikasi, dan log audit untuk kepatuhan SOP perusahaan.',
    },
  ];

  // Motion animation variants - ultra smooth & performant
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.12,
            delayChildren: 0.05,
          },
    },
  };

  const fadeUpVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const slideLeftVariant = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -35 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const slideRightVariant = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 35 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.65,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const scaleInVariant = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const textSlideVariants = {
    enter: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 240, damping: 24 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -80 : 80,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 240, damping: 24 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-cyan selection:text-white relative overflow-x-hidden">
      {/* Ambient Moving Decorative Glow Backgrounds */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: [1, 1.05, 1],
                opacity: [0.12, 0.18, 0.12],
              }
        }
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-600 via-cyan-400 to-transparent blur-3xl pointer-events-none -z-10"
      />
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                y: [0, -15, 0],
                opacity: [0.1, 0.16, 0.1],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-1/3 -right-40 w-96 h-96 bg-cyan-500 rounded-full blur-3xl pointer-events-none -z-10"
      />
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                y: [0, 15, 0],
                opacity: [0.1, 0.15, 0.1],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-1/4 -left-40 w-96 h-96 bg-blue-600 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* ========================================================= */}
      {/* 1. NAVBAR                                                 */}
      {/* ========================================================= */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/90 py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white p-1.5 shadow-xs border border-slate-200/90 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src={glosindoLogo} alt="GLOSINDO Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-brand-navy">
                  GLOSINDO
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/70">
                  Guestbook
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block leading-none -mt-0.5 font-medium">
                Digital Kiosk & Visitor Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Menu with Active Scroll Indicator */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
            {navLinks.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-brand-navy bg-cyan-50 font-bold border border-cyan-200/70 shadow-2xs'
                      : 'text-slate-600 hover:text-brand-navy hover:bg-slate-100/80'
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-blue-900 shadow-sm hover:shadow-md transition-all active:scale-98"
              >
                <span>Dashboard ({user?.name?.split(' ')[0] || 'User'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-navy hover:bg-blue-900 shadow-sm hover:shadow-md transition-all active:scale-98 group cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Masuk</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl"
          >
            <div className="flex flex-col gap-1.5 mb-4">
              {navLinks.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    activeSection === item.id
                      ? 'bg-cyan-50 text-brand-navy font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-brand-navy'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-brand-navy hover:bg-blue-900 flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-brand-navy hover:bg-blue-900 flex items-center justify-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4 text-cyan-400" />
                  <span>Masuk</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section id="beranda" className="pt-32 sm:pt-36 lg:pt-40 pb-20 lg:pb-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content Grid */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & CTA with Stagger Reveal */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              {/* Sliding Headline + Concise Feature Carousel (3 Detik Auto-Slide) */}
              <div
                className="relative min-h-[300px] sm:min-h-[250px] lg:min-h-[270px] overflow-hidden flex flex-col justify-between"
              >
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={currentSlide}
                    custom={slideDirection}
                    variants={textSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    {/* SaaS Pill Tag */}
                    <div>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-bold text-slate-700">
                        <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span>{heroSlides[currentSlide].badge}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-brand-cyan font-extrabold flex items-center gap-1.5">
                          {(() => {
                            const SlideIcon = heroSlides[currentSlide].badgeIcon;
                            return <SlideIcon className="w-3.5 h-3.5" />;
                          })()}
                          <span>Fitur Unggulan</span>
                        </span>
                      </div>
                    </div>

                    {/* Dynamic Sliding Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                      {heroSlides[currentSlide].prefix}
                      <span className="bg-gradient-to-r from-blue-700 via-brand-navy to-cyan-600 bg-clip-text text-transparent">
                        {heroSlides[currentSlide].highlight}
                      </span>
                    </h1>

                    {/* Dynamic Sliding Concise Description */}
                    <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                      {heroSlides[currentSlide].desc}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* 3-Second Active Auto-Progress Bar */}
                <div className="w-full max-w-md mx-auto lg:mx-0 h-1 bg-slate-200/80 rounded-full overflow-hidden my-2">
                  <motion.div
                    key={currentSlide}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.0, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  />
                </div>

                {/* Slide Navigation Controls & Interactive Dots */}
                <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-full px-3 py-1.5 shadow-2xs">
                    {heroSlides.map((slide, idx) => {
                      const isActive = currentSlide === idx;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => goToSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                            isActive
                              ? 'w-7 bg-brand-navy shadow-xs'
                              : 'w-2 bg-slate-300 hover:bg-slate-400'
                          }`}
                          aria-label={`Slide ${idx + 1}: ${slide.highlight}`}
                        />
                      );
                    })}
                  </div>

                  {/* Prev / Next Arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200/90 text-slate-600 hover:text-brand-navy hover:bg-slate-100 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                      aria-label="Slide sebelumnya"
                      title="Slide sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200/90 text-slate-600 hover:text-brand-navy hover:bg-slate-100 flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
                      aria-label="Slide berikutnya"
                      title="Slide berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 font-semibold pl-1 select-none">
                    0{currentSlide + 1} / 0{heroSlides.length}
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeUpVariant}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
              >
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-navy hover:bg-blue-900 active:scale-98 text-white font-bold text-sm shadow-lg shadow-blue-950/20 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <LogIn className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span>{isAuthenticated ? "Dashboard" : "Masuk"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#fitur"
                  onClick={(e) => scrollToSection(e, 'fitur')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 active:scale-98 text-slate-700 hover:text-slate-900 font-bold text-sm border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Pelajari Fitur</span>
                </a>
              </motion.div>

              {/* Value Metrics / Trust Badges */}
              <motion.div
                variants={fadeUpVariant}
                className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-left"
              >
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">&lt; 1 Detik</div>
                  <div className="text-[11px] text-slate-500 font-medium">Verifikasi Cepat</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-600">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Bebas Kertas (Paperless)</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600">Dual-Mode</div>
                  <div className="text-[11px] text-slate-500 font-medium">Kiosk & Resepsionis</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: High-Fidelity Interactive Mockup with Floating Animation */}
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 40, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-6 relative"
            >
              {/* Backglow */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 rounded-3xl blur-xl opacity-20 -z-10" />

              {/* Floating Wrapper */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [-3, 5, -3],
                      }
                }
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {/* Main SaaS Window Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
                  {/* Window Chrome Header */}
                  <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="px-3 py-1 rounded-md bg-slate-900 text-[10px] font-mono text-slate-400 border border-slate-800">
                      tamu.glosindo.net.id
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>Live Biometric</span>
                    </div>
                  </div>

                  {/* Sub-Tabs Selector inside Mockup */}
                  <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTabMockup('kiosk')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTabMockup === 'kiosk'
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Mode Kiosk Wajah
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTabMockup('dashboard')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTabMockup === 'dashboard'
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dashboard Pemantauan
                    </button>
                  </div>

                  {/* Mockup Dynamic Body */}
                  {activeTabMockup === 'kiosk' ? (
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Simulated Biometric Camera Card */}
                      <div className="relative aspect-16/10 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-4">
                        {/* Grid background lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

                        {/* Animated Scan Line */}
                        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan z-10 shadow-[0_0_15px_#06b6d4]" />

                        {/* Face Target Frame */}
                        <div className="relative z-10 w-28 sm:w-36 h-28 sm:h-36 rounded-full border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.35)] flex items-center justify-center animate-pulse">
                          <ScanFace className="w-12 sm:w-16 h-12 sm:h-16 text-cyan-300" />
                          <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                          <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                          <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400 rounded-br" />
                        </div>

                        {/* Overlay Matched Notification */}
                        <div className="absolute bottom-3 inset-x-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-2.5 flex items-center justify-between text-left">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                                Wajah Terverifikasi (99.8%)
                              </div>
                              <div className="text-xs font-bold text-white">Budi Santoso, S.T.</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            CHECK-IN
                          </span>
                        </div>
                      </div>

                      {/* Quick Info bar */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span>Keperluan: <strong className="text-slate-200">Meeting Proyek</strong></span>
                        <span>Menemui: <strong className="text-slate-200">Dept. IT Glosindo</strong></span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Simulated KPI Cards */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block font-medium">Total Hari Ini</span>
                          <span className="text-lg font-black text-white">48</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30">
                          <span className="text-[10px] text-cyan-400 block font-medium">Tamu Aktif</span>
                          <span className="text-lg font-black text-cyan-400">12</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] text-emerald-400 block font-medium">Check-Out</span>
                          <span className="text-lg font-black text-emerald-400">36</span>
                        </div>
                      </div>

                      {/* Mini Guest Table Preview */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden text-xs">
                        <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800 font-bold text-slate-300 flex justify-between">
                          <span>Daftar Kunjungan Terbaru</span>
                          <span className="text-emerald-400 text-[10px]">Real-Time Sync</span>
                        </div>
                        <div className="divide-y divide-slate-850">
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white">Budi Santoso</div>
                              <div className="text-[10px] text-slate-400">PT Telkom Indonesia</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 text-[10px] font-bold">
                              Meeting
                            </span>
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white">Siti Rahmawati</div>
                              <div className="text-[10px] text-slate-400">Vendor Hardware</div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] font-bold">
                              Delivery
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mockup Footer */}
                  <div className="px-5 py-3 bg-slate-950 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Enkripsi Data SHA-256
                    </span>
                    <Link to={isAuthenticated ? "/dashboard" : "/login"} className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                      {isAuthenticated ? "Dashboard" : "Masuk"} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Floating Pill Accent 1 */}
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: [0, -8, 0],
                        }
                  }
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-5 -left-4 sm:-left-6 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-xl hidden sm:flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <ScanFace className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Akurasi AI Biometrik</div>
                    <div className="text-[11px] text-slate-500 font-medium">99.8% Deteksi Presisi</div>
                  </div>
                </motion.div>

                {/* Floating Pill Accent 2 */}
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: [0, 8, 0],
                        }
                  }
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -top-4 -right-4 sm:-right-6 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-xl hidden sm:flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Check-in Instan</div>
                    <div className="text-[11px] text-slate-500 font-medium">Rata-rata 0.8 Detik</div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. TENTANG SISTEM SECTION                                 */}
      {/* ========================================================= */}
      <section id="tentang" className="py-20 lg:py-28 bg-white border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Left Preview with Slide Left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={slideLeftVariant}
              className="lg:col-span-5 order-2 lg:order-1"
            >
              <div className="relative rounded-3xl bg-gradient-to-tr from-brand-navy to-blue-800 p-8 text-white shadow-xl overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6 text-cyan-300" />
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  Standar Keamanan Kantor Pintar
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed mb-6 font-normal">
                  Menggabungkan kemudahan antarmuka kiosk mandiri untuk pengunjung dengan kontrol penuh di meja resepsionis untuk staf keamanan.
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                    <span>Penyimpanan Biometrik Terenkripsi Aman</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                    <span>Otomatis Sinkronisasi Check-in & Check-out</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                    <span>Mendukung Skenario Tamu Biasa & Event Khusus</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">Dikembangkan oleh</div>
                    <div className="text-sm font-bold text-white">PT GLOSINDO</div>
                  </div>
                  <Link
                    to={isAuthenticated ? "/dashboard" : "/login"}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors"
                  >
                    {isAuthenticated ? "Dashboard" : "Masuk"}
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Right Text Content with Stagger Fade Up */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
              className="lg:col-span-7 order-1 lg:order-2 space-y-6"
            >
              <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-navy border border-blue-200/80 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Tentang Sistem</span>
              </motion.div>

              <motion.h2
                variants={fadeUpVariant}
                className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight"
              >
                Kenali Sistem Buku Tamu Glosindo
              </motion.h2>

              <motion.p
                variants={fadeUpVariant}
                className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
              >
                Buku Tamu Glosindo merupakan sistem digital yang dirancang untuk mempermudah proses pencatatan, pengelolaan, dan pemantauan kunjungan tamu di lingkungan perusahaan.
              </motion.p>

              <motion.div variants={fadeUpVariant} className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Efisiensi Tanpa Antrean</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pengunjung dapat melakukan pencatatan mandiri melalui kiosk layar sentuh dalam waktu kurang dari satu menit.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100/80 text-cyan-700 flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Transparansi & Akurasi</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Setiap kedatangan tamu memiliki catatan waktu presisi, foto bukti, dan kontak pihak yang dikunjungi.
                  </p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FITUR UNGGULAN SECTION                                 */}
      {/* ========================================================= */}
      <section id="fitur" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with Fade Up */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200/80 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              <span>Fitur Unggulan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Solusi Menyeluruh untuk Manajemen Tamu
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Didesain dengan teknologi modern untuk memberikan pengalaman kedatangan yang profesional bagi tamu dan memudahkan operasional staf.
            </p>
          </motion.div>

          {/* Features 6-Grid with Stagger Animation */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={scaleInVariant}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -6,
                          transition: { duration: 0.25 },
                        }
                  }
                  className="group p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Icon container */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-brand-navy group-hover:bg-brand-navy group-hover:text-cyan-400 group-hover:border-brand-navy group-hover:scale-105 transition-all duration-300 shadow-2xs">
                        <Icon className="w-6 h-6 group-hover:rotate-3 transition-transform duration-300" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-cyan-50 group-hover:text-cyan-700 transition-colors">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-navy transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {feature.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-cyan-600 group-hover:text-brand-navy transition-colors">
                    <span>Fitur Tersedia</span>
                    <Check className="w-3.5 h-3.5 ml-1 text-emerald-500" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CARA KERJA SISTEM SECTION                              */}
      {/* ========================================================= */}
      <section id="cara-kerja" className="py-20 lg:py-28 bg-white border-y border-slate-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUpVariant}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Cara Kerja Sistem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Alur Penggunaan dalam 4 Langkah Praktis
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Proses alur pencatatan dari saat pengunjung tiba hingga check-out berlangsung tertib, efisien, dan transparan.
            </p>
          </motion.div>

          {/* 4 Steps Grid with Stagger Children */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative"
          >
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUpVariant}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          y: -6,
                          transition: { duration: 0.25 },
                        }
                  }
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:bg-white hover:shadow-lg transition-all duration-300 relative group"
                >
                  <div className="space-y-4">
                    {/* Top Number & Icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-300 group-hover:text-brand-navy transition-colors font-mono">
                        {step.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-navy group-hover:scale-110 group-hover:border-brand-navy transition-all duration-300 shadow-2xs">
                        <StepIcon className="w-5 h-5 text-cyan-600" />
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>Langkah ke-{idx + 1}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. KEUNGGULAN SISTEM SECTION                              */}
      {/* ========================================================= */}
      <section id="keunggulan" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Header with Slide Left */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={slideLeftVariant}
              className="lg:col-span-5 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nilai Tambah Perusahaan</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Keunggulan Nyata untuk Lingkungan Kerja Anda
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Buku Tamu Glosindo bukan sekadar formulir digital, melainkan sarana peningkatan citra profesional kantor dan penguatan sistem keamanan gedung.
              </p>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy text-white flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Produktivitas Meningkat</h4>
                    <p className="text-xs text-slate-500">Resepsionis fokus melayani tamu VIP tanpa beban administrasi kertas.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Benefits List with Stagger Children */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={containerVariants}
              className="lg:col-span-7 space-y-4"
            >
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  variants={slideRightVariant}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : {
                          x: 6,
                          transition: { duration: 0.2 },
                        }
                  }
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-cyan-200 transition-all duration-200 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200/80 flex items-center justify-center text-cyan-700 flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900">
                      {benefit.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. CALL TO ACTION (CTA) SECTION                           */}
      {/* ========================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={scaleInVariant}
          className="max-w-6xl mx-auto"
        >
          <div className="rounded-3xl bg-gradient-to-br from-brand-navy via-blue-900 to-slate-950 p-8 sm:p-12 lg:p-16 text-white text-center shadow-2xl relative overflow-hidden">
            {/* Background Decorative Rings with Subtle Scale Animation */}
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: [1, 1.15, 1],
                      opacity: [0.1, 0.18, 0.1],
                    }
              }
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-400 blur-3xl pointer-events-none"
            />
            <motion.div
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: [1, 1.12, 1],
                      opacity: [0.15, 0.25, 0.15],
                    }
              }
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600 blur-3xl pointer-events-none"
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Modernisasi Buku Tamu Sekarang
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Mulai Transformasi Buku Tamu Menjadi Digital.
              </h2>

              <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
                Optimalkan pengelolaan kunjungan dengan sistem Buku Tamu Glosindo. Nikmati kemudahan pencatatan biometrik dan monitoring terpadu.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-sm shadow-xl transition-all active:scale-98 cursor-pointer group"
                >
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{isAuthenticated ? "Dashboard" : "Masuk"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="pt-6 text-xs text-blue-200/80 font-medium">
                Solusi Perusahaan Terintegrasi • Aman • Andal
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* 8. FOOTER                                                 */}
      {/* ========================================================= */}
      <footer id="kontak" className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-900">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white p-1.5 flex items-center justify-center">
                  <img src={glosindoLogo} alt="GLOSINDO" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-extrabold text-white text-base tracking-tight block">
                    {APP_NAME}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {APP_FULL_NAME}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
                Sistem Buku Tamu Digital Glosindo menghadirkan pengelolaan kunjungan modern berbasis biometrik wajah dan kode QR untuk efisiensi, akurasi, dan ketertiban kantor perusahaan.
              </p>

              <div className="text-xs text-slate-400 space-y-1 pt-1">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Sistem Siap Operasional (Production Ready)</span>
                </div>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Navigasi Website
              </h4>
              <ul className="space-y-2 text-xs">
                {navLinks.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => scrollToSection(e, item.id)}
                      className="hover:text-cyan-400 transition-colors cursor-pointer"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/login" className="hover:text-cyan-400 transition-colors">
                    Masuk
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact & Company Info */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Informasi Kontak
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>PT Global Media Pratama Solusindo (GLOSINDO), Indonesia</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>info@glosindo.com / support@glosindo.com</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Layanan Pelanggan & Helpdesk Glosindo</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              &copy; {new Date().getFullYear()} PT Global Media Pratama Solusindo. All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-slate-400">Buku Tamu Digital v2.4</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Server Aktif
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
