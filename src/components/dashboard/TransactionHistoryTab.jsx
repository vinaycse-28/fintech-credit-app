import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { getTransactions } from '../../services/api';

export default function TransactionHistoryTab({ businessId = null }) {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'
  const [categories, setCategories] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const MONTH_OPTIONS = [
    { value: 'all', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const fetchTxns = async () => {
    setLoading(true);
    try {
      const res = await getTransactions({
        search,
        type: typeFilter,
        category: categoryFilter,
        year: yearFilter,
        month: monthFilter,
        page,
        pageSize,
        businessId
      });
      setTransactions(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      if (res.categories) setCategories(res.categories);
      if (res.years && res.years.length > 0) {
        setAvailableYears(prev => Array.from(new Set([...prev, ...res.years])).sort((a, b) => b - a));
      } else if (res.items && res.items.length > 0) {
        const extracted = Array.from(new Set(
          res.items.map(t => {
            if (!t.date) return null;
            const y = String(t.date).split('-')[0];
            return (y && y.length === 4 && !isNaN(y)) ? y : null;
          }).filter(Boolean)
        )).sort((a, b) => b - a);
        if (extracted.length > 0) {
          setAvailableYears(prev => Array.from(new Set([...prev, ...extracted])).sort((a, b) => b - a));
        }
      }
    } catch (e) {
      console.error("Failed to load transactions", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxns();
  }, [page, typeFilter, categoryFilter, yearFilter, monthFilter, search]);

  // Client-side sort toggle
  const sortedTransactions = [...transactions].sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);
    return sortOrder === 'asc' ? da - db : db - da;
  });

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["transaction_id", "date", "amount", "transaction_type", "payment_method", "category", "description"];
    const rows = transactions.map(t => [
      t.transaction_id,
      t.date,
      t.amount,
      t.transaction_type,
      t.payment_method,
      `"${t.category || ''}"`,
      `"${t.description || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `creditbridge_transactions_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Transaction History & Ledger Audit</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewing individual credit and debit operations across all integrated banking channels.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          
          {/* Search Input */}
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search description, ID, method..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Year Filter */}
          <div className="sm:col-span-2">
            <select
              value={yearFilter}
              onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="sm:col-span-2">
            <select
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types (Inflow & Outflow)</option>
              <option value="credit">Income / Credit (+)</option>
              <option value="debit">Expense / Debit (-)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort Date Toggle */}
          <div className="sm:col-span-1 flex items-center justify-end">
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="w-full py-2 px-2 rounded-xl border border-slate-300 hover:bg-slate-50 flex items-center justify-center text-slate-600 text-xs font-medium transition-colors"
              title={`Sorted ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
              <span className="text-[10px] font-bold uppercase">{sortOrder}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Table Card */}
      <Card noPadding>
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
              <tr>
                <th className="px-5 py-3 font-semibold">Transaction ID</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold text-right">Amount</th>
                <th className="px-5 py-3 font-semibold">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Loading ledger transactions...</span>
                  </td>
                </tr>
              ) : sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No transactions match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((txn, idx) => {
                  const isCredit = txn.transaction_type === 'credit' || txn.transaction_type === 'income';
                  return (
                    <tr key={txn.transaction_id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-500">
                        {txn.transaction_id}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-slate-700 font-medium">
                        {txn.date}
                      </td>
                      <td className="px-5 py-3 text-slate-800 font-medium max-w-[220px] truncate">
                        {txn.description}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {txn.category || 'General'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCredit 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {isCredit ? 'Credit (+)' : 'Debit (-)'}
                        </span>
                      </td>
                      <td className={`px-5 py-3 text-right font-bold whitespace-nowrap ${
                        isCredit ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        ₹{Number(txn.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                          {txn.payment_method || 'UPI'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <span className="font-bold">{Math.min(total, (page - 1) * pageSize + 1)}</span> to{' '}
            <span className="font-bold">{Math.min(total, page * pageSize)}</span> of{' '}
            <span className="font-bold">{total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className={`p-1.5 rounded-lg border text-slate-600 transition-colors ${
                page <= 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 hover:bg-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className={`p-1.5 rounded-lg border text-slate-600 transition-colors ${
                page >= totalPages ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-300 hover:bg-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

    </div>
  );
}
