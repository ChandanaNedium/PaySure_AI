import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import SureEngineWorkflow from '../components/recovery/SureEngineWorkflow';
import RecommendationCard from '../components/recovery/RecommendationCard';
import RecoveryModal from '../components/recovery/RecoveryModal';
import { useDemo } from '../context/DemoContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Cpu,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function RecoveryPage({ initialTxRef }) {
  const { scenarios, activeScenario, selectScenario, showToast } = useDemo();
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await api.get('/transactions', { params });
      setTransactions(res.data);

      // Auto-select initial transaction if passed
      const targetRef = initialTxRef || activeScenario?.transaction_ref;
      if (targetRef) {
        const found = res.data.find((t) => t.transaction_ref === targetRef);
        if (found) {
          runAnalysis(found);
        } else if (res.data.length > 0) {
          runAnalysis(res.data[0]);
        }
      } else if (res.data.length > 0) {
        runAnalysis(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const runAnalysis = async (tx) => {
    setSelectedTx(tx);
    setIsAnalyzing(true);
    try {
      const res = await api.post(`/sure-engine/analyze/${tx.transaction_ref}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Error running SURE Engine analysis', err);
      showToast('Error analyzing transaction', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecoverySuccess = (result) => {
    // Refresh transaction list and update selected transaction status
    fetchTransactions();
    if (analysis) {
      setAnalysis({
        ...analysis,
        current_status: result.new_status
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Smart Payment Recovery
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-paypal text-white">
              CORE FEATURE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic state verification, failure diagnosis, and authorized recovery for the PayPal ecosystem.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-soft transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Active SURE Engine Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 6-Step Visual Workflow */}
        <div className="lg:col-span-7 space-y-6">
          <SureEngineWorkflow analysis={analysis} isAnalyzing={isAnalyzing} />
        </div>

        {/* Right Column: AI Recommendation Card */}
        <div className="lg:col-span-5 space-y-6">
          <RecommendationCard
            analysis={analysis}
            onOpenRecoveryModal={() => setModalOpen(true)}
          />

          {/* Transaction Metadata Quick Summary */}
          {selectedTx && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Transaction Profile
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer</span>
                  <p className="font-bold text-slate-800">{selectedTx.customer_name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{selectedTx.customer_email}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Amount</span>
                  <p className="font-extrabold text-slate-900 text-sm">
                    ${selectedTx.amount.toFixed(2)} <span className="text-[10px] text-slate-400">{selectedTx.currency}</span>
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Method</span>
                  <p className="font-semibold text-slate-700">{selectedTx.payment_method.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Idempotency Protection</span>
                  <p className="font-mono text-[10px] text-emerald-700 font-bold">
                    {selectedTx.idempotency_key || 'ACTIVE'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Queue & Search/Filter Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment Transactions Queue</h3>
            <p className="text-xs text-slate-500">
              Select any transaction below to trigger the 6-step SURE Engine verification flow.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['ALL', 'FAILED', 'UNCERTAIN', 'PENDING', 'RECOVERED', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchTransactions();
              }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, buyer..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Failure Diagnostic</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transactions.map((t) => {
                const isSelected = selectedTx?.transaction_ref === t.transaction_ref;
                return (
                  <tr
                    key={t.id}
                    className={`transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-brand-paypal' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => runAnalysis(t)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {t.transaction_ref}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{t.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{t.customer_email}</p>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ${t.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
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
                      ) : (
                        <span className="text-slate-400 text-[11px]">Normal</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          runAnalysis(t);
                        }}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ml-auto ${
                          isSelected
                            ? 'bg-brand-navy text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-brand-paypal hover:text-white'
                        }`}
                      >
                        <Cpu className="w-3 h-3 text-brand-cyan" />
                        <span>{isSelected ? 'Analyzing' : 'Analyze'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recovery Confirmation Modal */}
      <RecoveryModal
        analysis={analysis}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecoverySuccess={handleRecoverySuccess}
      />
    </div>
  );
}
