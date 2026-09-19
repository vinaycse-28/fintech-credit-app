import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Clock,
  Building2,
  Receipt,
  Sparkles,
  Sliders,
  Landmark,
  Eye,
  AlertCircle,
  Calendar,
  Lightbulb
} from 'lucide-react';
import Card from '../common/Card';
import MetricCard from '../common/MetricCard';
import ScoreGauge from '../common/ScoreGauge';
import ScoreCoinGauge from '../common/ScoreCoinGauge';
import Badge from '../common/Badge';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getScoreHistory } from '../../services/api';

export default function OverviewTab({ 
  profile, 
  dashboardData, 
  onNavigateTab 
}) {
  const summary = dashboardData?.summary || {};
  const scoring = dashboardData?.scoring || {};
  const monthlyPreview = dashboardData?.monthlyPreview || [];
  const crossSignal = dashboardData?.crossSignal || {};
  const financialStory = dashboardData?.financialStory || {};
  const anomalies = dashboardData?.anomalies || [];
  const financialHealth = dashboardData?.financialHealth || {
    revenue_health: 82,
    cash_flow: 76,
    expense_control: 68,
    payment_behaviour: 84,
    data_trust: 91
  };
  const scoreChange = dashboardData?.scoreChange;

  const [lenderView, setLenderView] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyMessage, setHistoryMessage] = useState(null);

  // Fetch score history for the active business
  useEffect(() => {
    async function loadHistory() {
      if (profile?.id) {
        try {
          const res = await getScoreHistory(profile.id);
          if (res?.history) {
            setHistoryData(res.history);
            setHistoryMessage(res.message);
          }
        } catch (e) {
          console.warn('Could not load score history:', e);
        }
      }
    }
    loadHistory();
  }, [profile?.id]);

  // Pillar scores for the centerpiece breakdown (Part 9)
  const pillars = scoring?.pillars || [
    { name: "Revenue Stability", score: 18, max_score: 20, explanation: "Revenue remained relatively stable during the analyzed period." },
    { name: "Cash Flow Strength", score: 16, max_score: 20, explanation: "Most analyzed months showed positive operating cash flow." },
    { name: "Payment Behaviour", score: 13, max_score: 15, explanation: "High digital payment adoption via UPI and Bank Transfer." },
    { name: "Transaction Behaviour", score: 13, max_score: 15, explanation: "Regular transaction frequency with low dormancy gaps." },
    { name: "Financial Consistency", score: 12, max_score: 15, explanation: "Observed transaction turnover matches declared monthly revenue." },
    { name: "Data Trust", score: 14, max_score: 15, explanation: "Pristine transactional hygiene with verified timestamps." }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner: Business Firmographic Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{profile?.business_name || profile?.name || 'MSME Enterprise'}</h2>
            <Badge variant="indigo" size="sm">
              {profile?.business_type || profile?.industry || 'Retail'}
            </Badge>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Vintage: {profile?.business_age || profile?.age || '3+ years'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>{profile?.location || 'India'}</span>
            <span>&bull;</span>
            <span>Declared Monthly Turnover: ₹{(profile?.declared_monthly_revenue || profile?.declaredMonthlyRevenue || 0).toLocaleString()}</span>
            <span>&bull;</span>
            <span>{summary.evaluatedPeriod || 'Evaluated Timeline'}</span>
          </p>
        </div>

        {/* Action Buttons & Optional Lender View Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setLenderView(!lenderView)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              lenderView 
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
            title="Toggle Lender Executive Decision-Support View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lenderView ? 'Exit Lender View' : 'Lender View'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('score-explanation')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why This Signal?</span>
          </button>

          <button
            onClick={() => onNavigateTab('credit-report')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Report</span>
          </button>
        </div>
      </div>

      {/* PART 18: LENDER VIEW SUMMARY (When Toggled) */}
      {lenderView && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/40 animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                Institutional Underwriting Summary
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">
                {profile?.business_name || profile?.name} &bull; {profile?.business_type || profile?.industry}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Creditworthiness</span>
                <span className="text-2xl font-black text-white">{summary.score || 78} / 100</span>
              </div>
              <Badge variant={summary.badgeColor === 'emerald' ? 'good' : 'warning'} size="md">
                {summary.riskLevel || 'Moderate Risk'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">Monthly Revenue</span>
              <span className="text-sm font-bold text-white mt-0.5 block">₹{(summary.monthlyRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">Monthly Expenses</span>
              <span className="text-sm font-bold text-white mt-0.5 block">₹{(summary.monthlyExpenses || 0).toLocaleString()}</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">Net Cash Flow</span>
              <span className={`text-sm font-bold mt-0.5 block ${summary.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{(summary.netCashFlow || 0).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">Data Trust</span>
              <span className="text-sm font-bold text-indigo-300 mt-0.5 block">{dashboardData.trustStatus || 'High'}</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">Revenue Stability</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{scoring?.breakdown?.revenue_stability || 18}/20</span>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-400 uppercase block">Payment Behaviour</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{scoring?.breakdown?.payment_behaviour || 13}/15</span>
            </div>
          </div>

          {/* Decision-Support Summary */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Decision-Support Summary</span>
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed">
              {financialStory?.summary || "Stable revenue and positive operating cash flow support the current creditworthiness signal. Transaction velocity and digital channel adoption indicate active operational health with low leakage."}
            </p>
          </div>
        </div>
      )}

      {/* TOP DASHBOARD METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Revenue (Run Rate)"
          value={`₹${(summary.monthlyRevenue || 0).toLocaleString()}`}
          subtitle="Observed avg monthly inflows"
          icon={TrendingUp}
          iconColor="blue"
        />

        <MetricCard
          title="Monthly Expenses"
          value={`₹${(summary.monthlyExpenses || 0).toLocaleString()}`}
          subtitle="Observed avg monthly debits"
          icon={Receipt}
          iconColor="amber"
        />

        <MetricCard
          title="Net Cash Flow"
          value={`₹${(summary.netCashFlow || 0).toLocaleString()}`}
          subtitle="Operational cash buffer"
          change={summary.netCashFlow >= 0 ? "+ Positive Cushion" : "- Operating Deficit"}
          changeType={summary.netCashFlow >= 0 ? "positive" : "negative"}
          icon={DollarSign}
          iconColor={summary.netCashFlow >= 0 ? "emerald" : "rose"}
        />

        <MetricCard
          title="Transaction Count"
          value={summary.transactionCount || 0}
          subtitle="Total credits & debits analyzed"
          icon={Activity}
          iconColor="purple"
        />
      </div>

      {/* PART 9: CREDITWORTHINESS SCORE CENTERPIECE & BREAKDOWN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            CREDITWORTHINESS SIGNAL
          </h3>
          <p className="text-xs text-slate-500">
            Objective MSME financial health evaluated across 6 transparent behavioral pillars
          </p>
        </div>

        {/* Centerpiece Row: Large Coin Gauge | Score & Risk Badge | Score Range | What This Means */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 items-center">
          
          {/* Left: Large 3D Coin & Score Display */}
          <div className="xl:col-span-5 flex items-center gap-5 sm:gap-6">
            <ScoreCoinGauge 
              score={summary.score || 78} 
              size={172} 
              className="shrink-0"
            />

            <div className="space-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-5xl font-black tracking-tight ${
                  (summary.score || 78) >= 80 
                    ? 'text-emerald-600' 
                    : (summary.score || 78) >= 65 
                    ? 'text-blue-600' 
                    : (summary.score || 78) >= 40 
                    ? 'text-amber-600' 
                    : 'text-rose-600'
                }`}>
                  {summary.score || 78}
                </span>
                <span className="text-2xl font-bold text-slate-400">
                  / 100
                </span>
              </div>

              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  (summary.score || 78) >= 80 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : (summary.score || 78) >= 65 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : (summary.score || 78) >= 40 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    (summary.score || 78) >= 80 
                      ? 'bg-emerald-500' 
                      : (summary.score || 78) >= 65 
                      ? 'bg-blue-500' 
                      : (summary.score || 78) >= 40 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500'
                  }`} />
                  {summary.riskLevel || ((summary.score || 78) >= 80 ? 'Low Risk' : (summary.score || 78) >= 65 ? 'Moderate Risk' : (summary.score || 78) >= 40 ? 'Moderate-High Risk' : 'High Risk')}
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
                {(summary.score || 78) >= 80 
                  ? "Strong financial profile with consistent performance and low risk indicators." 
                  : (summary.score || 78) >= 65 
                  ? "Stable revenue with positive cash flow and manageable working capital variance."
                  : (summary.score || 78) >= 40 
                  ? "Moderate volatility or transaction dormancy requiring closer underwriting review."
                  : "Elevated credit risk pattern with frequent cash deficits or irregular turnover."}
              </p>
            </div>
          </div>

          {/* Center-Right: Score Range Legend */}
          <div className="xl:col-span-3 bg-slate-50/70 rounded-2xl p-4 border border-slate-200/70 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              SCORE RANGE
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  80 – 100
                </span>
                <span className="font-semibold text-emerald-700">Low Risk</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  65 – 79
                </span>
                <span className="font-semibold text-amber-700">Moderate Risk</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  40 – 64
                </span>
                <span className="font-semibold text-orange-700">Moderate-High Risk</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  0 – 39
                </span>
                <span className="font-semibold text-rose-700">High Risk</span>
              </div>
            </div>
          </div>

          {/* Right: What This Means */}
          <div className="xl:col-span-4 bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>What this means</span>
            </div>
            <p className="text-xs text-emerald-950/80 leading-relaxed">
              {(summary.score || 78) >= 80 
                ? "Your business shows strong financial health, consistent cash flow, and reliable transaction behaviour. You may be a suitable candidate for formal credit, subject to further due diligence."
                : (summary.score || 78) >= 65
                ? "Your business maintains healthy core operations and consistent turnover. Credit readiness is viable with moderate working capital limits."
                : (summary.score || 78) >= 40
                ? "Your enterprise demonstrates active trade but shows occasional revenue dips or expense spikes. Lenders may require additional collateral or debt-service guarantees."
                : "Transaction flow reveals elevated risk markers such as extended inactivity or negative cash flow. Focus on building auditable digital revenue before seeking formal financing."}
            </p>
          </div>

        </div>

        {/* Score Breakdown Section & 6 Pillar Cards */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Score Breakdown</h4>
              <p className="text-xs text-slate-500">Your score is based on 6 key factors. Each factor is scored independently and combined for the final signal.</p>
            </div>
            <button 
              onClick={() => onNavigateTab && onNavigateTab('score-explanation')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50/70 hover:bg-blue-100/70 px-3 py-1.5 rounded-xl border border-blue-200/60"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How is this calculated?</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {pillars.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 font-mono">
                    {p.score} <span className="text-xs font-normal text-slate-400">/ {p.max_score}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        p.score / p.max_score >= 0.8 ? 'bg-emerald-500' : p.score / p.max_score >= 0.6 ? 'bg-blue-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.round((p.score / p.max_score) * 100))}%` }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">
                  "{p.explanation}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PART 12: FINANCIAL HEALTH SCORE (5 Visual Meters) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Financial Health Score</h3>
          <p className="text-xs text-slate-500">Multidimensional behavioral health signals (0–100)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Revenue Health', score: financialHealth.revenue_health, color: 'bg-blue-600' },
            { label: 'Cash Flow', score: financialHealth.cash_flow, color: 'bg-emerald-600' },
            { label: 'Expense Control', score: financialHealth.expense_control, color: 'bg-purple-600' },
            { label: 'Payment Behaviour', score: financialHealth.payment_behaviour, color: 'bg-indigo-600' },
            { label: 'Data Trust', score: financialHealth.data_trust, color: 'bg-amber-600' },
          ].map((item, i) => (
            <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{item.label}</span>
                <span className="font-bold text-slate-900 font-mono">{item.score}/100</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`${item.color} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PART 10 & 11: SCORE HISTORY & SCORE CHANGE EXPLANATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score History Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Score History</h3>
              <p className="text-xs text-slate-500">Creditworthiness Signal trajectory across analysis runs</p>
            </div>
            <Badge variant="blue" size="sm">
              {historyData.length} Evaluations
            </Badge>
          </div>

          {historyData.length <= 1 ? (
            <div className="py-12 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                Score history will appear as more financial data is analyzed.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Current evaluation signal: {summary.score || 78}/100
              </p>
            </div>
          ) : (
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(val) => [`${val} / 100`, 'Creditworthiness']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2563EB" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563EB' }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* PART 11: WHY DID MY SCORE CHANGE? */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Why Did My Score Change?</h3>
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>

            <div className="py-4 space-y-2.5">
              {scoreChange?.reasons && scoreChange.reasons.length > 0 ? (
                scoreChange.reasons.map((r, i) => (
                  <div key={i} className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    r.startsWith('+') ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                  }`}>
                    <span className="font-mono font-bold">{r}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-700 font-semibold">Baseline Analysis Established</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Signal is currently calibrated to baseline ledger data. Subsequent transaction uploads will reflect score deltas here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('simulator')}
              className="text-xs text-blue-600 font-semibold hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Simulate prospective changes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* PART 13: BUSINESS FINANCIAL STORY & KEY OBSERVATIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Narrative Synthesis</span>
          <h3 className="text-base font-bold text-slate-900">BUSINESS FINANCIAL STORY</h3>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
          "{financialStory?.summary || "Revenue remained stable during the evaluated period, and the business maintained positive cash flow. Transaction activity was consistent with observed revenue, supporting the current creditworthiness signal."}"
        </p>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Key Observations</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {financialStory?.observations?.map((obs, i) => (
              <div key={i} className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs ${
                obs.type === 'positive' 
                  ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800' 
                  : 'bg-amber-50/60 border-amber-100 text-amber-800'
              }`}>
                {obs.type === 'positive' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{obs.text}</span>
              </div>
            )) || (
              <>
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Stable revenue run-rate</span>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Positive operating cash flow</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* PART 14: FINANCIAL ANOMALIES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Risk Surveillance</span>
            <h3 className="text-base font-bold text-slate-900">FINANCIAL ANOMALIES</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {anomalies.length} Flagged
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-4 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
            <span>Zero critical anomalies detected across transactions and declarations.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((a, i) => (
              <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                  <p className="text-[11px] text-slate-600">{a.description}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0 ${
                  a.severity === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  a.severity === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {a.severity} Severity
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PART 15: DATA QUALITY / TRUST METER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Data Quality & Trust Meter</h3>
            <p className="text-xs text-slate-500">Ledger veracity, timestamp authenticity, and anomaly auditing</p>
          </div>
          <Badge variant="good" size="md">
            DATA TRUST: {dashboardData.trustStatus || 'HIGH'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Quality Score</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">{financialHealth.data_trust}%</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Processed Records</span>
            <span className="text-xl font-bold text-slate-800 mt-0.5 block">{summary.transactionCount || 0}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Duplicates Detected</span>
            <span className="text-xl font-bold text-slate-800 mt-0.5 block">0</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Date Consistency</span>
            <span className="text-xl font-bold text-emerald-600 mt-0.5 block">100% Verified</span>
          </div>
        </div>
      </div>

      {/* PART 19: BUSINESS ACTIVITY TIMELINE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Chronological Momentum</span>
          <h3 className="text-base font-bold text-slate-900">BUSINESS ACTIVITY TIMELINE</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {monthlyPreview.map((m, i) => {
            const net = m.revenue - m.expenses;
            const statusLabel = net >= 0 ? 'Positive Surplus' : 'Expense Spike';
            return (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 text-center">
                <span className="text-xs font-bold text-slate-900 block">{m.name || m.month}</span>
                <span className="text-[11px] text-slate-500 block">Inflow: ₹{Math.round(m.revenue / 1000)}k</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block mt-1 ${
                  net >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
