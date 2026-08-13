import React from 'react';

const colorMap = {
  blue: {
    gradient: 'from-brand-navy to-slate-900',
    iconBg: 'bg-white/10 border-white/20 text-brand-cyan-light',
    glow: 'shadow-brand-navy/20',
  },
  green: {
    gradient: 'from-emerald-700 to-emerald-900',
    iconBg: 'bg-white/10 border-white/20 text-emerald-300',
    glow: 'shadow-emerald-900/20',
  },
  cyan: {
    gradient: 'from-brand-cyan-dark to-slate-900',
    iconBg: 'bg-white/10 border-white/20 text-cyan-200',
    glow: 'shadow-brand-cyan/20',
  },
  purple: {
    gradient: 'from-violet-700 to-slate-900',
    iconBg: 'bg-white/10 border-white/20 text-violet-300',
    glow: 'shadow-violet-900/20',
  },
  amber: {
    gradient: 'from-amber-600 to-amber-900',
    iconBg: 'bg-white/10 border-white/20 text-amber-200',
    glow: 'shadow-amber-900/20',
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', loading = false }) => {
  const s = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-gradient-to-br ${s.gradient} text-white rounded-3xl p-6 shadow-xl ${s.glow} border border-white/10 relative overflow-hidden group select-none transition-all duration-200 hover:-translate-y-1`}>
      {/* Decorative Orbs */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none group-hover:scale-110 transition-transform" />

      <div className="flex items-center justify-between relative z-10 mb-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-2xl border backdrop-blur-md ${s.iconBg} shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="h-9 w-24 bg-white/20 animate-pulse rounded-xl my-1" />
        ) : (
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
            {value ?? '0'}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-300 font-medium mt-2 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
