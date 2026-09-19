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
import ScoreCoinGauge from '../common/ScoreCoinGauge';

const ICON_MAP = {
  TrendingUp,
  DollarSign,
  CreditCard,
  Activity,
  Scale,
  ShieldCheck,
  Zap
};

export default function ScoreExplanationTab({ scoring = {} }) {
  const [methodologyOpen, setMethodologyOpen] = useState(true);

  const defaultPillars = [
    { name: "Revenue Stability", score: 18, max_score: 20, weight: "20%", icon: "TrendingUp", color: "blue", explanation: "Predictable monthly turnover with low volatility and positive revenue trajectory." },
    { name: "Cash Flow Strength", score: 16, max_score: 20, weight: "20%", icon: "DollarSign", color: "emerald", explanation: "Disciplined operational cash generation; 7 of 8 months generated net operating surplus." },
    { name: "Payment Behaviour", score: 13, max_score: 15, weight: "15%", icon: "CreditCard", color: "purple", explanation: "High auditable digital payment adoption via UPI & Bank Transfer." },
    { name: "Transaction Behaviour", score: 13, max_score: 15, weight: "15%", icon: "Activity", color: "indigo", explanation: "Continuous day-to-day transaction cadence with zero dormancy gaps over 7 days." },
    { name: "Financial Consistency", score: 12, max_score: 15, weight: "15%", icon: "Scale", color: "cyan", explanation: "Verified inflows closely substantiate self-declared monthly revenue." },
    { name: "Data Trust", score: 14, max_score: 15, weight: "15%", icon: "ShieldCheck", color: "amber", explanation: "Pristine transactional hygiene: zero duplicate rows and authentic timestamps." }
  ];

  const pillars = (scoring.pillars && scoring.pillars.length > 0) ? scoring.pillars : defaultPillars;

  const getPillarColor = (score, maxScore = 100) => {
    const pct = maxScore > 0 ? (score / maxScore) * 100 : score;
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 65) return 'bg-blue-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getPillarBadgeVariant = (score, maxScore = 100) => {
    const pct = maxScore > 0 ? (score / maxScore) * 100 : score;
    if (pct >= 80) return 'good';
    if (pct >= 65) return 'indigo';
    if (pct >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
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
            <Badge variant={scoring.badgeColor === 'emerald' ? 'good' : scoring.badgeColor === 'rose' ? 'danger' : scoring.badgeColor === 'blue' ? 'indigo' : 'warning'} size="md">
              {scoring.riskCategory || 'Relatively Stable Behaviour'} &bull; {scoring.riskLevel || 'Moderate Risk'}
            </Badge>
          </div>
        </div>

        {/* 3D Coin Gauge Widget */}
        <div className="shrink-0 bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
          <ScoreCoinGauge 
            score={scoring.score ?? 78} 
            size={172} 
          />
          <div className="mt-2 text-center">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {scoring.score ?? 78}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
            </span>
          </div>
        </div>
      </div>

      {/* 6-Pillar Detailed Score Breakdown (Cards with accurate progress bars & earned scores) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Multidimensional Behavioral Pillar Breakdown</h3>
            <p className="text-xs text-slate-500">6 weighted behavioral components totaling 100 maximum points</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-lg">
            Total Max: 100 pts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar) => {
            const maxScore = pillar.max_score || (parseInt(pillar.weight) || 100);
            const earnedScore = pillar.score ?? 0;
            const percentage = pillar.percentage !== undefined 
              ? pillar.percentage 
              : (maxScore > 0 ? Math.min(100, Math.max(0, Math.round((earnedScore / maxScore) * 100))) : earnedScore);
            const IconComp = ICON_MAP[pillar.icon] || TrendingUp;

            return (
              <div 
                key={pillar.name}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{pillar.name}</span>
                    </div>
                    <Badge variant={getPillarBadgeVariant(earnedScore, maxScore)} size="sm">
                      {percentage}%
                    </Badge>
                  </div>

                  <div className="flex items-baseline justify-between mt-3 mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 font-mono">{earnedScore}</span>
                      <span className="text-xs font-bold text-slate-400 font-mono">/ {maxScore} pts</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      Weight: {pillar.weight}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full ${getPillarColor(earnedScore, maxScore)} transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    />
                  </div>

                  {pillar.explanation && (
                    <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                      "{pillar.explanation}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Score Contribution:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    +{earnedScore} / {maxScore} pts
                  </span>
                </div>
              </div>
            );
          })}
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
            {(!scoring.positiveDrivers || scoring.positiveDrivers.length === 0) ? (
              <p className="text-xs text-slate-400">No positive drivers identified.</p>
            ) : (
              scoring.positiveDrivers.map((driver, idx) => (
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
            {(!scoring.negativeDrivers || scoring.negativeDrivers.length === 0) ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                <span>Zero major negative drivers detected in evaluated ledger.</span>
              </div>
            ) : (
              scoring.negativeDrivers.map((driver, idx) => (
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
            {(!scoring.riskWarnings || scoring.riskWarnings.length === 0) ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                <span>Zero elevated risk warnings. Healthy operations.</span>
              </div>
            ) : (
              scoring.riskWarnings.map((warning, idx) => (
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
              <h3 className="font-bold text-slate-900 text-sm">How This Score Was Calculated (Deterministic 6-Pillar Formula)</h3>
              <p className="text-xs text-slate-500">Transparent mathematical formula documentation</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1" aria-label="Toggle methodology details">
            {methodologyOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {methodologyOpen && (
          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-4 animate-fade-in">
            <div className="bg-slate-900 text-slate-200 font-mono p-4 rounded-xl text-xs overflow-x-auto leading-relaxed">
              Final Signal (0–100) = S_revenue_stability (20) + S_cash_flow_strength (20) + S_payment_behaviour (15) + S_transaction_behaviour (15) + S_financial_consistency (15) + S_data_trust (15)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">1. Revenue Stability (20 pts / 20%)</span>
                <p className="text-slate-500 leading-relaxed">
                  Evaluated via Coefficient of Variation: <code className="text-blue-600 font-semibold font-mono">15 &times; max(0, 1 - 2 &times; CV)</code> plus up to 5 pts revenue momentum bonus. Penalizes turnover swings.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">2. Cash Flow Strength (20 pts / 20%)</span>
                <p className="text-slate-500 leading-relaxed">
                  Combines the proportion of positive cash-flow months (<code className="text-blue-600 font-semibold font-mono">14 &times; Pos Months / Total</code>) with net operational margin cushion (<code className="text-blue-600 font-semibold font-mono">6 &times; Margin / 20%</code>).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">3. Payment Behaviour (15 pts / 15%)</span>
                <p className="text-slate-500 leading-relaxed">
                  Share of verifiable digital banking rails (<code className="text-blue-600 font-semibold font-mono">15 &times; (UPI + Bank Transfer) %</code>) vs. untraceable cash receipts.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">4. Transaction Behaviour (15 pts / 15%)</span>
                <p className="text-slate-500 leading-relaxed">
                  Deducts points for dormancy: <code className="text-blue-600 font-semibold font-mono">15 - (Max Gap &times; 0.5) + Freq Bonus</code>. Gaps &gt; 14 days trigger operational flags.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">5. Financial Consistency (15 pts / 15%)</span>
                <p className="text-slate-500 leading-relaxed">
                  Checks alignment between declared turnover and verified banking records (<code className="text-blue-600 font-semibold font-mono">10 - Variance % / 5</code>) plus 5 pts cross-signal trajectory harmony.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="font-bold text-slate-900 block mb-1">6. Data Trust & Hygiene (15 pts / 15%)</span>
                <p className="text-slate-500 leading-relaxed">
                  Ledger integrity evaluation: <code className="text-blue-600 font-semibold font-mono">15 &times; (Trust Score / 100)</code>. Penalizes duplicate transaction rows and invalid timestamps.
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Black-Box Scoring:</strong> The final CreditBridge Signal is the exact deterministic sum of all 6 behavioral feature scores (totaling 100 points maximum), providing 100% auditable attribution for underwriters.
              </span>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}

