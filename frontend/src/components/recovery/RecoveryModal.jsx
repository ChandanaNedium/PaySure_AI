import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useDemo } from '../../context/DemoContext';
import { useAuth } from '../../context/AuthContext';

export default function RecoveryModal({ analysis, isOpen, onClose, onRecoverySuccess }) {
  const { showToast } = useDemo();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [authorizer, setAuthorizer] = useState(
    user?.email ? `${user.full_name || 'Merchant Admin'} (${user.email})` : 'Merchant Admin (merchant@paysure.ai)'
  );

  if (!isOpen || !analysis) return null;

  const handleExecute = async () => {
    setLoading(true);
    try {
      const res = await api.post('/sure-engine/execute-recovery', {
        transaction_ref: analysis.transaction_ref,
        strategy: analysis.recommended_action,
        authorized_by: authorizer,
        notes: notes || `Authorized via PaySure SURE Engine: ${analysis.action_title}`
      });

      showToast(res.data.message || 'Recovery action executed successfully!', 'success');
      if (onRecoverySuccess) onRecoverySuccess(res.data);
      onClose();
    } catch (err) {
      console.error('Execution error', err);
      showToast('Error executing recovery action', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-cyan" />
            <h3 className="text-sm font-bold">Authorize Payment Recovery Action</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Action Summary Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-paypal">
              Action to Execute
            </span>
            <h4 className="text-sm font-bold text-slate-900 mt-0.5">
              {analysis.action_title}
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              {analysis.action_description}
            </p>
          </div>

          {/* Before & After Comparison */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Before Recovery
              </span>
              <p className="text-xs font-bold text-slate-800">Status: {analysis.current_status}</p>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                {analysis.failure_code || 'Uncertain Gateway State'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">
                After Recovery
              </span>
              <p className="text-xs font-bold text-emerald-900">
                Status: {analysis.recommended_action === 'QUARANTINE_DUPLICATE' ? 'REFUNDED / SAFE' : 'RECOVERED'}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Protected with Idempotency Key
              </p>
            </div>
          </div>

          {/* Authorization Input */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Authorized By Signatory
              </label>
              <input
                type="text"
                value={authorizer}
                onChange={(e) => setAuthorizer(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit Log Reason / Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Authorized settlement after verifying PayPal capture."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
              />
            </div>
          </div>

          {/* Compliance note */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px]">
            <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              Action will be stamped with an immutable cryptographic audit log and synchronized to the internal ledger.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-brand-navy/20 transition disabled:opacity-60"
          >
            {loading ? (
              <span>Executing...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-brand-cyan" />
                <span>Confirm & Execute</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
