import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  BarChart2, 
  FileCheck2,
  CheckCircle2
} from 'lucide-react';
import Badge from '../common/Badge';

export default function Hero({ onStartOnboarding, onViewDemo }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/60 border-b border-slate-200/80">
      
      {/* Decorative gradient blur background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-400/10 via-indigo-500/10 to-teal-400/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2">
              <Badge variant="indigo" size="md" className="py-1 px-3">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Explainable Fintech for Credit-Invisible MSMEs</span>
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Turn business transaction data into <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">transparent financial insights</span> and creditworthiness signals.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              Over 86% of small businesses lack traditional credit bureau history. CreditBridge analyzes granular cash flow, verifies data trust, checks internal story consistency, and gives human lenders explainable intelligence to underwrite with confidence.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onStartOnboarding}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <span>Create Business Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onViewDemo}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-2xs hover:border-slate-400 transition-all"
              >
                <span>View Live Demo Cockpit</span>
              </button>
            </div>

            {/* Micro-Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Black-Box Scoring</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated Data Trust Checks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Human-in-the-Loop Architecture</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Interactive Live Preview Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              
              {/* Card Container */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 relative overflow-hidden backdrop-blur">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700">Sample Evaluation In-Progress</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">TXN_LEDGER_AUDIT</span>
                </div>

                {/* Score Widget Preview */}
                <div className="mt-5 p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">CreditBridge Signal</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-3xl font-extrabold text-slate-900">78</span>
                      <span className="text-xs font-bold text-slate-400">/ 100</span>
                    </div>
                    <div className="mt-1">
                      <Badge variant="good" size="sm">Relatively Stable Behaviour</Badge>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-emerald-500 flex items-center justify-center text-xs font-bold text-slate-700 bg-white shadow-2xs">
                    78%
                  </div>
                </div>

                {/* Mini Metric Chips */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Data Trust</span>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">High Trust (0 Duplicates)</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Story Consistency</span>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">Consistent (4.2% Var)</p>
                  </div>
                </div>

                {/* "Why This Signal" Mini Snippet */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-left">
                  <span className="text-[11px] font-bold text-slate-700">Underwriter Quick-Drivers:</span>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 bg-emerald-50/70 p-1.5 rounded">
                    <span className="font-bold">+</span> Consistent revenue across 8 consecutive months
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 bg-emerald-50/70 p-1.5 rounded">
                    <span className="font-bold">+</span> 82% verifiable UPI & digital banking receipts
                  </div>
                </div>

              </div>

              {/* Decorative shadow accent */}
              <div className="absolute -bottom-3 -right-3 w-full h-full bg-blue-600/5 rounded-2xl -z-10 border border-blue-600/10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
