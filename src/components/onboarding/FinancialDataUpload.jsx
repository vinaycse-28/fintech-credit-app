import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Download, 
  FileCheck,
  RefreshCw,
  Sparkles,
  Calendar,
  CreditCard,
  IndianRupee
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { DEMO_TRANSACTIONS } from '../../services/mockData';

export default function FinancialDataUpload({
  transactions = [],
  onUploadTransactions,
  onAddTransaction,
  onAnalyze,
  onBack
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manual'
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [validationSummary, setValidationSummary] = useState(null);

  // Manual Transaction Form state
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

  // CSV Parser with validation
  const parseCSV = (text, name) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setUploadError('CSV file is empty or missing data rows.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Expected fields
      const dateIdx = headers.findIndex(h => h.includes('date'));
      const amtIdx = headers.findIndex(h => h.includes('amount'));
      const typeIdx = headers.findIndex(h => h.includes('type'));
      const methodIdx = headers.findIndex(h => h.includes('method') || h.includes('payment'));
      const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('description'));
      const catIdx = headers.findIndex(h => h.includes('category'));
      const idIdx = headers.findIndex(h => h.includes('id'));

      if (dateIdx === -1 || amtIdx === -1) {
        setUploadError('CSV must include at least "date" and "amount" columns.');
        return;
      }

      const parsed = [];
      let invalidCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        
        const dateVal = cols[dateIdx];
        const amtVal = parseFloat(cols[amtIdx]);
        const typeVal = typeIdx !== -1 ? cols[typeIdx]?.toLowerCase() : 'credit';
        const methodVal = methodIdx !== -1 ? cols[methodIdx] : 'UPI';
        const descVal = descIdx !== -1 ? cols[descIdx] : 'Transaction entry';
        const catVal = catIdx !== -1 ? cols[catIdx] : (typeVal === 'credit' ? 'Sales Revenue' : 'General Expense');
        const idVal = idIdx !== -1 ? cols[idIdx] : `TXN-CSV-${i.toString().padStart(4, '0')}`;

        if (!dateVal || isNaN(amtVal) || amtVal <= 0) {
          invalidCount++;
          continue;
        }

        parsed.push({
          transaction_id: idVal,
          date: dateVal,
          amount: amtVal,
          transaction_type: typeVal.includes('deb') || typeVal.includes('exp') ? 'debit' : 'credit',
          payment_method: methodVal || 'UPI',
          category: catVal,
          description: descVal
        });
      }

      if (parsed.length === 0) {
        setUploadError('No valid transaction rows found in CSV.');
        return;
      }

      setFileName(name);
      setUploadError('');
      setValidationSummary({
        total: parsed.length,
        invalid: invalidCount,
        valid: parsed.length
      });

      onUploadTransactions(parsed);
    } catch (err) {
      setUploadError(`Failed to parse CSV: ${err.message}`);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => parseCSV(event.target.result, file.name);
      reader.readAsText(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => parseCSV(event.target.result, file.name);
      reader.readAsText(file);
    }
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (!manualTxn.amount || Number(manualTxn.amount) <= 0) return;
    onAddTransaction(manualTxn);
    setManualTxn({
      ...manualTxn,
      amount: '',
      description: ''
    });
  };

  // Quick-load demo sets
  const loadQuickDataset = (type) => {
    const data = DEMO_TRANSACTIONS[type];
    if (data) {
      setFileName(`${type}_synthetic_ledger.csv`);
      setValidationSummary({
        total: data.length,
        invalid: 0,
        valid: data.length
      });
      onUploadTransactions(data);
    }
  };

  // Download Sample CSV template
  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "transaction_id,date,amount,transaction_type,payment_method,category,description\n" +
      "TXN001,2026-01-05,25000,credit,UPI,Sales Revenue,Counter customer sales\n" +
      "TXN002,2026-01-08,8000,debit,Bank Transfer,Supplier Settlement,Raw goods vendor settlement\n" +
      "TXN003,2026-01-14,32000,credit,UPI,Sales Revenue,Weekly wholesale supply\n" +
      "TXN004,2026-01-20,12000,debit,UPI,Rent & Utilities,Commercial space electricity & rent\n" +
      "TXN005,2026-01-28,41000,credit,Bank Transfer,Customer Inflow,Contract billing payout";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "creditbridge_sample_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate quick summary metrics
  const totalInflow = transactions
    .filter(t => t.transaction_type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalOutflow = transactions
    .filter(t => t.transaction_type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netCushion = totalInflow - totalOutflow;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Onboarding Stepper Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-xl font-bold text-slate-900">Add Financial Data</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provide transaction ledgers either by uploading a synthetic CSV or entering entries manually.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upload Synthetic CSV
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'manual' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Add Manually
          </button>
        </div>
      </div>

      {/* Option 1: CSV Drag & Drop Area */}
      {activeTab === 'upload' && (
        <div className="space-y-5">
          <Card>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-2xs">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Drag and drop your transaction CSV here
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                File must include date, amount, transaction_type (credit/debit), and payment_method.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Browse Local File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Quick Preset Buttons for Instant Evaluation */}
              <div className="mt-6 pt-5 border-t border-slate-200/80">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Or Instantly Load Pre-Built MSME Datasets:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadQuickDataset('shree_retail')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                  >
                    Shree Retail (Stable &bull; 8 mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadQuickDataset('urban_foods')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold transition-colors"
                  >
                    Urban Foods (High Growth &bull; 6 mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadQuickDataset('metro_electronics')}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-semibold transition-colors"
                  >
                    Metro Electronics (Risk &bull; Spike & Gap)
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Error Alert */}
            {uploadError && (
              <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Validation & File Confirmation */}
            {fileName && validationSummary && (
              <div className="mt-4 p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">{fileName}</span>
                    <p className="text-[11px] text-slate-500">
                      Validated {validationSummary.valid} rows successfully.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="good" size="sm">
                    {validationSummary.valid} Valid Rows
                  </Badge>
                  {validationSummary.invalid > 0 && (
                    <Badge variant="danger" size="sm">
                      {validationSummary.invalid} Invalid Rows Ignored
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Option 2: Add Transactions Manually */}
      {activeTab === 'manual' && (
        <Card title="Add Transaction Manually" subtitle="Append individual cash or digital records to the evaluated ledger">
          <form onSubmit={handleAddManual} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={manualTxn.date}
                  onChange={(e) => setManualTxn({ ...manualTxn, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="25000"
                    value={manualTxn.amount}
                    onChange={(e) => setManualTxn({ ...manualTxn, amount: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction Type <span className="text-rose-500">*</span>
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={manualTxn.payment_method}
                  onChange={(e) => setManualTxn({ ...manualTxn, payment_method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counter sale receipt"
                  value={manualTxn.description}
                  onChange={(e) => setManualTxn({ ...manualTxn, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Transaction</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Transaction Preview Table & Ledger Statistics */}
      <div className="mt-8 space-y-4">
        
        {/* Ledger Inflow/Outflow Totals Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">Total Inflows (Credits)</span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">₹{totalInflow.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">Total Outflows (Debits)</span>
            <p className="text-lg font-bold text-rose-600 mt-0.5">₹{totalOutflow.toLocaleString()}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-medium">Net Ledger Cushion</span>
            <p className={`text-lg font-bold mt-0.5 ${netCushion >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
              ₹{netCushion.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Preview Table Card */}
        <Card 
          title={`Transaction Preview (${transactions.length} Records)`} 
          subtitle="Recent transactions ready for data trust and behavioral scoring analysis"
          noPadding
        >
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No transactions loaded yet. Upload a CSV or choose a pre-built demo business above.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Date</th>
                    <th className="px-4 py-2.5 font-semibold">Description</th>
                    <th className="px-4 py-2.5 font-semibold">Category</th>
                    <th className="px-4 py-2.5 font-semibold">Type</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                    <th className="px-4 py-2.5 font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 20).map((t, idx) => {
                    const isCredit = t.transaction_type === 'credit' || t.transaction_type === 'income';
                    return (
                      <tr key={t.transaction_id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{t.date}</td>
                        <td className="px-4 py-2 font-medium text-slate-800 max-w-[200px] truncate">
                          {t.description || 'Transaction'}
                        </td>
                        <td className="px-4 py-2 text-slate-500">{t.category || 'General'}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {isCredit ? 'Credit (+)' : 'Debit (-)'}
                          </span>
                        </td>
                        <td className={`px-4 py-2 text-right font-semibold whitespace-nowrap ${
                          isCredit ? 'text-emerald-600' : 'text-slate-800'
                        }`}>
                          ₹{Number(t.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-slate-500">
                          <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {t.payment_method || 'UPI'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {transactions.length > 20 && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
              Showing first 20 of {transactions.length} transactions. All {transactions.length} rows will be processed.
            </div>
          )}
        </Card>

        {/* Final Navigation & Action Trigger */}
        <div className="pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </button>

          <button
            type="button"
            disabled={transactions.length === 0}
            onClick={onAnalyze}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-bold shadow-md transition-all ${
              transactions.length === 0 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Analyze Business & Generate Signal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
