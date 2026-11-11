import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDemo } from '../../context/DemoContext';
import {
  ShieldCheck,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function Navbar({ onNavigate, currentTab }) {
  const { user, logout, demoLogin } = useAuth();
  const { toast } = useDemo();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Toast Alert Notification */}
      {toast && (
        <div className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-bounce ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : toast.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-300'
            : 'bg-blue-50 text-blue-800 border-blue-300'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-navy via-brand-paypalDark to-brand-paypal flex items-center justify-center text-white shadow-md shadow-brand-paypal/20">
            <ShieldCheck className="h-6 w-6 text-brand-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-brand-navy">PaySure</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-black bg-brand-paypal text-white uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium -mt-0.5 tracking-tight">
              Smart Payment Recovery for PayPal
            </p>
          </div>
        </div>

        {/* Center: Live Sandbox Status & Environment Pill */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>PayPal Sandbox Integration</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-md font-bold">
              ACTIVE
            </span>
          </div>

          <button
            onClick={() => onNavigate('sure-engine')}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentTab === 'sure-engine'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'bg-blue-50 text-brand-paypal hover:bg-blue-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>SURE Engine</span>
          </button>
        </div>

        {/* Right: Notifications & Profile Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-800">Payment Alerts</span>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">2 New</span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  <div className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => { onNavigate('duplicates'); setNotificationsOpen(false); }}>
                    <p className="text-xs font-semibold text-slate-900">Duplicate Payment Intercepted</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">TX-1005-DUPLICATE ($79.99) held safely by Guardian.</p>
                  </div>
                  <div className="p-3 hover:bg-slate-50 cursor-pointer" onClick={() => { onNavigate('recovery'); setNotificationsOpen(false); }}>
                    <p className="text-xs font-semibold text-slate-900">State Drift Detected</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">TX-1004-TIMEOUT was captured on PayPal. Do NOT retry.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-paypal to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'M'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {user?.full_name || 'Merchant Account'}
                </p>
                <p className="text-[10px] text-brand-paypal font-semibold uppercase mt-0.5">
                  {user?.role === 'customer' ? 'Customer Account' : 'Merchant Admin'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.full_name || 'Merchant Account'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || 'merchant@paysure.ai'}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { demoLogin('merchant'); setProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Switch to Merchant View</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-paypal" />
                  </button>
                  <button
                    onClick={() => { demoLogin('customer'); setProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Switch to Buyer View</span>
                    <User className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    onClick={() => { onNavigate('settings'); setProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    PayPal & API Settings
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => { logout(); onNavigate('login'); setProfileOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
