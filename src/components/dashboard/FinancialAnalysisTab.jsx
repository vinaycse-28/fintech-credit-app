import React, { useState } from 'react';
import { 
  TrendingUp, 
  Receipt, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Info
} from 'lucide-react';
import Card from '../common/Card';
import MetricCard from '../common/MetricCard';
import Badge from '../common/Badge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function FinancialAnalysisTab({ financials = {} }) {
  const [chartType, setChartType] = useState('all'); // 'all' | 'revenue' | 'expenses' | 'cashflow'

  const monthly = financials.monthlyData || [];
  const spikes = financials.expenseSpikes || [];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Financial Run-Rate & Cash Flow Dynamics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating multi-month revenue predictability, debit velocity, and operating cushions.
          </p>
        </div>

        {/* Chart View Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Consolidated' },
            { id: 'revenue', label: 'Revenue Only' },
            { id: 'expenses', label: 'Expenses Only' },
            { id: 'cashflow', label: 'Net Cash Flow' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setChartType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                chartType === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Average Monthly Revenue"
          value={`₹${Math.round(financials.avgMonthlyRevenue || 0).toLocaleString()}`}
          subtitle={`Consistency: ${financials.revenueConsistency || 'High'}`}
          change={`${financials.revenueGrowth >= 0 ? '+' : ''}${financials.revenueGrowth || 0}% Growth`}
          changeType={financials.revenueGrowth >= 0 ? "positive" : "negative"}
          icon={TrendingUp}
          iconColor="blue"
        />

        <MetricCard
          title="Average Monthly Expenses"
          value={`₹${Math.round(financials.avgMonthlyExpenses || 0).toLocaleString()}`}
          subtitle={`Expense Ratio: ${financials.expenseRatio || 0}% of turnover`}
          change={financials.expenseRatio <= 85 ? "Healthy Margin" : "High Expense Pressure"}
          changeType={financials.expenseRatio <= 85 ? "positive" : "negative"}
          icon={Receipt}
          iconColor="amber"
        />

        <MetricCard
          title="Average Monthly Net Cash Flow"
          value={`₹${Math.round(financials.avgMonthlyCashFlow || 0).toLocaleString()}`}
          subtitle={`${financials.positiveMonths || 0} of ${financials.totalMonths || 0} positive months`}
          change={financials.positiveMonths >= (financials.totalMonths * 0.75) ? "Disciplined Cushion" : "Tight Cushion"}
          changeType={financials.positiveMonths >= (financials.totalMonths * 0.75) ? "positive" : "negative"}
          icon={DollarSign}
          iconColor="emerald"
        />
      </div>

      {/* Secondary Metric Highlights: High/Low Months & Spikes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Peak Revenue Month</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-900">{financials.highestRevenueMonth?.name || 'N/A'}</span>
            <span className="text-sm font-semibold text-emerald-600">
              ₹{(financials.highestRevenueMonth?.revenue || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lean Revenue Month</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base font-bold text-slate-900">{financials.lowestRevenueMonth?.name || 'N/A'}</span>
            <span className="text-sm font-semibold text-slate-700">
              ₹{(financials.lowestRevenueMonth?.revenue || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Expense Spike Detection</span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-base font-bold text-slate-900">
              {spikes.length === 0 ? "0 Spikes Flagged" : `${spikes.length} Spike Detected`}
            </span>
            <Badge variant={spikes.length === 0 ? "good" : "danger"} size="sm">
              {spikes.length === 0 ? "Normal Limits" : "Exceeds 1.8σ"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Primary Chart Area */}
      <Card 
        title={
          chartType === 'revenue' ? "Monthly Revenue Performance (Credits)" :
          chartType === 'expenses' ? "Monthly Debit Outgoings (Debits)" :
          chartType === 'cashflow' ? "Net Operating Cash Flow Trajectory" :
          "Inflow vs Outflow vs Net Cash Flow"
        }
        subtitle="Aggregated time-series trend across the evaluated loan duration"
      >
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'revenue' ? (
              <BarChart data={monthly} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartType === 'expenses' ? (
              <AreaChart data={monthly} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Expenses']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="expenses" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            ) : chartType === 'cashflow' ? (
              <BarChart data={monthly} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Net Cash Flow']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="netCashFlow" radius={[4, 4, 0, 0]} fill="#10B981" />
              </BarChart>
            ) : (
              <BarChart data={monthly} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Inflows (Revenue)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Outflows (Debits)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netCashFlow" name="Net Cash Flow" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly Breakdown Data Table */}
      <Card title="Month-by-Month Ledger Aggregation" subtitle="Exact computed figures per calendar cycle" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Month</th>
                <th className="px-5 py-3 font-semibold text-right">Inflows (Revenue)</th>
                <th className="px-5 py-3 font-semibold text-right">Outflows (Debits)</th>
                <th className="px-5 py-3 font-semibold text-right">Net Cash Flow</th>
                <th className="px-5 py-3 font-semibold text-center">Cash Status</th>
                <th className="px-5 py-3 font-semibold text-right">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthly.map((m) => {
                const isPositive = m.netCashFlow >= 0;
                return (
                  <tr key={m.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-800">{m.name}</td>
                    <td className="px-5 py-3 text-right font-semibold text-blue-600">
                      ₹{m.revenue.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-rose-600">
                      ₹{m.expenses.toLocaleString()}
                    </td>
                    <td className={`px-5 py-3 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isPositive ? '+' : ''}₹{m.netCashFlow.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={isPositive ? "good" : "warning"} size="sm">
                        {isPositive ? "Surplus" : "Deficit"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right text-slate-600 font-medium">
                      {m.txnCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
