import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  CreditCard, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Scale
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ScoreGauge from '../common/ScoreGauge';
import ScoreCoinGauge from '../common/ScoreCoinGauge';

export default function ScoreExplanationTab({ scoring = {} }) {
  const [methodologyOpen, setMethodologyOpen] = useState(true);

  const pillars = scoring.pillars || [
    { name: "Revenue Stability", score: 85, weight: "20%", icon: "TrendingUp", color: "blue" },
    { name: "Cash Flow Strength", score: 82, weight: "25%", icon: "DollarSign", color: "emerald" },
    { name: "Transaction Regularity", score: 90, weight: "15%", icon: "Activity", color: "indigo" },
    { name: "Expense Discipline", score: 75, weight: "15%", icon: "ShieldCheck", color: "amber" },
    { name: "Revenue Growth", score: 70, weight: "15%", icon: "Zap", color: "cyan" },
    { name: "Payment Digitalization", score: 80, weight: "10%", icon: "CreditCard", color: "purple" }
  ];

  const getPillarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 65) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner: Creditworthiness Signal Master Gauge */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 mb-2">
            <Badge variant="indigo" size="md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>100% Explainable Architecture</span>
            </Badge>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Why This Signal? Attribution & Decomposition
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Every point in the CreditBridge Signal is derived from objective, auditable behavioral signals. No black-box neural networks, no arbitrary credit bureau proxies.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="text-xs text-slate-500 font-medium">Risk Assessment:</span>
            <Badge variant={scoring.badgeColor === 'emerald' ? 'good' : scoring.badgeColor === 'rose' ? 'danger' : 'warning'} size="md">
              {scoring.riskCategory || 'Relatively Stable'} &bull; {scoring.riskLevel || 'Moderate Risk'}
            </Badge>
          </div>
        </div>

        {/* 3D Coin Gauge Widget */}
        <div className="shrink-0 bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
          <ScoreCoinGauge 
            score={scoring.score || 78} 
            size={172} 
          />
          <div className="mt-2 text-center">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {scoring.score || 78}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6-Pillar Detailed Score Breakdown (Cards with progress bars) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Multidimensional Behavioral Pillar Breakdown</h3>
            <p className="text-xs text-slate-500">6 weighted components normalized to 100 points</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Total Normalized Weight: 100%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar) => (
            <div 
              key={pillar.name}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">{pillar.name}</span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Weight: {pillar.weight}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3 mb-1">
                  <span className="text-2xl font-black text-slate-900">{pillar.score}</span>
                  <span className="text-xs font-bold text-slate-400">/ 100</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full ${getPillarColor(pillar.score)} transition-all duration-500`}
                    style={{ width: `${pillar.score}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Contribution:</span>
                <span className="font-bold text-slate-700">
                  {Math.round((pillar.score * parseInt(pillar.weight)) / 100)} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Positive Drivers, Negative Drags & Risk Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* POSITIVE DRIVERS */}
        <Card 
          title="Positive Drivers (+)" 
          subtitle="Operational discipline boosting the score"
          className="border-emerald-200/80"
        >
          <div className="space-y-3">
            {scoring.positiveDrivers?.length === 0 ? (
              <p className="text-xs text-slate-400">No positive drivers identified.</p>
            ) : (
              scoring.positiveDrivers?.map((driver, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">{driver.title}</h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">{driver.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* NEGATIVE DRIVERS */}
        <Card 
          title="Negative Drags (-)" 
          subtitle="Factors dampening the overall signal"
          className="border-amber-200/80"
        >
          <div className="space-y-3">
            {scoring.negativeDrivers?.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                <span>Zero major negative drivers detected in evaluated ledger.</span>
              </div>
            ) : (
              scoring.negativeDrivers?.map((driver, idx) => (
                <div key={idx} className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">{driver.title}</h4>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">{driver.detail}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* RISK WARNINGS */}
        <Card 
          title="Risk Warnings" 
          subtitle="Critical operational red flags for lenders"
          className="border-rose-200/80"
        >
          <div className="space-y-3">
            {scoring.riskWarnings?.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                <span>Zero elevated risk warnings. Healthy operations.</span>
              </div>
            ) : (
              scoring.riskWarnings?.map((warning, idx) => (
                <div key={idx} className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-rose-950">{warning.title}</h4>
                      <Badge variant="danger" size="sm" withDot={false} className="text-[9px] px-1.5 py-0">
                        {warning.severity || 'high'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">{warning.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

      </div>

      {/* HOW THIS SCORE WAS CALCULATED (Collapsible Methodology Card) */}
      <Card>
        <div 
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">How This Score Was Calculated (Deterministic Formula)</h3>
              <p className="text-xs text-slate-500">Transparent mathematical formula documentation</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1">
            {methodologyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {methodologyOpen && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-4 animate-fade-in">
            <div className="bg-slate-900 text-slate-200 font-mono p-4 rounded-xl text-xs overflow-x-auto">
              Final Signal = 0.20 &times; S_rev_cons + 0.25 &times; S_cf_stab + 0.15 &times; S_rev_growth + 0.15 &times; S_txn_reg + 0.15 &times; S_exp_stab + 0.10 &times; S_pay_reg
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">1. Revenue Consistency (20%)</span>
                <p className="text-slate-500">
                  Evaluated via the Coefficient of Variation: <code className="text-blue-600 font-semibold">100 &times; max(0, 1 - 2 &times; CV)</code>. Penalizes volatile monthly turnover swings.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">2. Cash Flow Stability (25%)</span>
                <p className="text-slate-500">
                  Combines the proportion of positive cash-flow months (70%) with the average net operating margin (30%).
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">3. Transaction Regularity (15%)</span>
                <p className="text-slate-500">
                  Deducts points for dormancy: <code className="text-blue-600 font-semibold">100 - (Max Gap Days &times; 2.5)</code>. Gaps &gt; 14 days trigger operational flags.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">4. Payment Regularity (10%)</span>
                <p className="text-slate-500">
                  Share of verifiable digital banking rails (UPI and Bank Transfers) vs. untraceable cash receipts.
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Penalty Modifiers:</strong> Ledger duplicates or unverified timestamps subtract up to 18 points, while significant turnover divergence (&gt;30% variance against self-declared revenue) deducts 12 points.
              </span>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
