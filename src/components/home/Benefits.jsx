import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle, 
  Zap, 
  Scale, 
  Search 
} from 'lucide-react';

export default function Benefits({ onSelectDemo }) {
  const benefits = [
    {
      number: "01",
      title: "Financial Analysis",
      icon: TrendingUp,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
      description: "Aggregates monthly inflows and outflows to evaluate net cash margins, run rates, expense ratios, and identifies statistical expense spikes.",
      features: [
        "Monthly revenue & debit run-rate",
        "Expense ratio health monitoring",
        "Positive cash-flow month ratios"
      ]
    },
    {
      number: "02",
      title: "Transaction Behaviour",
      icon: Activity,
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      description: "Analyzes operational regularity beyond totals: average ticket size, transaction cadence, and automatically flags dormancy gaps exceeding 14 days.",
      features: [
        "Ticket size distribution & frequency",
        "Automated >14 day dormancy gap alerts",
        "Digital vs. cash payment breakdown"
      ]
    },
    {
      number: "03",
      title: "Trust & Consistency ⭐",
      icon: ShieldCheck,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: "Verifies internal data hygiene before scoring. Checks chronological dates, duplicate rows, and tests whether declared turnover matches verified inflows.",
      features: [
        "Duplicate row & ID anomaly scanner",
        "Self-declared vs observed revenue meter",
        "Cross-signal growth trajectory alignment"
      ]
    },
    {
      number: "04",
      title: "Explainable Creditworthiness",
      icon: HelpCircle,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      description: "Replaces black-box automated denials with a transparent 0–100 signal, breaking down the exact positive drivers, negative drags, and operational risks.",
      features: [
        "Documented 6-pillar weighted formula",
        "Dynamic positive & negative drivers",
        "Comprehensive underwriter audit trail"
      ]
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">The 4 Assessment Pillars</h2>
          <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
            How CreditBridge Evaluates Credit-Invisible MSMEs
          </p>
          <p className="mt-3 text-sm text-slate-600">
            A comprehensive, multi-dimensional methodology combining hard ledger analytics with rigorous consistency checks.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div 
                key={b.title}
                className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between hover:bg-white hover:shadow-md hover:border-slate-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${b.iconBg} shadow-2xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">{b.number}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{b.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 space-y-2">
                  {b.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-[11px] font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
