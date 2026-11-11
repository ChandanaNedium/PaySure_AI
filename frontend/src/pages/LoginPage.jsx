import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles, User, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ onNavigateToDashboard, onNavigateToRegister }) {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('merchant@paysure.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onNavigateToDashboard();
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleJudgeInstantLogin = async (role = 'merchant') => {
    setLoading(true);
    setError('');
    try {
      await demoLogin(role);
      onNavigateToDashboard();
    } catch (err) {
      setError('Error initiating instant demo login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-brand-navy to-brand-paypal items-center justify-center text-white shadow-lg mb-3">
          <ShieldCheck className="h-7 w-7 text-brand-cyan" />
        </div>
        <h2 className="text-2xl font-black text-brand-navy tracking-tight">
          Sign In to PaySure AI
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Smart Payment Recovery & Protection Engine for PayPal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-soft rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          {/* Instant 1-Click Judge Access Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-900 text-white shadow-md">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-cyan mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hackathon Judge Quick Access</span>
            </div>
            <p className="text-[11px] text-slate-300 mb-3">
              1-click instant login with all 7 demo scenarios pre-loaded.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleJudgeInstantLogin('merchant')}
                disabled={loading}
                className="py-2 px-3 rounded-xl bg-brand-cyan text-brand-darkNavy text-xs font-bold hover:scale-105 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Judge Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleJudgeInstantLogin('customer')}
                disabled={loading}
                className="py-2 px-3 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-300" />
                <span>Buyer View</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-slate-400 font-medium">Or log in with credentials</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-paypal"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-brand-navy/20 transition flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="text-xs text-brand-paypal hover:underline font-semibold"
            >
              Don't have an account? Register as Merchant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
