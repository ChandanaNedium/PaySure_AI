import React from 'react';
import { useDemo } from '../../context/DemoContext';
import { Play, RotateCcw, Sparkles, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function JudgeDemoBar({ onNavigateToRecovery }) {
  const { scenarios, activeScenario, selectScenario, resetDemo } = useDemo();

  return (
    <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-paypalDark text-white px-4 py-2.5 border-b border-brand-paypal/30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Judge Mode Label */}
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-cyan"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Judge Demo Scenarios
          </span>
          <span className="hidden lg:inline text-[11px] text-slate-300 border-l border-white/20 pl-2">
            Click any scenario to load into SURE Engine:
          </span>
        </div>

        {/* Center: 7 Scenario Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {scenarios.map((sc) => {
            const isSelected = activeScenario?.id === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  selectScenario(sc);
                  if (onNavigateToRecovery) onNavigateToRecovery(sc.transaction_ref);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-brand-cyan text-brand-darkNavy font-bold shadow-sm shadow-brand-cyan/30 scale-105'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
                }`}
                title={sc.title + ': ' + sc.description}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isSelected ? 'bg-brand-darkNavy text-brand-cyan font-bold' : 'bg-white/20'
                }`}>
                  {sc.number}
                </span>
                <span>{sc.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Action & Reset Button */}
        <div className="flex items-center gap-2">
          {activeScenario && onNavigateToRecovery && (
            <button
              onClick={() => onNavigateToRecovery(activeScenario.transaction_ref)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Analyze Active</span>
            </button>
          )}

          <button
            onClick={resetDemo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-rose-900/50 hover:text-rose-200 text-slate-300 text-xs font-medium border border-white/10 transition-all"
            title="Reset all demo data back to clean initial state"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
