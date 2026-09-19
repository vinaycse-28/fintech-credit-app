import React from 'react';
import { 
  Landmark, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet,
  Info
} from 'lucide-react';
import Card from '../common/Card';
import MetricCard from '../common/MetricCard';
import Badge from '../common/Badge';

export default function LoanReadinessTab({ dashboardData, profile }) {
  const summary = dashboardData?.summary || {};
  const scoring = dashboardData?.scoring || {};
  const loanData = dashboardData?.loanReadiness || {};
  const bd = scoring?.breakdown || {};

  const score = summary.score || 78;
  const avgRev = summary.monthlyRevenue || 0;
  const avgExp = summary.monthlyExpenses || 0;
  const netCf = summary.netCashFlow || 0;
  const emi = profile?.existingMonthlyEmi || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Loan Readiness Assessment</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Decision-Support Only
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent capacity estimation derived from cash-flow surplus and debt service coverage
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={summary.badgeColor === 'emerald' ? 'good' : 'warning'} size="sm">
            {summary.riskLevel || 'Moderate Risk'}
          </Badge>
        </div>
      </div>

      {/* Prominent Financing Estimates (Part 17 Centerpiece) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Estimated Affordable Monthly Repayment */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300 block">
              Estimated Affordable Monthly Repayment (EMI Capacity)
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
              {loanData.affordable_repayment_display || "₹8,000 – ₹12,000"}
            </div>
            <p className="text-xs text-blue-200 mt-2">
              Cushioned to maintain 50%+ surplus buffer above monthly operational obligations.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-blue-800/80 flex items-center justify-between text-xs text-blue-300">
            <span>Operating Cash Surplus: ₹{Math.max(0, netCf - emi).toLocaleString()}/mo</span>
            <span>DSCR Target: 1.4x</span>
          </div>
        </div>

        {/* Potential Financing Range */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Potential Financing Range (Working Capital Facility)
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-emerald-400 mt-2">
              {loanData.potential_financing_display || "₹1.5L – ₹2.5L"}
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Estimated capacity modeled across 12 to 24 month tenure assuming current inflow stability.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
            <span>Tenure: 12–24 Months</span>
            <span>Signal: {score}/100</span>
          </div>
        </div>

      </div>

      {/* 5 Core Decision Support Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Credit Signal</span>
          <div className="text-lg font-black text-slate-900 mt-1">{score} / 100</div>
          <span className="text-[11px] text-slate-500">{summary.riskCategory || 'Stable'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Cash Flow Strength</span>
          <div className="text-lg font-black text-emerald-600 mt-1">{bd.cash_flow_strength || 16} / 20</div>
          <span className="text-[11px] text-slate-500">₹{netCf.toLocaleString()} Net CF</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Revenue Stability</span>
          <div className="text-lg font-black text-blue-600 mt-1">{bd.revenue_stability || 18} / 20</div>
          <span className="text-[11px] text-slate-500">₹{avgRev.toLocaleString()} Inflows</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Debt / EMI Burden</span>
          <div className="text-lg font-black text-slate-900 mt-1">₹{emi.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Current Monthly EMI</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Data Trust</span>
          <div className="text-lg font-black text-indigo-600 mt-1">{dashboardData?.trustStatus || 'Verified'}</div>
          <span className="text-[11px] text-slate-500">{bd.data_trust || 14} / 15 pts</span>
        </div>

      </div>

      {/* Transparent Formula & Methodology Explanation */}
      <Card title="Capacity Estimation Methodology" subtitle="How CreditBridge computes sustainable repayment potential">
        <div className="space-y-4 text-xs text-slate-600">
          <p className="leading-relaxed">
            Unlike traditional black-box underwriting models that rely solely on collateral, CreditBridge assesses <strong>actual operating cash flow cushion</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h5 className="font-bold text-slate-900 mb-1">1. Cash Cushion</h5>
              <p className="text-[11px] text-slate-500">
                Calculates verifiable monthly operational surplus (Total Inflows minus Operating Debits) after accounting for current EMI debt obligations.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h5 className="font-bold text-slate-900 mb-1">2. Debt Service Coverage</h5>
              <p className="text-[11px] text-slate-500">
                Applies a conservative 30–50% allocation multiplier to prevent over-leveraging and maintain an emergency liquidity buffer.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <h5 className="font-bold text-slate-900 mb-1">3. Behavioral Haircut</h5>
              <p className="text-[11px] text-slate-500">
                Discounts borrowing range if irregular dormancy gaps or significant turnover variance is observed in banking records.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Mandatory Disclaimer (Part 17 Strict Rule) */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950">Important Regulatory & Prototype Notice</h4>
          <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
            Prototype estimate for demonstration only. Not a loan approval, guarantee, or official credit decision.
            CreditBridge is an explainable decision-support engine designed to assist underwriters, not an automated lending authority. Actual credit terms, interest rates, and approval limits remain subject to regulated lender verification, KYC, and formal credit policies.
          </p>
        </div>
      </div>

    </div>
  );
}
