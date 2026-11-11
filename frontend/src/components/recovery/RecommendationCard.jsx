import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Lock,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function RecommendationCard({ analysis, onOpenRecoveryModal }) {
  if (!analysis) return null;

  const isHighRisk = analysis.duplicate_risk?.risk_level === 'CRITICAL' || analysis.recommended_action === 'RECONCILE_AND_MARK_PAID';

  return (
    <div className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-slate rounded-2xl border border-brand-paypal/40 p-6 text-white shadow-premium">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              SURE Engine AI Recommendation
            </h4>
            <p className="text-[11px] text-brand-cyan">
              Deterministic state validation + AI contextual reasoning
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isHighRisk
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
              : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
          }`}>
            Risk: {analysis.duplicate_risk?.risk_level || 'LOW'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Key: {analysis.transaction_ref}
          </span>
        </div>
      </div>

      {/* Recommended Action Box */}
      <div className="mt-5 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
              Recommended Strategy
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {analysis.action_title}
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {analysis.action_description}
            </p>
          </div>
        </div>

        {/* AI Failure Explanation */}
        <div className="mt-3.5 pt-3 border-t border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-brand-cyan" />
            Failure Diagnosis & Context
          </span>
          <p className="text-xs text-slate-200 mt-1 italic">
            "{analysis.failure_explanation}"
          </p>
        </div>
      </div>

      {/* Safeguard & Action Button */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Requires explicit merchant authorization. No blind retries permitted.</span>
        </div>

        <button
          onClick={() => onOpenRecoveryModal(analysis)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-paypal to-blue-500 hover:from-blue-600 hover:to-brand-paypal text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform hover:scale-[1.02]"
        >
          <span>Authorize & Execute Action</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
