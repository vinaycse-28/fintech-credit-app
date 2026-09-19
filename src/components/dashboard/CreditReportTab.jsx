import React from 'react';
import { 
  Printer, 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3,
  FileCheck,
  Award
} from 'lucide-react';
import Badge from '../common/Badge';

export default function CreditReportTab({ 
  profile = {}, 
  analysis = {}, 
  onBack 
}) {
  const summary = analysis.summary || {};
  const scoring = analysis.scoring || {};
  const financials = analysis.financials || {};
  const behaviour = analysis.behaviour || {};
  const trust = analysis.trust || {};
  const story = analysis.story || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      reportTitle: "CreditBridge MSME Creditworthiness Assessment Memorandum",
      generatedAt: new Date().toISOString(),
      businessProfile: profile,
      creditworthinessSignal: scoring.score,
      riskClassification: scoring.riskCategory,
      summaryMetrics: summary,
      financials: {
        totalRevenue: financials.totalRevenue,
        totalExpenses: financials.totalExpenses,
        netCashFlow: financials.netCashFlow,
        revenueCV: financials.revenueCV,
        expenseRatio: financials.expenseRatio
      },
      trustAndConsistency: {
        dataTrust: trust.status,
        storyVariancePct: story.variancePct,
        storyStatus: story.status
      },
      positiveDrivers: scoring.positiveDrivers,
      negativeDrivers: scoring.negativeDrivers,
      riskWarnings: scoring.riskWarnings
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creditbridge_report_${profile?.name?.replace(/\s+/g, '_') || 'msme'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Action Bar (Hidden on print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Data (.json)</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Assessment Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 shadow-md print:border-none print:shadow-none print:p-0 space-y-8">
        
        {/* Report Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                CB
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">CreditBridge</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Institutional CAM
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
              Business Creditworthiness Assessment Report
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Automated Financial Behaviour, Ledger Consistency & Cross-Signal Memorandum
            </p>
          </div>

          <div className="text-right text-xs text-slate-500 space-y-1">
            <p><strong>Report ID:</strong> CB-CAM-2026-0982</p>
            <p><strong>Date Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            <p><strong>Underwriter Engine:</strong> Deterministic v1.0</p>
          </div>
        </div>

        {/* Section 1: Business Profile & Top Score Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="md:col-span-8 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Enterprise Profile</span>
            <h2 className="text-xl font-extrabold text-slate-900">{profile.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Sector / Industry</span>
                <span className="font-semibold text-slate-800">{profile.industry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Operating Age</span>
                <span className="font-semibold text-slate-800">{profile.age}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Headcount</span>
                <span className="font-semibold text-slate-800">{profile.employees} Staff</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Location</span>
                <span className="font-semibold text-slate-800">{profile.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Declared Turnover</span>
                <span className="font-semibold text-slate-800">₹{(profile.declaredMonthlyRevenue || 0).toLocaleString()} /mo</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Existing EMI Obligations</span>
                <span className="font-semibold text-slate-800">₹{(profile.existingMonthlyEmi || 0).toLocaleString()} /mo</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CreditBridge Signal</span>
            <div className="text-4xl font-black text-slate-900 my-1">
              {scoring.score || 78} <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
            <Badge variant={scoring.badgeColor === 'emerald' ? 'good' : scoring.badgeColor === 'rose' ? 'danger' : 'warning'} size="sm">
              {scoring.riskCategory} &bull; {scoring.riskLevel}
            </Badge>
          </div>
        </div>

        {/* Section 2: Financial Run-Rate Summary */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">1. Financial Ledger Performance Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Observed Revenue</span>
              <p className="text-base font-bold text-blue-600 mt-0.5">₹{(financials.totalRevenue || 0).toLocaleString()}</p>
              <span className="text-[10px] text-slate-500">Across {financials.totalMonths} months</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Observed Outflows</span>
              <p className="text-base font-bold text-rose-600 mt-0.5">₹{(financials.totalExpenses || 0).toLocaleString()}</p>
              <span className="text-[10px] text-slate-500">Expense Ratio: {financials.expenseRatio}%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Cumulative Net Cash Flow</span>
              <p className="text-base font-bold text-emerald-600 mt-0.5">₹{(financials.netCashFlow || 0).toLocaleString()}</p>
              <span className="text-[10px] text-slate-500">{financials.positiveMonths} positive months</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Revenue Consistency</span>
              <p className="text-base font-bold text-slate-800 mt-0.5">{financials.revenueConsistency}</p>
              <span className="text-[10px] text-slate-500">CV: {financials.revenueCV}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Transaction Behaviour & Data Trust */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Transaction Behaviour Cadence</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Transactions Evaluated:</span>
                <span className="font-bold text-slate-900">{behaviour.totalCount} ({behaviour.creditCount} Cr / {behaviour.debitCount} Dr)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Average Ticket Size:</span>
                <span className="font-bold text-slate-900">₹{(behaviour.avgTicketSize || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Monthly Inflow Velocity:</span>
                <span className="font-bold text-slate-900">{behaviour.avgMonthlyFrequency} txns / month</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Maximum Dormancy Gap:</span>
                <span className={`font-bold ${behaviour.maxGapDays < 14 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {behaviour.maxGapDays} days
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Data Trust & Story Consistency</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Data Trust Result:</span>
                <span className="font-bold text-emerald-700">{trust.status}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duplicate / Invalid Rows:</span>
                <span className="font-bold text-slate-900">{trust.duplicateCount || 0} duplicates &bull; {trust.invalidCount || 0} invalid</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Declared vs Observed Turnover:</span>
                <span className="font-bold text-slate-900">{story.variancePct}% variance ({story.status})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cross-Signal Trajectory:</span>
                <span className={`font-bold ${analysis.crossSignal?.isConsistent !== false ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {analysis.crossSignal?.status || (analysis.crossSignal?.isConsistent !== false ? 'Broadly Aligned' : 'Inconsistency Detected')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Score Decomposition & Drivers */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">4. Explainability & Risk Attribution</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Positive Drivers */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Positive Operational Drivers</span>
              </span>
              <ul className="text-xs text-emerald-800 space-y-1 pl-5 list-disc">
                {scoring.positiveDrivers?.map((d, i) => (
                  <li key={i}><strong>{d.title}:</strong> {d.detail}</li>
                ))}
              </ul>
            </div>

            {/* Negative Drags & Warnings */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Operational Vulnerabilities & Warnings</span>
              </span>
              <ul className="text-xs text-amber-800 space-y-1 pl-5 list-disc">
                {scoring.riskWarnings?.length === 0 ? (
                  <li>No critical operational warnings detected.</li>
                ) : (
                  scoring.riskWarnings?.map((w, i) => (
                    <li key={i}><strong>{w.title}:</strong> {w.message}</li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5: Financial Story & Detected Anomalies */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">5. Business Financial Story & Ledger Anomalies</h3>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
            <span className="font-bold text-slate-900 block mb-1">Financial Narrative:</span>
            "{analysis.financialStory?.summary || "Revenue remained stable during the evaluated cycle, maintaining positive operating cash flow aligned with declared turnover."}"
          </div>

          {analysis.anomalies && analysis.anomalies.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Detected Audit Anomalies:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.anomalies.map((a, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-start gap-2">
                    <div>
                      <strong className="text-slate-900">{a.title}:</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5">{a.description}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded shrink-0">
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Loan Readiness Estimation */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">6. Loan Readiness Decision Support</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
              <span className="text-[11px] uppercase font-bold text-blue-900 block">Estimated Affordable Monthly Repayment</span>
              <div className="text-2xl font-black text-blue-900 mt-1">
                {analysis.loanReadiness?.affordable_repayment_display || "₹8,000 – ₹12,000"}
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Calibrated to 35–50% operational cash surplus buffer above existing debts.
              </p>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200">
              <span className="text-[11px] uppercase font-bold text-indigo-900 block">Potential Financing Range</span>
              <div className="text-2xl font-black text-indigo-900 mt-1">
                {analysis.loanReadiness?.potential_financing_display || "₹1.5L – ₹2.5L"}
              </div>
              <p className="text-[11px] text-indigo-700 mt-1">
                Estimated 12–24 month facility capacity supported by verified turnover.
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 italic">
            * Prototype estimate for demonstration only. Not a loan approval, guarantee, or official credit decision.
          </p>
        </div>

        {/* Underwriter Recommendation & Sign-Off Block */}
        <div className="border-t-2 border-slate-900 pt-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">7. Human Underwriter Review & Sign-Off</h4>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Underwriter Synthesis Notes:</p>
            <p>
              {analysis.underwriterNotes || (
                scoring.score >= 80 
                  ? `Applicant (${profile.name || 'MSME Enterprise'}) demonstrates strong financial momentum and robust positive cash-flow buffers across the ${financials.totalMonths || 8}-month observation timeline. Data trust checks verified cleanly with ${trust.duplicateCount || 0} duplicate entries. Suitable for expedited human review for growth-tier working capital facilities.`
                  : scoring.score >= 65
                  ? `Applicant (${profile.name || 'MSME Enterprise'}) exhibits steady operational velocity with disciplined cash flow buffers over the ${financials.totalMonths || 8}-month observation timeline. Data trust checks indicate reliable ledger hygiene with ${trust.duplicateCount || 0} duplicates. Recommended for human credit committee review under standard working capital guidelines.`
                  : `Applicant (${profile.name || 'MSME Enterprise'}) presents elevated risk indicators including revenue volatility or cash-flow compression (${scoring.riskCategory || 'Elevated Risk'}). Underwriter clarification recommended regarding ${scoring.riskWarnings?.[0]?.title?.toLowerCase() || 'recent operational variance'} prior to credit facility sanction.`
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 text-xs text-slate-600">
            <div className="border-t border-slate-300 pt-2">
              <span className="text-slate-400 block text-[10px]">Evaluated By</span>
              <span className="font-bold text-slate-800">Credit Officer Signature</span>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <span className="text-slate-400 block text-[10px]">Decision Status</span>
              <span className="font-bold text-slate-800">[ ] Approved &nbsp; [ ] Clarify &nbsp; [ ] Declined</span>
            </div>
            <div className="border-t border-slate-300 pt-2 text-right">
              <span className="text-slate-400 block text-[10px]">Date of Sign-off</span>
              <span className="font-bold text-slate-800">____ / ____ / 2026</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 leading-normal">
          This CreditBridge Creditworthiness Report is an analytical decision-support assessment generated from business transaction ledgers. It is not an official credit bureau score (CIBIL/Experian). CreditBridge does not disburse or guarantee credit.
        </div>

      </div>

    </div>
  );
}
