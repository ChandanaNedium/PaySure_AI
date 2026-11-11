import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Copy,
  ChevronRight,
  Lock,
  History,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

function StatusChip({ status }) {
  const color =
    status === 'SUBMITTED'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : status === 'FAILED'
      ? 'bg-rose-100 text-rose-800 border-rose-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${color}`}>
      {status}
    </span>
  );
}

export default function DisputesPage() {
  const { showToast } = useDemo();
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [evidencePack, setEvidencePack] = useState(null);
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Submission history state
  const [allHistory, setAllHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [previewSubmission, setPreviewSubmission] = useState(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/disputes');
      setDisputes(res.data);
      if (res.data.length > 0) {
        selectDisputeItem(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching disputes', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/disputes/submissions/all');
      setAllHistory(res.data);
    } catch (err) {
      console.error('Error fetching submission history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
    fetchAllHistory();
  }, []);

  const selectDisputeItem = async (d) => {
    setSelectedDispute(d);
    try {
      const res = await api.get(`/disputes/${d.id}/evidence-package`);
      setEvidencePack(res.data);
      setStatement(res.data.draft_statement || '');
    } catch (err) {
      console.error('Error fetching evidence package', err);
    }
  };

  const handleSubmitEvidence = async () => {
    if (!selectedDispute) return;
    if (!statement.trim()) {
      showToast('Defense statement cannot be empty.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post(`/disputes/${selectedDispute.id}/submit`, {
        defense_statement: statement
      });
      showToast(res.data.message || 'Evidence package submitted to PayPal Resolution Center.', 'success');
      fetchDisputes();
      fetchAllHistory(); // refresh history after submission
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Error submitting evidence';
      showToast(errMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Dispute Evidence Assistant
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              SELLER PROTECTION AUTOMATION
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated compilation of delivery tracking, checkout authentication, and AI defense generation for PayPal chargebacks.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dispute List */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Active PayPal Claims</h3>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {disputes.length} Disputes
            </span>
          </div>

          <div className="space-y-3">
            {disputes.map((d) => {
              const isSelected = selectedDispute?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => selectDisputeItem(d)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/70 border-brand-paypal shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-slate-900">{d.paypal_dispute_id}</span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      ${d.dispute_amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{d.reason.replace(/_/g, ' ')}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span>Tx: <strong>{d.transaction_ref || 'TX-1007'}</strong></span>
                    <span className="font-bold text-amber-700">{d.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Evidence Package & Defense Drafter */}
        <div className="lg:col-span-8 space-y-5">
          {evidencePack ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-paypal flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    PayPal Seller Protection Qualified
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Defense Evidence Dossier: {evidencePack.dispute_id}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                    Response Window: {evidencePack.deadline_days_remaining} Days Left
                  </span>
                </div>
              </div>

              {/* Evidence Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Compiled Verification Documents
                </h4>
                <div className="space-y-2">
                  {(evidencePack.evidence_checklist || []).map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800">{item.item}</p>
                          <p className="text-[11px] text-slate-500">{item.details}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Drafted Defense Statement */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    AI-Drafted Formal Response to PayPal Resolution Center
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(statement);
                      showToast('Copied defense statement to clipboard!', 'info');
                    }}
                    className="text-[11px] text-brand-paypal hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Text</span>
                  </button>
                </div>

                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={8}
                  className="w-full p-4 text-xs rounded-2xl border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-paypal leading-relaxed"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Mandatory human review prior to submission to PayPal Disputes API.</span>
                </div>

                <button
                  onClick={handleSubmitEvidence}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-md transition disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>{submitting ? 'Submitting to PayPal...' : 'Submit Evidence Response'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              Select a dispute to compile its evidence dossier.
            </div>
          )}
        </div>
      </div>

      {/* ===== Evidence Submission History Section ===== */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-paypal" />
              <h3 className="text-base font-bold text-slate-900">Evidence Submission History</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All evidence submissions are stored persistently. Refreshing the page will not remove this history.
            </p>
          </div>
          <button
            onClick={fetchAllHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-soft transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {historyLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-brand-paypal" />
              Loading submission history...
            </div>
          ) : allHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No submissions yet</p>
              <p className="text-xs mt-1">Submit an evidence response above to record it here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Submission Ref</th>
                  <th className="py-3 px-4">Dispute ID</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Documents</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-brand-navy text-[11px]">
                      {s.submission_reference || `SUB-${s.id}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {s.dispute_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {s.transaction_ref || '—'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {s.submitted_at ? new Date(s.submitted_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusChip status={s.submission_status} />
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {(s.evidence_documents || []).length} document{(s.evidence_documents || []).length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4">
                      {s.is_simulated ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          SIMULATED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          LIVE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setPreviewSubmission(s)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold ml-auto"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Submission Preview Modal */}
      {previewSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Submission Details</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{previewSubmission.submission_reference}</p>
              </div>
              <button
                onClick={() => setPreviewSubmission(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold mb-0.5">Dispute ID</span>
                  <p className="font-mono font-bold text-slate-800">{previewSubmission.dispute_id}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold mb-0.5">Transaction Ref</span>
                  <p className="font-mono font-bold text-slate-800">{previewSubmission.transaction_ref || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold mb-0.5">Submitted At</span>
                  <p className="text-slate-700">{new Date(previewSubmission.submitted_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold mb-0.5">Status</span>
                  <StatusChip status={previewSubmission.submission_status} />
                </div>
              </div>

              {/* Evidence Documents */}
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold mb-2">Evidence Documents Included</span>
                <div className="space-y-1.5">
                  {(previewSubmission.evidence_documents || []).map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-slate-700">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defense Statement Summary */}
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-bold mb-2">Response Summary</span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-700 leading-relaxed whitespace-pre-wrap text-[11px]">
                  {previewSubmission.defense_statement_summary}
                </div>
              </div>

              {/* PayPal Response */}
              {previewSubmission.paypal_response && (
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase font-bold mb-2">PayPal API Response</span>
                  <div className={`p-3 rounded-xl border text-[11px] ${
                    previewSubmission.is_simulated
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {previewSubmission.paypal_response}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
