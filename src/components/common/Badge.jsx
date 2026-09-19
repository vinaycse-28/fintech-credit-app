import React from 'react';

const BADGE_STYLES = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/70',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/70',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/70',
  rose: 'bg-rose-50 text-rose-700 border-rose-200/70',
  info: 'bg-blue-50 text-blue-700 border-blue-200/70',
  blue: 'bg-blue-50 text-blue-700 border-blue-200/70',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200'
};

const DOT_STYLES = {
  good: 'bg-emerald-500',
  emerald: 'bg-emerald-500',
  warning: 'bg-amber-500',
  amber: 'bg-amber-500',
  danger: 'bg-rose-500',
  rose: 'bg-rose-500',
  info: 'bg-blue-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  neutral: 'bg-slate-400'
};

export default function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'md', 
  withDot = true,
  className = '' 
}) {
  const style = BADGE_STYLES[variant] || BADGE_STYLES.neutral;
  const dotStyle = DOT_STYLES[variant] || DOT_STYLES.neutral;
  
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
      ? 'text-sm px-3.5 py-1' 
      : 'text-xs px-2.5 py-1 font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${style} ${sizeClasses} ${className}`}>
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />}
      {children}
    </span>
  );
}
