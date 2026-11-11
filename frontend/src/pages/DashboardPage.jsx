import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import {
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CopyX,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Cpu,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function DashboardPage({ onNavigate, onSelectTransactionForRecovery }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/dashboard');
      setMetrics(res.data);
    } catch (err) {
      console.error('Error fetching dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-paypal animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading payment intelligence metrics...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#0070BA', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Payment Intelligence Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-cyan/20 text-brand-darkNavy">
              LIVE RECOVERY ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring, SURE Engine recovery pipelines, and PayPal ledger reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('recovery')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-brand-navy/20 transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Open Smart Recovery</span>
          </button>
          <button
            onClick={fetchMetrics}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recovered Revenue - Highlighted */}
        <StatCard
          title="Revenue Recovered"
          value={`$${(metrics?.total_recovered_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtext="Saved by SURE Engine actions"
          icon={ShieldCheck}
          trend="+18.4%"
          trendType="positive"
          highlight={true}
          badgeText="PaySure Impact"
        />

        <StatCard
          title="Recovery Success Rate"
          value={`${metrics?.recovery_success_rate || 0}%`}
          subtext="Resolution of recoverable payments"
          icon={TrendingUp}
          trend="+4.2%"
          trendType="positive"
        />

        <StatCard
          title="Duplicate Interceptions"
          value={metrics?.duplicate_alerts_count || 0}
          subtext="Double charges prevented"
          icon={CopyX}
          trend="Protected"
          trendType="positive"
        />

        <StatCard
          title="Processed Volume"
          value={`$${(metrics?.total_volume || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtext={`${metrics?.total_transactions || 0} total transactions`}
          icon={DollarSign}
        />
      </div>

      {/* Secondary Status Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-400">Completed Payments</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{metrics?.completed_transactions}</p>
          <span className="text-[10px] text-slate-500">Settled on PayPal</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-400">Failed / Declined</span>
          <p className="text-xl font-bold text-rose-600 mt-1">{metrics?.failed_transactions}</p>
          <span className="text-[10px] text-slate-500">Requires diagnostic review</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-400">Pending Clearing</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{metrics?.pending_transactions}</p>
          <span className="text-[10px] text-slate-500">ACH / Bank eCheck clearing</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-400">Recovered Payments</span>
          <p className="text-xl font-bold text-indigo-600 mt-1">{metrics?.recovered_transactions}</p>
          <span className="text-[10px] text-slate-500">Successfully revived</span>
        </div>
      </div>

      {/* Charts Section: 7-Day Performance & Failure Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Payment Volume & Recovery Trend</h3>
              <p className="text-xs text-slate-500">Successful, Recovered, and Failed amounts over past 7 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-brand-paypal">
                <span className="h-2 w-2 rounded-full bg-brand-paypal"></span> Settled
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Recovered
              </span>
              <span className="flex items-center gap-1.5 text-rose-500">
                <span className="h-2 w-2 rounded-full bg-rose-400"></span> Failed
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics?.volume_by_day || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSettled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070BA" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0070BA" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  formatter={(value) => [`$${value}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Area type="monotone" dataKey="successful" stroke="#0070BA" strokeWidth={2} fillOpacity={1} fill="url(#colorSettled)" name="Settled" />
                <Area type="monotone" dataKey="recovered" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecovered)" name="Recovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Cause Breakdown */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Failure Diagnostics</h3>
            <p className="text-xs text-slate-500">Top causes of transaction disruptions</p>
          </div>

          <div className="space-y-3 pt-2">
            {(metrics?.failure_distribution || []).map((f, i) => (
              <div key={f.code} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{f.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{f.code}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {f.count} cases
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('failure-detective')}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <span>Explore Failure Detective</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Generated Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(metrics?.ai_insights || []).map((insight) => (
          <div
            key={insight.id}
            className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 via-brand-navy to-slate-800 text-white border border-brand-paypal/30 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                  <Sparkles className="w-3 h-3" />
                  AI Intelligence Alert
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                  insight.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {insight.priority} Priority
                </span>
              </div>
              <h4 className="text-xs font-bold text-white">{insight.title}</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed">{insight.description}</p>
            </div>

            <button
              onClick={() => onNavigate('recovery')}
              className="mt-3 pt-2 border-t border-white/10 text-[11px] font-bold text-brand-cyan hover:underline flex items-center gap-1"
            >
              <span>Take Action in SURE Engine</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Recent Transaction Activity Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transaction Activity</h3>
            <p className="text-xs text-slate-500">Live monitoring of PayPal charges and recovery states</p>
          </div>

          <button
            onClick={() => onNavigate('recovery')}
            className="text-xs font-bold text-brand-paypal hover:underline flex items-center gap-1"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Diagnostic Flag</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(metrics?.recent_transactions || []).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {t.transaction_ref}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800 leading-tight">{t.customer_name}</p>
                    <p className="text-[11px] text-slate-400">{t.customer_email}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ${t.amount.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">{t.currency}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {t.payment_method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="py-3 px-4">
                    {t.failure_code ? (
                      <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {t.failure_code}
                      </span>
                    ) : t.duplicate_flag ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Duplicate Flag
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Clean</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectTransactionForRecovery(t.transaction_ref)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-brand-paypal hover:text-white text-brand-paypal text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                    >
                      <Cpu className="w-3 h-3" />
                      <span>SURE Analyze</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
