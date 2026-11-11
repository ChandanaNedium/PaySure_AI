import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import {
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  User,
  Building,
  RefreshCw
} from 'lucide-react';

export default function FailureDetectivePage({ onNavigateToRecovery }) {
  const { showToast } = useDemo();
  const [catalog, setCatalog] = useState([]);
  const [selectedError, setSelectedError] = useState(null);
  const [inputCode, setInputCode] = useState('INSTRUMENT_DECLINED');
  const [loading, setLoading] = useState(true);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.get('/failure-detective/catalog');
      setCatalog(res.data);
      if (res.data.length > 0) {
        setSelectedError(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching failure catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleDiagnose = async (codeToDiagnose) => {
    const code = codeToDiagnose || inputCode;
    if (!code) return;
    try {
      const res = await api.get('/failure-detective/diagnose', { params: { code } });
      setSelectedError(res.data);
      setInputCode(res.data.code);
    } catch (err) {
      showToast('Error diagnosing code', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              AI Failure Detective
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              PLAIN-ENGLISH DIAGNOSTICS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Translates cryptic PayPal payment gateway and banking ISO codes into plain, actionable advice.
          </p>
        </div>
      </div>

      {/* Search / Diagnostic Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-soft">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDiagnose();
          }}
          className="flex flex-col sm:flex-row gap-3 items-center justify-between"
        >
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter PayPal Failure Code (e.g. INSTRUMENT_DECLINED, PAYER_ACTION_REQUIRED)..."
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 uppercase font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-paypal"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-soft transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Diagnose Failure</span>
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto text-xs pb-1">
          <span className="text-[11px] text-slate-400 font-bold shrink-0">Popular Codes:</span>
          {['INSTRUMENT_DECLINED', 'NETWORK_TIMEOUT', 'PAYER_ACTION_REQUIRED', 'INSUFFICIENT_FUNDS', 'DUPLICATE_IDEMPOTENCY_CONFLICT'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => handleDiagnose(code)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-semibold transition"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Main Diagnostic Card Display */}
      {selectedError && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Diagnostic Details */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {selectedError.category}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedError.title}
                </h3>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                selectedError.risk_level === 'CRITICAL'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : selectedError.risk_level === 'HIGH'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}>
                Risk Level: {selectedError.risk_level}
              </span>
            </div>

            {/* Plain English Translation */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-paypal flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Plain-English Translation
              </span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {selectedError.plain_english}
              </p>
            </div>

            {/* Common Causes List */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Underlying Technical Causes
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {(selectedError.common_causes || []).map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-paypal mt-1.5 shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer vs Merchant Action Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-brand-paypal flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  What Customer Should Do
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedError.customer_action}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-navy text-white space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-brand-cyan flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  What Merchant Should Do
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedError.merchant_action}
                </p>
              </div>
            </div>
          </div>

          {/* Catalog Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Error Diagnostic Library
            </h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {catalog.map((item) => (
                <button
                  key={item.code}
                  onClick={() => setSelectedError(item)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selectedError?.code === item.code
                      ? 'bg-purple-50 border-purple-300'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-mono text-xs font-bold text-slate-800">{item.code}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
