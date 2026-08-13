import React from 'react';

const Card = ({ children, className = '', hover = false, padding = 'p-6' }) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200/80 shadow-sm 
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300' : ''}
        ${padding}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`pb-4 border-b border-slate-100 mb-4 ${className}`}>
    {children}
  </div>
);

export default Card;
