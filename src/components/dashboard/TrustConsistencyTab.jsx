import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Search,
  FileCheck
} from 'lucide-react';
import Card from '../common/Card';
import MetricCard from '../common/MetricCard';
import Badge from '../common/Badge';

export default function TrustConsistencyTab({ trustData = {} }) {
  const trust = trustData.trust || {};
  const story = trustData.story || {};
  const crossSignal = trustData.crossSignal || {};

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Data Trust & Story Consistency Auditor</h2>
            <Badge 
              variant={trust.badgeType === 'good' ? 'good' : trust.badgeType === 'danger' ? 'danger' : 'warning'} 
              size="lg"
            >
              {trust.status || 'High Data Trust'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Inspects internal ledger hygiene, chronologies, duplicate entries, self-declared turnover divergence, and cross-signal harmony before underwriting.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Trust Hygiene Score</span>
            <span className="text-xl font-extrabold text-slate-900">{trust.score || 95}%</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3 Core Trust Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Pillar 1: Data Trust & Ledger Hygiene */}
        <Card 
          title="1. Ledger Hygiene & Integrity" 
          subtitle="Timestamp verification & duplicate check"
          action={
            <Badge variant={trust.badgeType === 'good' ? 'good' : trust.badgeType === 'danger' ? 'danger' : 'warning'} size="sm">
              {trust.badgeType === 'good' ? 'Good' : trust.badgeType === 'danger' ? 'Needs Review' : 'Warning'}
            </Badge>
          }
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Duplicate Transactions:</span>
              <span className={`font-bold ${trust.duplicateCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trust.duplicateCount || 0} duplicates
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Invalid / Future Dates:</span>
              <span className={`font-bold ${trust.invalidCount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trust.invalidCount || 0} flagged
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Repeated Amount Clustering:</span>
              <span className={`font-bold ${Number(trust.repeatedAmountRatio) < 25 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {trust.repeatedAmountRatio || 0}% max share
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Ledger Completeness:</span>
              <span className="font-bold text-slate-800">{trust.completeness || 100}%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {trust.status === 'High Data Trust' 
              ? '✓ No suspicious clustering, zero duplicated IDs, valid chronological progression.'
              : '⚠️ Potential anomalies detected in ledger timestamps or duplicate entries.'}
          </div>
        </Card>

        {/* Pillar 2: Financial Story Consistency ⭐ */}
        <Card 
          title="2. Financial Story Check" 
          subtitle="Self-declared vs. observed revenue"
          action={
            <Badge variant={story.badgeType === 'good' ? 'good' : story.badgeType === 'danger' ? 'danger' : 'warning'} size="sm">
              {story.status || 'Consistent'}
            </Badge>
          }
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Declared Monthly Turnover:</span>
              <span className="font-bold text-slate-900">
                ₹{(story.declaredRevenue || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Observed Average Inflow:</span>
              <span className="font-bold text-blue-600">
                ₹{(story.observedRevenue || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Turnover Divergence:</span>
              <span className={`font-bold ${
                story.variancePct < 15 ? 'text-emerald-600' : story.variancePct <= 30 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {story.variancePct || 0}% Variance
              </span>
            </div>

            {/* Visual Variance Progress Bar */}
            <div className="pt-1">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    story.variancePct < 15 ? 'bg-emerald-500' : story.variancePct <= 30 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (story.variancePct || 0) * 2)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Exact)</span>
                <span>15% (Threshold)</span>
                <span>30%+ (Inconsistent)</span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            {story.detail}
          </p>
        </Card>

        {/* Pillar 3: Cross-Signal Alignment ⭐ */}
        <Card 
          title="3. Cross-Signal Consistency" 
          subtitle="Trajectory triangulation check"
          action={
            <Badge variant={crossSignal.badgeType === 'good' ? 'good' : crossSignal.badgeType === 'danger' ? 'danger' : 'warning'} size="sm">
              {crossSignal.badgeType === 'good' ? 'Aligned' : 'Divergent'}
            </Badge>
          }
        >
          <div className="space-y-3">
            {crossSignal.signals?.map((sig) => (
              <div key={sig.name} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">{sig.name}</span>
                <div className="flex items-center gap-1.5 font-bold">
                  {sig.direction === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />}
                  {sig.direction === 'down' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />}
                  {sig.direction === 'flat' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                  <span className={sig.direction === 'up' ? 'text-emerald-700' : sig.direction === 'down' ? 'text-rose-700' : 'text-slate-700'}>
                    {sig.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
            {crossSignal.explanation}
          </div>
        </Card>

      </div>

      {/* Detailed Automated Integrity Checklist */}
      <Card title="Automated Ledger Audit Checklist" subtitle="Granular algorithmic rules executed on the raw transaction entries">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trust.checks?.map((check, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-start gap-3">
              <div className="mt-0.5">
                {check.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{check.label}</h4>
                  <Badge variant={check.passed ? "good" : "warning"} size="sm">
                    {check.passed ? "Passed" : "Flagged"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
