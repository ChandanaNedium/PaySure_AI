import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import SureEngineWorkflow from '../components/recovery/SureEngineWorkflow';
import RecommendationCard from '../components/recovery/RecommendationCard';
import RecoveryModal from '../components/recovery/RecoveryModal';
import { useDemo } from '../context/DemoContext';
import {
  Search,
  Cpu,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';

export default function RecoveryPage({ initialTxRef }) {
  const { activeScenario, showToast } = useDemo();
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const analysisRef = useRef(null);

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
      showToast('Could not load transactions. Please check that the backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const runAnalysis = async (tx) => {
    setSelectedTx(tx);
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalyzeError(null);
    // Scroll to analysis panel
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    try {
      const res = await api.post(`/sure-engine/analyze/${tx.transaction_ref}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Error running SURE Engine analysis', err);
      const errMsg = err?.response?.data?.detail || 'Analysis failed. The backend may be unavailable.';
      setAnalyzeError(errMsg);
      showToast(`Analysis error: ${errMsg}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRecoverySuccess = (result) => {
    fetchTransactions();
    if (analysis) {
      setAnalysis({ ...analysis, current_status: result.new_status });
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

      {/* ===== Analysis Results Panel ===== */}
      <div ref={analysisRef} className="space-y-4">
        {/* Error state */}
        {analyzeError && !isAnalyzing && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-800">Analysis Failed</p>
              <p className="text-xs text-rose-600 mt-0.5">{analyzeError}</p>
            </div>
            <button onClick={() => setAnalyzeError(null)} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Transaction info banner when a tx is selected */}
        {selectedTx && (
          <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-paypal" />
              <span className="font-bold text-brand-navy">Analyzing:</span>
              <span className="font-mono font-bold text-brand-paypal">{selectedTx.transaction_ref}</span>
            </div>
            <div className="flex items-center gap-4 text-slate-600">
              <span>
                <span className="text-slate-400">Customer:</span> <strong>{selectedTx.customer_name}</strong>
              </span>
              <span>
                <span className="text-slate-400">Amount:</span>{' '}
                <strong className="text-slate-900">${selectedTx.amount.toFixed(2)} {selectedTx.currency}</strong>
              </span>
              <span>
                <span className="text-slate-400">Method:</span>{' '}
                <strong>{selectedTx.payment_method.replace(/_/g, ' ')}</strong>
              </span>
              <StatusBadge status={selectedTx.status} />
            </div>
          </div>
        )}

        {/* Show analysis results once available */}
        {(isAnalyzing || analysis) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: 6-Step Visual Workflow */}
            <div className="lg:col-span-7 space-y-6">
              <SureEngineWorkflow analysis={analysis} isAnalyzing={isAnalyzing} />
            </div>

            {/* Right Column: AI Recommendation Card + Summary */}
            <div className="lg:col-span-5 space-y-6">
              <RecommendationCard
                analysis={analysis}
                onOpenRecoveryModal={() => setModalOpen(true)}
              />

              {/* Full Analysis Summary Panel */}
              {selectedTx && analysis && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Analysis Summary
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Transaction Ref</span>
                      <p className="font-mono font-bold text-slate-800">{analysis.transaction_ref}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Amount</span>
                      <p className="font-extrabold text-slate-900">${selectedTx.amount.toFixed(2)} {selectedTx.currency}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Current Status</span>
                      <StatusBadge status={analysis.current_status} />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Verified Gateway State</span>
                      <p className="font-semibold text-slate-700">{analysis.verified_state}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Failure Code</span>
                      <p className="font-mono text-[10px] text-rose-700 font-bold">
                        {analysis.failure_code || '— None —'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Duplicate Payment Risk</span>
                      <p className={`font-bold text-[11px] ${
                        analysis.duplicate_risk?.risk_level === 'CRITICAL' ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {analysis.duplicate_risk?.risk_level || 'LOW'}{' '}
                        ({analysis.duplicate_risk?.duplicate_risk_score?.toFixed(0)}%)
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Safe to Retry</span>
                      <p className={`font-bold text-[11px] ${
                        analysis.recommended_action === 'SAFE_RETRY' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        {analysis.recommended_action === 'SAFE_RETRY'
                          ? 'YES — Idempotency Verified'
                          : 'NO — Verify Status First'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Manual Review Required</span>
                      <p className={`font-semibold text-[11px] ${
                        analysis.requires_authorization ? 'text-amber-700' : 'text-emerald-600'
                      }`}>
                        {analysis.requires_authorization
                          ? 'YES — Merchant Auth Needed'
                          : 'No — Automated Available'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Recommended Recovery Action</span>
                      <p className="font-bold text-slate-800">{analysis.action_title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{analysis.action_description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== Transactions Queue ===== */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment Transactions Queue</h3>
            <p className="text-xs text-slate-500">
              Click any transaction or the Analyze button to run the 6-step SURE Engine verification flow.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
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

            <form
              onSubmit={(e) => { e.preventDefault(); fetchTransactions(); }}
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
          {loading ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              <Cpu className="w-8 h-8 mx-auto mb-2 animate-spin text-brand-paypal" />
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              No transactions found. Try adjusting your filter.
            </div>
          ) : (
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
                  const isCurrentlyAnalyzing = isSelected && isAnalyzing;
                  const isAnalyzed = isSelected && !!analysis && !isAnalyzing;
                  return (
                    <tr
                      key={t.id}
                      className={`transition cursor-pointer ${
                        isSelected ? 'bg-blue-50/70 border-l-4 border-l-brand-paypal' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => runAnalysis(t)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.transaction_ref}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{t.customer_name}</p>
                        <p className="text-[11px] text-slate-400">{t.customer_email}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">${t.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                          {t.payment_method.replace(/_/g, ' ')}
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
                          onClick={(e) => { e.stopPropagation(); runAnalysis(t); }}
                          disabled={isCurrentlyAnalyzing}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ml-auto disabled:opacity-70 ${
                            isCurrentlyAnalyzing
                              ? 'bg-brand-paypal text-white cursor-wait'
                              : isAnalyzed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-brand-paypal hover:text-white'
                          }`}
                        >
                          <Cpu className={`w-3 h-3 ${isCurrentlyAnalyzing ? 'animate-spin' : ''} text-brand-cyan`} />
                          <span>
                            {isCurrentlyAnalyzing ? 'Analyzing...' : isAnalyzed ? 'Analyzed ✓' : 'Analyze'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
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
