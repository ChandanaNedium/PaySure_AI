import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Search,
  Activity,
  Zap
} from 'lucide-react';

export default function SureEngineWorkflow({ analysis, isAnalyzing }) {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-soft">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-brand-navy flex items-center justify-center text-brand-cyan animate-pulse">
              <Cpu className="h-8 w-8 animate-spin" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-brand-cyan opacity-30 blur-md animate-ping" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">SURE Engine Analysis in Progress</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Verifying PayPal server capture state, evaluating duplicate risk, and computing the safest recovery strategy...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-soft">
        <Cpu className="h-10 w-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Transaction Selected</h4>
        <p className="text-xs text-slate-400 mt-1">
          Select any transaction from the list or pick a Judge Scenario to run the SURE Engine.
        </p>
      </div>
    );
  }

  const steps = analysis.pipeline_steps || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-paypal">
              Smart Unified Recovery Engine
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
            <span className="text-xs text-slate-500 font-medium">6-Step Verification Pipeline</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            Diagnostic Workflow for {analysis.transaction_ref}
          </h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-brand-paypal flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-paypal" />
            <span>Confidence: {analysis.confidence_score}%</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {steps.map((step) => {
          const isWarning = step.status === 'WARNING';
          const isFailed = step.status === 'FAILED';
          const isSuccess = step.status === 'COMPLETED';

          return (
            <div
              key={step.step_number}
              className={`rounded-xl border p-4 transition-all ${
                isWarning
                  ? 'bg-amber-50/60 border-amber-200/90 shadow-sm'
                  : isFailed
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-slate-50/60 border-slate-200/70 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isWarning
                    ? 'bg-amber-200 text-amber-900'
                    : isFailed
                    ? 'bg-rose-200 text-rose-900'
                    : 'bg-brand-navy text-brand-cyan'
                }`}>
                  STEP {step.step_number}
                </span>

                {isWarning ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>State Alert</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <h5 className="text-xs font-bold text-slate-800 leading-snug">{step.title}</h5>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{step.details}</p>

              {/* Technical inspect toggle / preview */}
              {step.technical_data && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] font-mono text-slate-500 bg-white/60 p-1.5 rounded-lg overflow-x-auto">
                  {Object.entries(step.technical_data).slice(0, 2).map(([k, v]) => (
                    <div key={k} className="truncate">
                      <span className="text-slate-400">{k}:</span> <span className="font-semibold text-slate-700">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
