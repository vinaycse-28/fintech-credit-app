import React from 'react';
import { XCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Comparison({ onSelectDemo }) {
  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Paradigm Shift</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            From Credit-Invisible to Assessable
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Why traditional bureaus fail small businesses, and how CreditBridge makes them evaluable for human lenders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Traditional Credit Assessment */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <XCircle className="w-5 h-5" />
                <span>Traditional Bureau (CIBIL / Experian)</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                Thin-File Rejection
              </span>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-600">
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <p className="font-semibold text-rose-900">Evaluation Input:</p>
                <p className="text-slate-600 mt-1">Requires 3–5 years of prior bank loans, credit cards, or formal institutional collateral.</p>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <p className="font-semibold text-rose-900">Treatment of Thin-File MSMEs:</p>
                <p className="text-slate-600 mt-1">Classified as <strong>Score 0</strong> or <em>"Insufficient Credit Information"</em> despite thriving daily sales.</p>
              </div>

              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <p className="font-semibold text-rose-900">Final Outcome:</p>
                <p className="text-rose-700 font-bold mt-1">Instant Automated Rejection or forced borrowing from predatory informal lenders at 36%+ interest.</p>
              </div>
            </div>
          </div>

          {/* CreditBridge Paradigm */}
          <div className="bg-white rounded-2xl border border-emerald-300 p-6 shadow-md shadow-emerald-500/5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>CreditBridge Financial Intelligence</span>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
                Assessable Cockpit
              </span>
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <p className="font-semibold text-emerald-950">Evaluation Input:</p>
                <p className="text-slate-700 mt-1">Granular bank transactions, UPI cash inflows, expense discipline, and payment regularity.</p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <p className="font-semibold text-emerald-950">Treatment of Thin-File MSMEs:</p>
                <p className="text-slate-700 mt-1">Verifies data trust, tests declared turnover against verified ledger reality, and surfaces cash buffers.</p>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <p className="font-semibold text-emerald-950">Final Outcome:</p>
                <p className="text-emerald-800 font-bold mt-1">Generates transparent 0–100 Creditworthiness Signal + "Why This Signal?" explanations for human underwriter review.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
