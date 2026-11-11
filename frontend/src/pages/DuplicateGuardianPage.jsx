import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import {
  CopyX,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  RefreshCw,
  Search,
  Eye,
  Lock
} from 'lucide-react';

export default function DuplicateGuardianPage() {
  const { showToast } = useDemo();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/duplicates/alerts');
      setAlerts(res.data);
      if (res.data.length > 0 && !selectedAlert) {
        setSelectedAlert(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching duplicate alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const triggerScan = async () => {
    try {
      const res = await api.post('/duplicates/scan');
      showToast(res.data.message, 'info');
      fetchAlerts();
    } catch (err) {
      showToast('Scan error', 'error');
    }
  };

  const resolveAlert = async (alertId, action) => {
    try {
      const res = await api.post(`/duplicates/resolve/${alertId}`, { action });
      showToast(res.data.message, 'success');
      fetchAlerts();
      if (selectedAlert?.id === alertId) {
        setSelectedAlert({ ...selectedAlert, status: res.data.alert_status });
      }
    } catch (err) {
      showToast('Error resolving alert', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Duplicate Payment Guardian
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              IDEMPOTENCY SHIELD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time interception of rapid double-clicks, network re-submissions, and accidental multi-debits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={triggerScan}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-soft transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Recent Transactions</span>
          </button>
        </div>
      </div>

      {/* Main Split: Side-by-Side Comparison & Alert Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Side-by-Side Transaction Comparison */}
        <div className="lg:col-span-7 space-y-5">
          {selectedAlert ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Duplicate Collision Investigation
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    Comparison: {selectedAlert.original_tx_ref} vs {selectedAlert.duplicate_tx_ref}
                  </h3>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Similarity: {selectedAlert.similarity_score}%
                </span>
              </div>

              {/* Side-by-Side Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original Transaction */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-emerald-800">Original Attempt</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900">
                      Primary
                    </span>
                  </div>
                  <p className="font-mono text-xs font-black text-slate-900">{selectedAlert.original_tx_ref}</p>
                  <p className="text-lg font-black text-slate-900">${selectedAlert.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-600 truncate">{selectedAlert.customer_email}</p>
                  <div className="pt-2 border-t border-emerald-200/60 text-[10px] text-emerald-800">
                    Status: <span className="font-bold">COMPLETED & SETTLED</span>
                  </div>
                </div>

                {/* Duplicate Transaction */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-rose-800">Duplicate Candidate</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                      Flagged
                    </span>
                  </div>
                  <p className="font-mono text-xs font-black text-slate-900">{selectedAlert.duplicate_tx_ref}</p>
                  <p className="text-lg font-black text-slate-900">${selectedAlert.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-600 truncate">{selectedAlert.customer_email}</p>
                  <div className="pt-2 border-t border-rose-200/60 text-[10px] text-rose-800">
                    Delta: <span className="font-bold">+{selectedAlert.time_delta_seconds} seconds later</span>
                  </div>
                </div>
              </div>

              {/* Why Flagged Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Root Cause Diagnostics</span>
                <p className="text-xs text-slate-800 font-medium">
                  {selectedAlert.reason}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  PaySure Guardian intercepted this second capture intent using cryptographic token matching, ensuring the buyer's card was not debited twice.
                </p>
              </div>

              {/* Resolution Controls */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Status: <strong className="text-slate-800 uppercase">{selectedAlert.status}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAlert.status === 'DETECTED' ? (
                    <>
                      <button
                        onClick={() => resolveAlert(selectedAlert.id, 'REFUND_DUPLICATE')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Void / Refund Duplicate</span>
                      </button>
                      <button
                        onClick={() => resolveAlert(selectedAlert.id, 'CONFIRM_LEGITIMATE')}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                      >
                        Confirm Legitimate 2nd Purchase
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{selectedAlert.status}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              Select an alert from the right to inspect duplicate details.
            </div>
          )}
        </div>

        {/* Right Column: Active Duplicate Alerts Queue */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Duplicate Alerts Queue</h3>
              <p className="text-xs text-slate-500">Flagged by real-time interval heuristics</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {alerts.length} Flagged
            </span>
          </div>

          <div className="space-y-3">
            {alerts.map((al) => {
              const isSelected = selectedAlert?.id === al.id;
              return (
                <div
                  key={al.id}
                  onClick={() => setSelectedAlert(al)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{al.duplicate_tx_ref}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      al.status === 'DETECTED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {al.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold">{al.reason}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Amount: <strong>${al.amount.toFixed(2)}</strong></span>
                    <span>Gap: <strong>{al.time_delta_seconds}s</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
