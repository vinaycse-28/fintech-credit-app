import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight,
  BrainCircuit,
  Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STAGES = [
  { id: 1, title: 'Checking data quality', detail: 'Validating chronological order, date formatting, and row completeness' },
  { id: 2, title: 'Saving transactions', detail: 'Indexing ledger records into analytical ledger cache' },
  { id: 3, title: 'Calculating revenue', detail: 'Aggregating credit transactions and monthly run-rates' },
  { id: 4, title: 'Calculating expenses', detail: 'Analyzing debit outgoings and statistical standard deviation' },
  { id: 5, title: 'Calculating cash flow', detail: 'Determining positive vs. negative months and net operating margins' },
  { id: 6, title: 'Analyzing transaction behaviour', detail: 'Evaluating average ticket sizes and frequency patterns' },
  { id: 7, title: 'Checking seasonality', detail: 'Identifying recurring monthly peaks and lean cycle variations' },
  { id: 8, title: 'Analyzing payment mix', detail: 'Categorizing digital UPI, Bank Transfers, and Cash volume' },
  { id: 9, title: 'Checking financial story consistency', detail: 'Comparing self-declared turnover with verified ledger inflows' },
  { id: 10, title: 'Checking cross-signal consistency', detail: 'Verifying alignment between revenue growth and cash flow trends' },
  { id: 11, title: 'Calculating creditworthiness signal', detail: 'Synthesizing 6 behavioral pillars into explainable 0–100 score' },
  { id: 12, title: 'Generating warnings and explanations', detail: 'Synthesizing positive drivers, negative drags, and operational alerts' },
];

export default function ProcessingScreen({ onComplete }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Progress each step sequentially
    const stepInterval = setInterval(() => {
      setCurrentStageIndex(prev => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setIsFinished(true);
          // Trigger confetti celebration
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch (e) {}

          // Transition to dashboard after brief celebration
          setTimeout(() => {
            onComplete();
          }, 1000);
          return prev;
        }
      });
    }, 450); // ~5.4 seconds total for a snappy, realistic feeling

    return () => clearInterval(stepInterval);
  }, [onComplete]);

  const progressPercent = Math.round(((currentStageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-8 relative overflow-hidden backdrop-blur">
        
        {/* Top ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-4 animate-pulse">
            <BrainCircuit className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Synthesizing Creditworthiness Signal
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
            Executing deterministic financial behavior analytics, data hygiene checks, and cross-signal triangulation.
          </p>

          {/* Overall Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span>Stage {currentStageIndex + 1} of {STAGES.length}</span>
              <span className="text-blue-600 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stages Checklist List */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const isPending = idx > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                  isCurrent 
                    ? 'bg-blue-50/80 border-blue-200 shadow-2xs' 
                    : isCompleted
                      ? 'bg-slate-50/50 border-slate-100 text-slate-700'
                      : 'border-transparent text-slate-300 opacity-60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {stage.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 animate-pulse">
                        Evaluating...
                      </span>
                    )}
                  </div>
                  {isCurrent && (
                    <p className="text-[11px] text-blue-600/80 mt-0.5 animate-fade-in">
                      {stage.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with skip option for judges */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Zero black-box neural networks &bull; 100% deterministic rules
          </span>
          <button
            onClick={onComplete}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Skip Animation
          </button>
        </div>

      </div>
    </div>
  );
}
