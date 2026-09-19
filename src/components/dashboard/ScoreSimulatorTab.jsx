import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  AlertCircle, 
  RotateCcw, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { runScoreSimulator } from '../../services/api';

export default function ScoreSimulatorTab({ currentScore = 78, businessId }) {
  const [revenueChange, setRevenueChange] = useState(0);
  const [expenseChange, setExpenseChange] = useState(0);
  const [paymentConsistency, setPaymentConsistency] = useState(60);
  const [transactionConsistency, setTransactionConsistency] = useState(60);

  const [simResult, setSimResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const executeSimulation = async () => {
    try {
      setLoading(true);
      const res = await runScoreSimulator({
        business_id: businessId,
        revenue_change_pct: revenueChange,
        expense_change_pct: expenseChange,
        payment_consistency: paymentConsistency,
        transaction_consistency: transactionConsistency
      });
      if (res) {
        setSimResult(res);
      }
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run on change with debounce or initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSimulation();
    }, 250);
    return () => clearTimeout(timer);
  }, [revenueChange, expenseChange, paymentConsistency, transactionConsistency, businessId]);

  const handleReset = () => {
    setRevenueChange(0);
    setExpenseChange(0);
    setPaymentConsistency(60);
    setTransactionConsistency(60);
  };

  const projectedScore = simResult?.projected_score || currentScore;
  const delta = projectedScore - currentScore;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Credit Score Simulator</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                What-if behavioral modeling & prospective creditworthiness projection
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors self-start md:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* Main Grid: Sliders on Left, Score Outcome on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Form Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Simulation Variables</h3>
            <p className="text-[11px] text-slate-500">
              Adjust forward-looking parameters to project potential creditworthiness impacts.
            </p>
          </div>

          {/* Slider 1: Revenue Change */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Projected Revenue Growth</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                revenueChange > 0 ? 'bg-emerald-50 text-emerald-700' :
                revenueChange < 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {revenueChange > 0 ? `+${revenueChange}%` : `${revenueChange}%`}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={30}
              step={1}
              value={revenueChange}
              onChange={(e) => setRevenueChange(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-20% (Contraction)</span>
              <span>Baseline (0%)</span>
              <span>+30% (Expansion)</span>
            </div>
          </div>

          {/* Slider 2: Expense Change */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Operating Expense Adjustment</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                expenseChange < 0 ? 'bg-emerald-50 text-emerald-700' :
                expenseChange > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={30}
              step={1}
              value={expenseChange}
              onChange={(e) => setExpenseChange(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-20% (Lean Operations)</span>
              <span>Current Outflows</span>
              <span>+30% (Cost Inflation)</span>
            </div>
          </div>

          {/* Slider 3: Payment Consistency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Digital Channel Adoption (UPI / Bank)</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                {paymentConsistency}% Digital
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={paymentConsistency}
              onChange={(e) => setPaymentConsistency(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Informal / Cash Mix</span>
              <span>Standard (50%)</span>
              <span>100% Auditable Digital</span>
            </div>
          </div>

          {/* Slider 4: Transaction Consistency */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Operational Continuity & Frequency</span>
              <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                Index: {transactionConsistency} / 100
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={transactionConsistency}
              onChange={(e) => setTransactionConsistency(Number(e.target.value))}
              className="w-full accent-purple-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Intermittent Pauses</span>
              <span>Steady Cadence</span>
              <span>Continuous Daily Volume</span>
            </div>
          </div>
        </div>

        {/* Projected Outcome Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Projected Credit Signal
              </span>
              {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 text-center">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Current Signal</span>
                <div className="text-3xl font-extrabold tracking-tight text-slate-200">
                  {currentScore}
                  <span className="text-xs font-normal text-slate-400"> / 100</span>
                </div>
              </div>

              <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/40">
                <span className="text-[10px] uppercase font-semibold text-blue-300 block mb-1">Projected Signal</span>
                <div className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-1">
                  <span>{projectedScore}</span>
                  <span className="text-xs font-normal text-slate-300"> / 100</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium">Potential Change</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                delta > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                delta < 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                {delta > 0 ? `+${delta} pts improvement` : delta < 0 ? `${delta} pts decline` : 'Zero variance'}
              </span>
            </div>
          </div>

          {/* "What Changed?" Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>What Changed In This Simulation?</span>
            </h4>

            <div className="space-y-2">
              {simResult?.what_changed?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Disclaimer (Mandatory) */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Simulation only.</strong> This does not represent a guaranteed future score or loan approval. All metrics are hypothetical what-if scenarios and do not modify underlying historical records.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
