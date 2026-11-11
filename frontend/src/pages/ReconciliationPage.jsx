import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

/**
 * Returns true only when BOTH internal AND PayPal statuses are COMPLETED.
 * This is the single source of truth for reconciliation alignment.
 */
function isAligned(internal_status, paypal_status) {
  return internal_status === 'COMPLETED' && paypal_status === 'COMPLETED';
}

export default function ReconciliationPage() {
  const { showToast } = useDemo();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, sumRes] = await Promise.all([
        api.get('/reconciliation/records'),
        api.get('/reconciliation/summary')
      ]);
      setRecords(recRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Error fetching reconciliation data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReconcile = async (recordId, action = 'ALIGN_TO_PAYPAL') => {
    try {
      const res = await api.post(`/reconciliation/reconcile/${recordId}`, { action });
      showToast(res.data.message, 'success');
      fetchData();
    } catch (err) {
      showToast('Error reconciling record', 'error');
    }
  };

  // Compute ALIGNED / NOT ALIGNED counts from actual data
  const alignedCount = records.filter(r => isAligned(r.internal_status, r.paypal_status)).length;
  const notAlignedCount = records.length - alignedCount;
  const healthPct = records.length > 0 ? Math.round((alignedCount / records.length) * 100) : 0;

  const filteredRecords = records.filter((r) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ALIGNED') return isAligned(r.internal_status, r.paypal_status);
    if (filterType === 'NOT ALIGNED') return !isAligned(r.internal_status, r.paypal_status);
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Smart Ledger Reconciliation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              AUDIT COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated alignment between PayPal REST gateway captures and merchant database records.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-soft transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Synchronize Ledgers</span>
        </button>
      </div>

      {/* Summary KPI Cards — simplified ALIGNED / NOT ALIGNED view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-400">Reconciliation Health</span>
          <p className={`text-2xl font-black mt-1 ${healthPct === 100 ? 'text-emerald-600' : healthPct >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
            {healthPct}%
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Both states COMPLETED</p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-emerald-600">Aligned</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{alignedCount}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Internal = PayPal = COMPLETED</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-rose-600">Not Aligned</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{notAlignedCount}</p>
          <p className="text-[11px] text-rose-600 mt-0.5">Status mismatch detected</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Audited</span>
          <p className="text-2xl font-black text-brand-navy mt-1">{records.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Transaction event pairs</p>
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Reconciliation Event Registry</h3>
            <p className="text-xs text-slate-500">Compare internal states with PayPal API ground truth</p>
          </div>

          {/* Simplified Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'ALIGNED', 'NOT ALIGNED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterType === f ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-brand-paypal" />
              Loading reconciliation data...
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">PayPal Order ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Internal State</th>
                  <th className="py-3 px-4">PayPal Gateway State</th>
                  <th className="py-3 px-4">Reconciliation Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map((r) => {
                  const aligned = isAligned(r.internal_status, r.paypal_status);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {r.transaction_ref}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {r.paypal_order_id || 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ${r.amount.toFixed(2)}
                      </td>
                      {/* Internal State */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.internal_status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {r.internal_status}
                        </span>
                      </td>
                      {/* PayPal Gateway State */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.paypal_status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.paypal_status}
                        </span>
                      </td>
                      {/* ALIGNED / NOT ALIGNED status */}
                      <td className="py-3 px-4">
                        {aligned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            ALIGNED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            NOT ALIGNED
                          </span>
                        )}
                      </td>
                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {aligned || r.resolution_status === 'RESOLVED' ? (
                          <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aligned</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReconcile(r.id, 'ALIGN_TO_PAYPAL')}
                            className="px-3 py-1 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                          >
                            <ShieldCheck className="w-3 h-3 text-brand-cyan" />
                            <span>Align to PayPal</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
