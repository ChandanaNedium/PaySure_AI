import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import {
  Repeat,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function SubscriptionsPage() {
  const { showToast } = useDemo();
  const [subscriptions, setSubscriptions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const [subRes, metRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/subscriptions/metrics')
      ]);
      setSubscriptions(subRes.data);
      setMetrics(metRes.data);
    } catch (err) {
      console.error('Error fetching subscription data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleRescue = async (subId, action = 'TRIGGER_SMART_DUNNING') => {
    try {
      const res = await api.post(`/subscriptions/rescue/${subId}`, { action });
      showToast(res.data.message, 'success');
      fetchSubscriptions();
    } catch (err) {
      showToast('Error rescuing subscription', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Subscription Rescue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              SMART DUNNING ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recovers failed recurring subscription billing cycles, predicts subscriber churn, and coordinates graceful payment updates.
          </p>
        </div>

        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-soft transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Subscriptions</span>
        </button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase text-slate-400">Recurring MRR</span>
            <p className="text-2xl font-black text-brand-navy mt-1">${metrics.total_mrr.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{metrics.total_subscriptions} total subscriptions</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase text-slate-400">At-Risk MRR</span>
            <p className="text-2xl font-black text-rose-600 mt-1">${metrics.at_risk_mrr.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{metrics.past_due_count} past-due accounts</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase text-slate-400">Recovered MRR</span>
            <p className="text-2xl font-black text-indigo-600 mt-1">${metrics.recovered_mrr.toFixed(2)}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Rescued via Smart Dunning</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <span className="text-[10px] font-bold uppercase text-slate-400">Dunning Recovery Rate</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.recovery_rate_pct}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Churn prevention efficiency</p>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recurring Subscription Registry</h3>
            <p className="text-xs text-slate-500">Monitor recurring payment health and schedule retry workflows</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Subscription ID</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Churn Risk</th>
                <th className="py-3 px-4 text-right">Recovery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {s.paypal_sub_id}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {s.plan_name}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{s.customer_name}</p>
                    <p className="text-[11px] text-slate-400">{s.customer_email}</p>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ${s.amount.toFixed(2)}/mo
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : s.status === 'PAST_DUE'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${
                            s.churn_risk > 50 ? 'bg-rose-500' : s.churn_risk > 20 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${s.churn_risk}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-700">{s.churn_risk}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {s.status === 'PAST_DUE' ? (
                      <button
                        onClick={() => handleRescue(s.id, 'TRIGGER_SMART_DUNNING')}
                        className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Rescue Subscription</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Protected</span>
                    )}
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
