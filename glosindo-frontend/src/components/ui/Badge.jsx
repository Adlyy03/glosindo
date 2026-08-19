import React from 'react';

const badgeVariants = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  navy: 'bg-blue-50 text-brand-navy border-blue-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  cyan: 'bg-cyan-50 text-brand-cyan-dark border-cyan-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  white: 'bg-white/20 text-white border-white/30',
};

const Badge = ({ children, variant = 'navy', dot = false, className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase
        ${badgeVariants[variant] || badgeVariants.navy}
        ${className}
      `}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
};

export default Badge;
