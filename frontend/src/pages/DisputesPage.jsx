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
  Download,
  Copy,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';

export default function DisputesPage() {
  const { showToast } = useDemo();
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [evidencePack, setEvidencePack] = useState(null);
  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    fetchDisputes();
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
    setSubmitting(true);
    try {
      const res = await api.post(`/disputes/${selectedDispute.id}/submit`, {
        defense_statement: statement
      });
      showToast(res.data.message || 'Evidence package submitted to PayPal Resolution Center.', 'success');
      fetchDisputes();
    } catch (err) {
      showToast('Error submitting evidence', 'error');
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
    </div>
  );
}
