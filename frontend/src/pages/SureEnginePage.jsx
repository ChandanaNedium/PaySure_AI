import React, { useState, useEffect } from 'react';
import api from '../services/api';
import SureEngineWorkflow from '../components/recovery/SureEngineWorkflow';
import RecommendationCard from '../components/recovery/RecommendationCard';
import RecoveryModal from '../components/recovery/RecoveryModal';
import { useDemo } from '../context/DemoContext';
import {
  Cpu,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';

export default function SureEnginePage() {
  const { scenarios, activeScenario, selectScenario, showToast } = useDemo();
  const [selectedTxRef, setSelectedTxRef] = useState(activeScenario?.transaction_ref || 'TX-1004-TIMEOUT');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [recentAudits, setRecentAudits] = useState([]);

  const runEngine = async (txRef) => {
    setSelectedTxRef(txRef);
    setLoading(true);
    try {
      const res = await api.post(`/sure-engine/analyze/${txRef}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Error analyzing via SURE Engine', err);
      showToast('Error executing SURE Engine pipeline', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTxRef) {
      runEngine(selectedTxRef);
    }
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-brand-navy text-brand-cyan flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              SURE Engine Intelligence Center
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-brand-cyan/20 text-brand-darkNavy border border-brand-cyan/30">
              SMART UNIFIED RECOVERY ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic gateway state machine coupled with AI-augmented explainability and idempotency enforcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-cyan animate-ping"></span>
            <span>State Engine: ARMED</span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-navy via-slate-900 to-brand-paypalDark text-white shadow-soft border border-brand-paypal/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan mb-2 block">
          Deterministic 6-Phase Processing Flow
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
          {[
            { step: '01', name: 'Transaction Ingestion' },
            { step: '02', name: 'State Verification' },
            { step: '03', name: 'Failure Diagnosis' },
            { step: '04', name: 'Risk Assessment' },
            { step: '05', name: 'AI Recommendation' },
            { step: '06', name: 'Safe Resolution' }
          ].map((phase, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-brand-cyan">{phase.step}</span>
              <span className="text-[11px] font-semibold text-slate-200 mt-0.5">{phase.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Scenario / Transaction Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-brand-paypal" />
            <span>Select Transaction to Run Through SURE Pipeline:</span>
          </span>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {scenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => {
                  selectScenario(sc);
                  runEngine(sc.transaction_ref);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTxRef === sc.transaction_ref
                    ? 'bg-brand-navy text-brand-cyan shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sc.number}. {sc.title.split(' ')[0]} ({sc.transaction_ref})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main SURE Engine Active Analysis View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <SureEngineWorkflow analysis={analysis} isAnalyzing={loading} />
        </div>

        <div className="lg:col-span-5 space-y-5">
          <RecommendationCard
            analysis={analysis}
            onOpenRecoveryModal={() => setModalOpen(true)}
          />

          {/* Engine Architecture Deep-Dive Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-paypal" />
              <span>Architectural Principles</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">1. Deterministic Authority</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Financial state transitions and idempotency checks are strictly ruled by deterministic state machines, not generative guesses.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">2. Generative Synthesis</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  LLM AI is employed for contextual translation of complex ISO/PayPal errors into transparent human explanations.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-bold text-slate-800">3. Cryptographic Idempotency</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Every retry attaches a verified UUID-5 idempotency token guaranteeing that payment networks never charge twice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Confirmation Modal */}
      <RecoveryModal
        analysis={analysis}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRecoverySuccess={() => {
          showToast('Payment successfully recovered and logged in audit trail!', 'success');
          runEngine(selectedTxRef);
        }}
      />
    </div>
  );
}
