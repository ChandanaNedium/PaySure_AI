import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Cpu,
  CopyX,
  Search,
  Scale,
  FileText,
  Repeat,
  CheckCircle2,
  Lock,
  Zap,
  ChevronRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';

export default function LandingPage({ onExploreDashboard, onLogin }) {
  const [selectedDemoTab, setSelectedDemoTab] = useState('uncertain');

  const demoScenarios = {
    uncertain: {
      title: 'State Verification on Network Drop',
      problem: 'Buyer was checking out, WiFi dropped. Merchant records "UNCERTAIN" status.',
      badAction: 'Blind Retry → Creates duplicate debit of $389.00 on customer card!',
      sureAction: 'SURE Engine queries PayPal capture truth → Confirms payment succeeded. Marks internal order as PAID without double-charging.',
      badge: 'State Drift Saved'
    },
    duplicate: {
      title: 'Rapid Click Duplicate Prevention',
      problem: 'Customer clicked "Pay Now" 3 times in 15 seconds due to slow connection.',
      badAction: 'Merchant processes 3 transactions → $240 extra billed + 2 chargeback fees.',
      sureAction: 'Duplicate Guardian catches idempotency collision within 22s → Safely voids duplicates before card processing.',
      badge: 'Overcharge Intercepted'
    },
    decline: {
      title: 'Intelligent Soft Decline Recovery',
      problem: 'Card declined by issuer due to international online transaction security rules.',
      badAction: 'Retrying the same card 4 times → Card permanently blocked by issuer fraud desk.',
      sureAction: 'SURE Engine sends 1-click alternative instrument prompt → Buyer switches to PayPal Balance or Venmo.',
      badge: 'Revenue Rescued'
    }
  };

  return (
    <div className="min-h-screen bg-brand-lightBg text-slate-800 selection:bg-brand-paypal/20">
      {/* Top Marketing Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-navy to-brand-paypal flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="h-5 w-5 text-brand-cyan" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-brand-navy">PaySure</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-black bg-brand-paypal text-white uppercase tracking-wider">
                AI
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-paypal transition">Core Features</a>
            <a href="#sure-engine" className="hover:text-brand-paypal transition">SURE Engine</a>
            <a href="#how-it-works" className="hover:text-brand-paypal transition">How It Works</a>
            <a href="#security" className="hover:text-brand-paypal transition">Security & Trust</a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="text-xs font-bold text-slate-700 hover:text-brand-paypal px-3 py-2 transition"
            >
              Sign In
            </button>
            <button
              onClick={onExploreDashboard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-navy hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-brand-navy/20 transition transform hover:scale-[1.02]"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-bold text-brand-paypal">
                <Sparkles className="w-3.5 h-3.5 text-brand-paypal" />
                <span>Next-Generation Payment Intelligence for PayPal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-navy tracking-tight leading-[1.1]">
                Every Payment Deserves a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-paypal via-blue-600 to-brand-cyan">Second Chance.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Blindly retrying failed payments causes customer overcharges, card penalties, and disputes. 
                PaySure AI's <strong>SURE Engine</strong> verifies gateway truth, intercepts duplicate charges, and recovers revenue safely.
              </p>

              {/* Core Philosophy Pill */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-soft max-w-lg flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-700 italic font-medium">
                  "Don't blindly retry a payment. Understand it, protect it, and recover it intelligently."
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onExploreDashboard}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-navy via-slate-900 to-brand-paypal text-white text-sm font-bold shadow-xl shadow-brand-navy/20 hover:scale-[1.02] transition-all"
                >
                  <span>Launch Live Demo</span>
                  <ArrowRight className="w-4 h-4 text-brand-cyan" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('interactive-demo');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold shadow-soft transition"
                >
                  Watch SURE Engine in Action
                </button>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-lg">
                <div>
                  <p className="text-2xl font-black text-brand-navy">94.2%</p>
                  <p className="text-xs text-slate-500 font-medium">Recovery Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-paypal">$12.4k+</p>
                  <p className="text-xs text-slate-500 font-medium">Monthly Revived</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-600">0%</p>
                  <p className="text-xs text-slate-500 font-medium">Duplicate Overcharges</p>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive SURE Engine Preview Simulation */}
            <div id="interactive-demo" className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-br from-brand-navy via-slate-900 to-brand-slate p-6 text-white shadow-2xl border border-brand-paypal/30">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-400 ml-2">SURE_Engine_Inspector.sh</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                    LIVE SIMULATION
                  </span>
                </div>

                {/* Scenario tabs */}
                <div className="flex gap-1.5 my-4 bg-white/10 p-1 rounded-xl">
                  {Object.entries(demoScenarios).map(([key, sc]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedDemoTab(key)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition ${
                        selectedDemoTab === key
                          ? 'bg-brand-cyan text-brand-darkNavy'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {sc.badge}
                    </button>
                  ))}
                </div>

                {/* Scenario details card */}
                <div className="space-y-4 pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Scenario Event</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {demoScenarios[selectedDemoTab].title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      {demoScenarios[selectedDemoTab].problem}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs">
                    <span className="text-rose-400 font-bold block mb-0.5">❌ Ordinary Payment Gateway Reaction:</span>
                    <span className="text-rose-200">{demoScenarios[selectedDemoTab].badAction}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/60 text-xs">
                    <span className="text-emerald-400 font-bold block mb-0.5">✅ PaySure AI Intelligence Reaction:</span>
                    <span className="text-emerald-200">{demoScenarios[selectedDemoTab].sureAction}</span>
                  </div>

                  <button
                    onClick={onExploreDashboard}
                    className="w-full py-2.5 rounded-xl bg-brand-paypal hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <span>Inspect this in Main Dashboard</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-paypal">
              Engineered for PayPal
            </span>
            <h2 className="text-3xl font-black text-brand-navy mt-1 tracking-tight">
              Six Specialized Protection Engines
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From real-time idempotency checks to dispute evidence generation, PaySure covers every touchpoint of the payment lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-brand-paypal flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">SURE Engine</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                6-step unified recovery engine that verifies gateway truth, diagnoses failure root cause, and guarantees authorized recovery.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <CopyX className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Duplicate Guardian</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Intercepts repeated checkout clicks within milliseconds, eliminates idempotency collisions, and protects buyers from double charges.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">AI Failure Detective</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Translates cryptic PayPal error codes into plain human language with actionable steps for both customers and merchants.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Reconciliation</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Automatically matches asynchronous PayPal webhook events with internal ledger records, uncovering hidden status drift.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dispute Evidence Assistant</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Compiles tracking IDs, checkout logs, and TOS acceptance timestamps to draft formal Seller Protection defense packets.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition shadow-soft">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
                <Repeat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Subscription Rescue</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Monitors recurring subscription failures, predicts churn probability, and schedules smart dunning grace periods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section id="security" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-brand-navy via-slate-900 to-brand-paypalDark p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
                Enterprise-Grade Fintech Security
              </span>
              <h3 className="text-2xl sm:text-3xl font-black">
                Safe. Idempotent. Audit-Compliant.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every recovery action requires verified human authorization. All operations are backed by cryptographic audit logs, 
                strict idempotency tokens, and standard PayPal REST OAuth2 authentication.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={onExploreDashboard}
                className="px-6 py-3.5 rounded-2xl bg-brand-cyan text-brand-darkNavy text-xs font-bold hover:scale-105 transition shadow-lg shadow-brand-cyan/20 whitespace-nowrap"
              >
                Launch PaySure AI Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="h-5 w-5 text-brand-paypal" />
            <span>PaySure AI – Smart Payment Recovery</span>
          </div>
          <p>© 2026 PaySure AI. Built for the PayPal Global Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
