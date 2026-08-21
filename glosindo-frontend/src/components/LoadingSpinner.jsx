import { Loader2 } from 'lucide-react';

/**
 * Reusable loading spinner component
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Memuat...', 
  fullscreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <p className="text-sm text-slate-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Loading overlay for sections
 */
export const LoadingOverlay = ({ loading, children }) => {
  if (!loading) return children;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/50">
        <LoadingSpinner size="md" text="" />
      </div>
    </div>
  );
};

/**
 * Loading skeleton for tables
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-slate-200 rounded mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 bg-slate-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Loading card skeleton
 */
export const CardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      ))}
    </>
  );
};

/**
 * Inline loading spinner for buttons
 */
export const ButtonSpinner = ({ className = '' }) => {
  return (
    <Loader2 className={`w-4 h-4 animate-spin ${className}`} />
  );
};

export default LoadingSpinner;
