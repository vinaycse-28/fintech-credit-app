import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  HelpCircle, 
  History, 
  FileText, 
  RefreshCw,
  ChevronRight,
  Sliders,
  Landmark
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  warningCount = 0 
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'financial-analysis', label: 'Financial Analysis', icon: TrendingUp },
    { id: 'transaction-behaviour', label: 'Transaction Behaviour', icon: Activity },
    { 
      id: 'trust', 
      label: 'Data Trust & Meter', 
      icon: ShieldCheck,
      badge: warningCount > 0 ? `${warningCount} Flags` : 'Verified',
      badgeColor: warningCount > 0 ? 'amber' : 'emerald'
    },
    { 
      id: 'score', 
      label: 'Score Explanation', 
      icon: HelpCircle,
      highlight: true
    },
    { id: 'simulator', label: 'Score Simulator', icon: Sliders, badge: 'What-If', badgeColor: 'indigo' },
    { id: 'loan-readiness', label: 'Loan Readiness', icon: Landmark },
    { id: 'transactions', label: 'Transaction History', icon: History },
    { id: 'report', label: 'Credit Report', icon: FileText },
    { id: 'update-data', label: 'Update Financial Data', icon: RefreshCw },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 flex flex-col min-h-[calc(100vh-4rem)] p-4 no-print">
      {/* Underwriter Cockpit Header */}
      <div className="px-3 py-2 mb-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Cockpit Modules</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono font-bold">Pro</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          // Match both legacy IDs and router path segments
          const isActive = currentTab === item.id || 
            (item.id === 'trust' && currentTab === 'trust-consistency') ||
            (item.id === 'score' && currentTab === 'score-explanation') ||
            (item.id === 'transactions' && currentTab === 'transaction-history') ||
            (item.id === 'report' && currentTab === 'credit-report');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-50/90 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              } ${item.highlight && !isActive ? 'hover:bg-indigo-50/50' : ''}`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    item.badgeColor === 'emerald' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : item.badgeColor === 'indigo'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
