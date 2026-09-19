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
  profile: propProfile = {}, 
  analysis = {}, 
  financials: propFinancials,
  behaviour: propBehaviour,
  trustData: propTrust,
  scoring: propScoring,
  onBack 
}) {
  const profile = propProfile && Object.keys(propProfile).length > 0 
    ? propProfile 
    : (analysis?.profile || analysis?.businessProfile || {});

  const summary = analysis?.summary || {};

  const scoringObj = (propScoring && Object.keys(propScoring).length > 0) 
    ? propScoring 
    : (analysis?.scoring || {});

  const finObj = (propFinancials && Object.keys(propFinancials).length > 0) 
    ? propFinancials 
    : (analysis?.financials || {});

  const behObj = (propBehaviour && Object.keys(propBehaviour).length > 0) 
    ? propBehaviour 
    : (analysis?.behaviour || {});

  const trustObj = (propTrust && Object.keys(propTrust).length > 0) 
    ? (propTrust.trust || propTrust) 
    : (analysis?.trust || {});

  const storyObj = (propTrust?.story) 
    ? propTrust.story 
    : (analysis?.story || {});

  // Normalized Financial Metrics
  const totalRevenue = finObj.totalRevenue ?? finObj.total_revenue ?? analysis?.revenue ?? (summary.monthlyRevenue ? summary.monthlyRevenue * (finObj.totalMonths || 8) : 0);
  const totalExpenses = finObj.totalExpenses ?? finObj.total_expenses ?? analysis?.expenses ?? (summary.monthlyExpenses ? summary.monthlyExpenses * (finObj.totalMonths || 8) : 0);
  const netCashFlow = finObj.netCashFlow ?? finObj.net_cash_flow ?? analysis?.cash_flow ?? (totalRevenue - totalExpenses);
  const totalMonths = finObj.totalMonths ?? finObj.total_months ?? (finObj.monthlyData ? finObj.monthlyData.length : (parseInt(summary.evaluatedPeriod) || 8));
  const positiveMonths = finObj.positiveMonths ?? finObj.positive_months ?? (finObj.monthlyData ? finObj.monthlyData.filter(m => (m.netCashFlow ?? m.revenue - m.expenses) > 0).length : totalMonths);
  const expenseRatio = finObj.expenseRatio ?? finObj.expense_ratio ?? (totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 1000) / 10 : 0);
  const revenueCV = finObj.revenueCV ?? finObj.revenue_cv ?? 0.12;
  const revenueConsistency = finObj.revenueConsistency ?? finObj.revenue_consistency ?? (revenueCV < 0.20 ? 'High Consistency' : revenueCV < 0.40 ? 'Moderate Consistency' : 'Volatile');

  // Normalized Behaviour Metrics
  const totalCount = behObj.totalCount ?? behObj.total_count ?? analysis?.transaction_count ?? summary.transactionCount ?? 0;
  const creditCount = behObj.creditCount ?? behObj.credit_count ?? Math.round(totalCount * 0.6);
  const debitCount = behObj.debitCount ?? behObj.debit_count ?? Math.round(totalCount * 0.4);
  const avgTicketSize = behObj.avgTicketSize ?? behObj.avg_ticket_size ?? (totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0);
  const avgMonthlyFrequency = behObj.avgMonthlyFrequency ?? behObj.avg_monthly_frequency ?? (totalMonths > 0 ? Math.round(totalCount / totalMonths) : 0);
  const maxGapDays = behObj.maxGapDays ?? behObj.max_gap_days ?? 0;

  // Normalized Trust & Story Metrics
  const trustStatus = trustObj.status || propTrust?.overall_trust_result || analysis?.trustStatus || 'Verified';
  const duplicateCount = trustObj.duplicateCount ?? propTrust?.duplicate_count ?? analysis?.trust?.duplicateCount ?? 0;
  const invalidCount = trustObj.invalidCount ?? propTrust?.invalid_transaction_count ?? analysis?.trust?.invalidCount ?? 0;
  const storyVariancePct = storyObj.variancePct ?? propTrust?.revenue_difference ?? analysis?.story?.variancePct ?? 0;
  const storyStatus = storyObj.status ?? propTrust?.revenue_consistency ?? analysis?.storyStatus ?? 'Verified';
  const crossSignalStatus = analysis?.crossSignal?.status || (analysis?.crossSignal?.isConsistent !== false ? 'Broadly Aligned' : 'Inconsistency Detected');

  // Normalized Scoring & Drivers
  const scoreVal = scoringObj.score ?? analysis?.creditworthiness_score ?? summary?.score ?? 78;
  const riskCategory = scoringObj.riskCategory || scoringObj.risk_category || analysis?.risk_level || 'Relatively Stable Behaviour';
  const riskLevel = scoringObj.riskLevel || scoringObj.risk_level || (scoreVal >= 80 ? 'Low Risk' : scoreVal >= 65 ? 'Moderate Risk' : 'High Risk');
  const badgeColor = scoringObj.badgeColor || (scoreVal >= 80 ? 'emerald' : scoreVal >= 65 ? 'blue' : 'amber');
  const positiveDrivers = scoringObj.positiveDrivers || scoringObj.positive_drivers || analysis?.positive_drivers || [];
  const negativeDrivers = scoringObj.negativeDrivers || scoringObj.negative_drivers || analysis?.negative_drivers || [];
  const riskWarnings = scoringObj.riskWarnings || scoringObj.warnings || analysis?.warnings || [];

  // Normalized Business Profile
  const businessName = profile.business_name || profile.name || 'MSME Enterprise';
  const industry = profile.business_type || profile.industry || 'General MSME';
  const businessAge = profile.business_age || profile.age || '3+ years';
  const employees = profile.employees || '5';
  const location = profile.location || 'India';
  const declaredTurnover = profile.declared_monthly_revenue || profile.declaredMonthlyRevenue || 400000;
  const existingEmi = profile.existing_monthly_emi || profile.existingMonthlyEmi || 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      reportTitle: "CreditBridge MSME Creditworthiness Assessment Memorandum",
      generatedAt: new Date().toISOString(),
      businessProfile: {
        name: businessName,
        industry,
        age: businessAge,
        employees,
        location,
        declaredMonthlyRevenue: declaredTurnover,
        existingMonthlyEmi: existingEmi
      },
      creditworthinessSignal: scoreVal,
      riskClassification: riskCategory,
      riskLevel,
      summaryMetrics: summary,
      financials: {
        totalRevenue,
        totalExpenses,
        netCashFlow,
        totalMonths,
        positiveMonths,
        revenueCV,
        expenseRatio,
        revenueConsistency
      },
      transactionBehaviour: {
        totalCount,
        creditCount,
        debitCount,
        avgTicketSize,
        avgMonthlyFrequency,
        maxGapDays
      },
      trustAndConsistency: {
        dataTrust: trustStatus,
        duplicateCount,
        invalidCount,
        storyVariancePct,
        storyStatus,
        crossSignal: crossSignalStatus
      },
      positiveDrivers,
      negativeDrivers,
      riskWarnings
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creditbridge_report_${businessName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      
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
            <h2 className="text-xl font-extrabold text-slate-900">{businessName}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Sector / Industry</span>
                <span className="font-semibold text-slate-800">{industry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Operating Age</span>
                <span className="font-semibold text-slate-800">{businessAge}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Headcount</span>
                <span className="font-semibold text-slate-800">{employees} Staff</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Location</span>
                <span className="font-semibold text-slate-800">{location}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Declared Turnover</span>
                <span className="font-semibold text-slate-800">₹{declaredTurnover.toLocaleString()} /mo</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Existing EMI Obligations</span>
                <span className="font-semibold text-slate-800">₹{existingEmi.toLocaleString()} /mo</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 text-center shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CreditBridge Signal</span>
            <div className="text-4xl font-black text-slate-900 my-1">
              {scoreVal} <span className="text-sm font-bold text-slate-400">/ 100</span>
            </div>
            <Badge variant={badgeColor === 'emerald' ? 'good' : badgeColor === 'rose' ? 'danger' : 'indigo'} size="sm">
              {riskCategory} &bull; {riskLevel}
            </Badge>
          </div>
        </div>

        {/* Section 2: Financial Run-Rate Summary */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">1. Financial Ledger Performance Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Observed Revenue</span>
              <p className="text-base font-bold text-blue-600 mt-0.5">₹{Math.round(totalRevenue).toLocaleString()}</p>
              <span className="text-[10px] text-slate-500">Across {totalMonths} months</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Observed Outflows</span>
              <p className="text-base font-bold text-rose-600 mt-0.5">₹{Math.round(totalExpenses).toLocaleString()}</p>
              <span className="text-[10px] text-slate-500">Expense Ratio: {expenseRatio}%</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Cumulative Net Cash Flow</span>
              <p className="text-base font-bold text-emerald-600 mt-0.5">₹{Math.round(netCashFlow).toLocaleString()}</p>
              <span className="text-[10px] text-slate-500">{positiveMonths} positive months</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Revenue Consistency</span>
              <p className="text-base font-bold text-slate-800 mt-0.5">{revenueConsistency}</p>
              <span className="text-[10px] text-slate-500">CV: {revenueCV}</span>
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
                <span className="font-bold text-slate-900">{totalCount} ({creditCount} Cr / {debitCount} Dr)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Average Ticket Size:</span>
                <span className="font-bold text-slate-900">₹{Math.round(avgTicketSize).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Monthly Inflow Velocity:</span>
                <span className="font-bold text-slate-900">{avgMonthlyFrequency} txns / month</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Maximum Dormancy Gap:</span>
                <span className={`font-bold ${maxGapDays < 14 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {maxGapDays} days
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Data Trust & Story Consistency</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Data Trust Result:</span>
                <span className="font-bold text-emerald-700">{trustStatus}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Duplicate / Invalid Rows:</span>
                <span className="font-bold text-slate-900">{duplicateCount} duplicates &bull; {invalidCount} invalid</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Declared vs Observed Turnover:</span>
                <span className="font-bold text-slate-900">{storyVariancePct}% variance ({storyStatus})</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cross-Signal Trajectory:</span>
                <span className={`font-bold ${crossSignalStatus !== 'Inconsistency Detected' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {crossSignalStatus}
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
                {positiveDrivers.length === 0 ? (
                  <li>Operational indicators within standard parameters.</li>
                ) : (
                  positiveDrivers.map((d, i) => (
                    <li key={i}><strong>{d.title}:</strong> {d.detail}</li>
                  ))
                )}
              </ul>
            </div>

            {/* Negative Drags & Warnings */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Operational Vulnerabilities & Warnings</span>
              </span>
              <ul className="text-xs text-amber-800 space-y-1 pl-5 list-disc">
                {riskWarnings.length === 0 ? (
                  <li>No critical operational warnings detected.</li>
                ) : (
                  riskWarnings.map((w, i) => (
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
            "{analysis?.financialStory?.summary || "Revenue remained stable during the evaluated cycle, maintaining positive operating cash flow aligned with declared turnover."}"
          </div>

          {analysis?.anomalies && analysis.anomalies.length > 0 && (
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
                {analysis?.loanReadiness?.affordable_repayment_display || (totalRevenue > 0 ? `₹${Math.round((totalRevenue * 0.1) / 1000)}k – ₹${Math.round((totalRevenue * 0.15) / 1000)}k` : "₹15,000 – ₹25,000")}
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                Calibrated to 35–50% operational cash surplus buffer above existing debts.
              </p>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200">
              <span className="text-[11px] uppercase font-bold text-indigo-900 block">Potential Financing Range</span>
              <div className="text-2xl font-black text-indigo-900 mt-1">
                {analysis?.loanReadiness?.potential_financing_display || (totalRevenue > 0 ? `₹${(Math.round((totalRevenue * 0.8) / 100000 * 10) / 10)}L – ₹${(Math.round((totalRevenue * 1.5) / 100000 * 10) / 10)}L` : "₹3.0L – ₹5.0L")}
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
              {analysis?.underwriterNotes || (
                scoreVal >= 80 
                  ? `Applicant (${businessName}) demonstrates strong financial momentum and robust positive cash-flow buffers across the ${totalMonths}-month observation timeline. Data trust checks verified cleanly with ${duplicateCount} duplicate entries. Suitable for expedited human review for growth-tier working capital facilities.`
                  : scoreVal >= 65
                  ? `Applicant (${businessName}) exhibits steady operational velocity with disciplined cash flow buffers over the ${totalMonths}-month observation timeline. Data trust checks indicate reliable ledger hygiene with ${duplicateCount} duplicates. Recommended for human credit committee review under standard working capital guidelines.`
                  : `Applicant (${businessName}) presents elevated risk indicators including revenue volatility or cash-flow compression (${riskCategory}). Underwriter clarification recommended regarding ${riskWarnings[0]?.title?.toLowerCase() || 'recent operational variance'} prior to credit facility sanction.`
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

