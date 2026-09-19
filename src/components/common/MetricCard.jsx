import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  iconColor = 'blue',
  className = '',
  onClick
}) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
  };

  const selectedColor = colorMap[iconColor] || colorMap.blue;

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${selectedColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        
        {(subtitle || change) && (
          <div className="mt-1.5 flex items-center gap-2 text-xs">
            {change && (
              <span className={`inline-flex items-center font-medium ${
                changeType === 'positive' 
                  ? 'text-emerald-600' 
                  : changeType === 'negative' 
                    ? 'text-rose-600' 
                    : 'text-slate-500'
              }`}>
                {changeType === 'positive' && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
                {changeType === 'negative' && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {changeType === 'neutral' && <Minus className="w-3.5 h-3.5 mr-0.5" />}
                {change}
              </span>
            )}
            {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
