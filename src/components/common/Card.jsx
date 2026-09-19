import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  action, 
  footer,
  noPadding = false 
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-sm transition-all duration-200 hover:shadow-md ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 rounded-b-xl text-xs text-slate-600">
          {footer}
        </div>
      )}
    </div>
  );
}
