import React from 'react';

const variantClasses = {
  primary: 'bg-brand-navy hover:bg-brand-navy-light text-white shadow-md hover:shadow-lg focus:ring-brand-cyan/50',
  secondary: 'bg-brand-cyan hover:bg-brand-cyan-light text-white shadow-md hover:shadow-lg focus:ring-brand-cyan/50',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg focus:ring-emerald-500/50',
  outline: 'border-2 border-slate-300 hover:border-brand-navy text-slate-700 hover:text-brand-navy bg-white hover:bg-slate-50 focus:ring-brand-navy/30',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg focus:ring-rose-500/50',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs min-h-[36px] rounded-lg',
  md: 'px-4 py-2.5 text-sm min-h-[44px] rounded-xl font-semibold',
  lg: 'px-6 py-3.5 text-base min-h-[52px] rounded-xl font-bold tracking-wide',
  kiosk: 'px-8 py-4 text-lg min-h-[58px] rounded-2xl font-bold tracking-wide shadow-xl',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed
        active:scale-[0.98] select-none
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 opacity-90" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Memproses...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;
