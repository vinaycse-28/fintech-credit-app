import React from 'react';
import { 
  Activity, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import Card from '../common/Card';
import MetricCard from '../common/MetricCard';
import Badge from '../common/Badge';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

export default function TransactionBehaviourTab({ behaviour = {}, financials = {} }) {
  const paymentMix = behaviour.paymentMix || [];
  const gapAlerts = behaviour.gapAlerts || [];
  const monthly = financials.monthlyData || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Transaction Behaviour & Operational Regularity</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Micro-activity cadence, ticket-size distributions, channel digitalization, and dormancy gaps.
          </p>
        </div>
        <Badge variant={behaviour.maxGapDays < 14 ? "good" : "danger"} size="md">
          {behaviour.maxGapDays < 14 ? "Continuous Activity (<14d gap)" : `Dormancy Flagged (${behaviour.maxGapDays}d gap)`}
        </Badge>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Ticket Size"
          value={`₹${(behaviour.avgTicketSize || 0).toLocaleString()}`}
          subtitle="Mean transaction value"
          icon={Activity}
          iconColor="blue"
        />

        <MetricCard
          title="Monthly Frequency"
          value={`${behaviour.avgMonthlyFrequency || 0} / mo`}
          subtitle={`${behaviour.totalCount || 0} total entries`}
          icon={Layers}
          iconColor="indigo"
        />

        <MetricCard
          title="Max Dormancy Gap"
          value={`${behaviour.maxGapDays || 0} Days`}
          subtitle={behaviour.maxGapDays < 14 ? "Within 14-day threshold" : "Exceeds 14-day safety limit"}
          change={behaviour.maxGapDays < 14 ? "Regular Cadence" : "Dormancy Anomaly"}
          changeType={behaviour.maxGapDays < 14 ? "positive" : "negative"}
          icon={Clock}
          iconColor={behaviour.maxGapDays < 14 ? "emerald" : "rose"}
        />

        <MetricCard
          title="Income vs Expense Ratio"
          value={`${behaviour.creditCount || 0} Cr / ${behaviour.debitCount || 0} Dr`}
          subtitle="Count distribution"
          icon={Percent}
          iconColor="purple"
        />
      </div>

      {/* Largest Transaction Callout */}
      {behaviour.largestTransaction && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Single Largest Transaction on Record
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xl font-bold text-white">
                  ₹{Number(behaviour.largestTransaction.amount).toLocaleString()}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  behaviour.largestTransaction.transaction_type === 'credit' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {behaviour.largestTransaction.transaction_type === 'credit' ? 'Credit (Inflow)' : 'Debit (Outflow)'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {behaviour.largestTransaction.description} &bull; {behaviour.largestTransaction.date} ({behaviour.largestTransaction.payment_method})
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-slate-400 block">ID: {behaviour.largestTransaction.transaction_id}</span>
            <span className="text-xs text-slate-400">{behaviour.largestTransaction.category}</span>
          </div>
        </div>
      )}

      {/* Charts Row: Payment Mix Donut + Transaction Cadence Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Mix Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Payment Mix & Channel Digitalization</h3>
            <p className="text-xs text-slate-500 mt-0.5">UPI, Bank Transfers, and Cash collection distribution</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMix}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {paymentMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val, name, props) => [`${val} transactions (${props.payload.percent}%)`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {paymentMix.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500">
                  <span>{item.count} txns</span>
                  <span className="font-bold text-slate-800 w-10 text-right">{item.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Frequency / Seasonality Activity */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Monthly Transaction Volume Cadence</h3>
            <p className="text-xs text-slate-500 mt-0.5">Frequency per month highlighting seasonality and active trading periods</p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val) => [`${val} transactions`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="txnCount" name="Transactions Count" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Month: <strong>{financials.highestRevenueMonth?.name}</strong></span>
            <span>Average Velocity: <strong>{behaviour.avgMonthlyFrequency} entries / month</strong></span>
          </div>
        </div>

      </div>

      {/* Transaction Dormancy Gaps Alert Table */}
      <Card 
        title="Dormancy Gap Analysis" 
        subtitle="Tracking calendar periods with zero recorded transactions (Risk threshold: 14 days)"
      >
        {gapAlerts.length === 0 ? (
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs text-emerald-800">
              <span className="font-bold">No Dormancy Anomaly Detected.</span> The maximum gap between consecutive transactions was <strong>{behaviour.maxGapDays} days</strong>, which is well below the 14-day operational dormancy risk limit.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Operational Dormancy Alert Flagged:</span>
                <p className="mt-0.5 text-rose-700">
                  {gapAlerts.length} interval(s) exceeded the 14-day threshold. This may suggest unrecorded cash activities or supply disruptions.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Gap Duration</th>
                    <th className="px-4 py-2 font-semibold">Start Date</th>
                    <th className="px-4 py-2 font-semibold">End Date</th>
                    <th className="px-4 py-2 font-semibold">Underwriter Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gapAlerts.map((gap, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-bold text-rose-600">{gap.days} Days Dormant</td>
                      <td className="px-4 py-2 text-slate-700">{gap.startDate}</td>
                      <td className="px-4 py-2 text-slate-700">{gap.endDate}</td>
                      <td className="px-4 py-2 text-slate-500">Clarify seasonal holiday or off-book cash trading.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
