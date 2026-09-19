import React, { useState } from 'react';
import { 
  RefreshCw, 
  UploadCloud, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  RotateCcw,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function UpdateDataTab({ 
  onUploadTransactions, 
  onAddTransaction, 
  onReAnalyze,
  transactionCount = 0 
}) {
  const [activeSubTab, setActiveSubTab] = useState('manual');
  const [successMessage, setSuccessMessage] = useState('');
  const [manualTxn, setManualTxn] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    transaction_type: 'credit',
    category: 'Sales Revenue',
    payment_method: 'UPI',
    description: ''
  });

  const categories = {
    credit: ['Sales Revenue', 'Customer Inflow', 'Delivery Payouts', 'Bulk Order Advance', 'Other Income'],
    debit: ['Inventory Purchase', 'Supplier Settlement', 'Rent & Utilities', 'Staff Payroll', 'Operational Expenses', 'Equipment Repair']
  };

  const handleAddTxn = async (e) => {
    e.preventDefault();
    if (!manualTxn.amount || Number(manualTxn.amount) <= 0) return;
    await onAddTransaction(manualTxn);
    setSuccessMessage(`Transaction of ₹${Number(manualTxn.amount).toLocaleString()} added successfully.`);
    setManualTxn({
      ...manualTxn,
      amount: '',
      description: ''
    });
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.trim().split(/\r?\n/);
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          const dateIdx = headers.findIndex(h => h.includes('date'));
          const amtIdx = headers.findIndex(h => h.includes('amount'));
          const typeIdx = headers.findIndex(h => h.includes('type'));
          const methodIdx = headers.findIndex(h => h.includes('method'));
          const descIdx = headers.findIndex(h => h.includes('desc'));

          const parsed = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            const dateVal = cols[dateIdx];
            const amtVal = parseFloat(cols[amtIdx]);
            if (dateVal && !isNaN(amtVal)) {
              parsed.push({
                transaction_id: `TXN-UPD-${Date.now().toString().slice(-4)}-${i}`,
                date: dateVal,
                amount: amtVal,
                transaction_type: cols[typeIdx]?.toLowerCase().includes('deb') ? 'debit' : 'credit',
                payment_method: cols[methodIdx] || 'UPI',
                category: cols[typeIdx]?.toLowerCase().includes('deb') ? 'Supplier Settlement' : 'Sales Revenue',
                description: cols[descIdx] || 'Updated ledger transaction'
              });
            }
          }

          if (parsed.length > 0) {
            onUploadTransactions(parsed);
            setSuccessMessage(`Appended ${parsed.length} verified records to the active ledger.`);
            setTimeout(() => setSuccessMessage(''), 4000);
          }
        } catch (err) {
          console.error("Upload error", err);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Update Financial Data & Refresh Signals</h2>
          <p className="text-xs text-slate-500 mt-1">
            Append new synthetic transactions, check for duplicate rows, and execute an instant re-analysis of the business.
          </p>
        </div>

        <button
          onClick={onReAnalyze}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:shadow-lg shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Re-Analyze Business</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('manual')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'manual'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Add Single Transaction
        </button>
        <button
          onClick={() => setActiveSubTab('upload')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'upload'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upload Additional CSV Ledger
        </button>
      </div>

      {/* Option A: Manual Entry */}
      {activeSubTab === 'manual' && (
        <Card title="Add New Transaction Entry" subtitle="Directly append to the active evaluated ledger">
          <form onSubmit={handleAddTxn} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={manualTxn.date}
                  onChange={(e) => setManualTxn({ ...manualTxn, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="35000"
                  value={manualTxn.amount}
                  onChange={(e) => setManualTxn({ ...manualTxn, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type</label>
                <select
                  value={manualTxn.transaction_type}
                  onChange={(e) => setManualTxn({ 
                    ...manualTxn, 
                    transaction_type: e.target.value,
                    category: categories[e.target.value][0]
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="credit">Income / Credit (+)</option>
                  <option value="debit">Expense / Debit (-)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={manualTxn.category}
                  onChange={(e) => setManualTxn({ ...manualTxn, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-500"
                >
                  {categories[manualTxn.transaction_type]?.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={manualTxn.payment_method}
                  onChange={(e) => setManualTxn({ ...manualTxn, payment_method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. New customer contract advance"
                  value={manualTxn.description}
                  onChange={(e) => setManualTxn({ ...manualTxn, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Transaction</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Option B: CSV Upload */}
      {activeSubTab === 'upload' && (
        <Card title="Upload Supplementary Ledger CSV" subtitle="Bulk append records to existing dataset">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50">
            <UploadCloud className="w-10 h-10 mx-auto text-blue-500 mb-3" />
            <h4 className="text-xs font-bold text-slate-800">Select transaction CSV to append</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Duplicate records and rows with invalid dates will be automatically filtered out.
            </p>

            <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors mt-4">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Choose CSV File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </Card>
      )}

      {/* Quick Status Bar */}
      <div className="p-4 bg-slate-100 rounded-xl flex items-center justify-between text-xs text-slate-600">
        <span>Current Active Transactions: <strong>{transactionCount} records</strong></span>
        <button
          onClick={onReAnalyze}
          className="text-blue-600 font-bold hover:underline"
        >
          Re-calculate Score Now &rarr;
        </button>
      </div>

    </div>
  );
}
