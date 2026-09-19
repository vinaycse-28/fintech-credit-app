import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 no-print">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Decision-support signal only &bull; Not an official CIBIL/bureau score &bull; Human underwriter review mandatory.</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-4 mt-8 rounded-xl no-print">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-semibold text-slate-800">
            Responsible Underwriting & Regulatory AI Disclaimer
          </h4>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            CreditBridge is an explainable decision-support cockpit designed to help human credit officers evaluate credit-invisible MSMEs through cash-flow behavior and ledger consistency. 
            CreditBridge does <strong>not</strong> make automated loan approvals or rejections, does <strong>not</strong> access non-public bureau data, and is <strong>not</strong> a substitute for official credit bureau scores (e.g. CIBIL/Experian). All credit underwriting decisions rest exclusively with the designated human lender.
          </p>
        </div>
      </div>
    </div>
  );
}
