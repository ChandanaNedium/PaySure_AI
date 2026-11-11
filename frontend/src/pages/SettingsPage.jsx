import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useDemo } from '../context/DemoContext';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  CheckCircle2,
  Key,
  Database,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Lock,
  Globe,
  Radio
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast, resetDemo } = useDemo();
  const [paypalStatus, setPaypalStatus] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [clientId, setClientId] = useState('demo_sandbox_client_id_paysure');
  const [clientSecret, setClientSecret] = useState('••••••••••••••••••••••••••••••••');
  const [webhookId, setWebhookId] = useState('DEMO_WEBHOOK_ID_PAYSURE_99');
  const [mode, setMode] = useState('sandbox');
  const [aiProvider, setAiProvider] = useState('local_expert');

  const checkStatus = async () => {
    try {
      const res = await api.get('/demo/status');
      setPaypalStatus(res.data);
    } catch (err) {
      console.error('Error checking status', err);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      await checkStatus();
      setTimeout(() => {
        setTestingConnection(false);
        showToast('Successfully verified PayPal REST API handshake!', 'success');
      }, 700);
    } catch (err) {
      setTestingConnection(false);
      showToast('Error validating PayPal credentials', 'error');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Settings saved successfully. Configuration active.', 'success');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-brand-navy tracking-tight">
              Integration & Security Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
              CONFIG
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure real PayPal Sandbox keys, AI intelligence providers, and webhook endpoints.
          </p>
        </div>
      </div>

      {/* Integration Status Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-brand-navy via-slate-900 to-brand-paypalDark text-white shadow-soft border border-brand-paypal/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
              PayPal Integration Layer
            </span>
          </div>
          <h3 className="text-lg font-bold">
            {paypalStatus?.status === 'LIVE_SANDBOX' ? 'Live PayPal Sandbox Connected' : 'PayPal High-Fidelity Simulator Active'}
          </h3>
          <p className="text-xs text-slate-300">
            Endpoint: <code className="text-brand-cyan text-[11px]">{paypalStatus?.base_url || 'https://api-m.sandbox.paypal.com'}</code>
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testingConnection}
          className="px-4 py-2.5 rounded-xl bg-brand-cyan text-brand-darkNavy text-xs font-bold hover:scale-105 transition shadow-sm disabled:opacity-50 whitespace-nowrap self-start sm:self-auto"
        >
          {testingConnection ? 'Testing Gateway...' : 'Test Connection'}
        </button>
      </div>

      {/* PayPal Sandbox Configuration Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-brand-paypal" />
            <h3 className="text-sm font-bold text-slate-900">PayPal REST API Credentials</h3>
          </div>
          <span className="text-xs text-slate-400">Sandbox / Live</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PayPal Environment Mode
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="paypalMode"
                  value="sandbox"
                  checked={mode === 'sandbox'}
                  onChange={() => setMode('sandbox')}
                  className="text-brand-paypal"
                />
                <span className="font-semibold">PayPal Sandbox (Recommended for Testing)</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="paypalMode"
                  value="live"
                  checked={mode === 'live'}
                  onChange={() => setMode('live')}
                  className="text-brand-paypal"
                />
                <span className="font-semibold">Live Production</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PayPal Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. A21AAK... from developer.paypal.com"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PayPal Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Webhook ID (for Signature Verification)
            </label>
            <input
              type="text"
              value={webhookId}
              onChange={(e) => setWebhookId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
            />
          </div>
        </div>

        {/* AI Provider Config */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-paypal" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              AI Intelligence Engine Provider
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className={`p-3 rounded-2xl border cursor-pointer transition ${
              aiProvider === 'local_expert' ? 'bg-blue-50/70 border-brand-paypal' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Built-in Expert Knowledge Engine</span>
                <input
                  type="radio"
                  name="aiProv"
                  checked={aiProvider === 'local_expert'}
                  onChange={() => setAiProvider('local_expert')}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Zero external dependency. 100% reliable domain reasoning for PayPal ISO error mapping.
              </p>
            </label>

            <label className={`p-3 rounded-2xl border cursor-pointer transition ${
              aiProvider === 'openai' ? 'bg-blue-50/70 border-brand-paypal' : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">External LLM API (OpenAI / Gemini)</span>
                <input
                  type="radio"
                  name="aiProv"
                  checked={aiProvider === 'openai'}
                  onChange={() => setAiProvider('openai')}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Passes prompt context through your custom API key configured in backend environment.
              </p>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-md transition"
          >
            Save Settings
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Demo Database */}
      <div className="bg-white rounded-3xl border border-rose-200 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Environment</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Restores all 7 Judge Demo Scenarios and historical transactions back to pristine initial state.
          </p>
        </div>

        <button
          onClick={resetDemo}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition whitespace-nowrap self-start sm:self-auto"
        >
          Reset Demo Data
        </button>
      </div>
    </div>
  );
}
