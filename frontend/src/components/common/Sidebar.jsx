import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Cpu,
  CopyX,
  Search,
  Scale,
  FileText,
  Repeat,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentTab, onNavigate }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'recovery',
      label: 'Smart Payment Recovery',
      icon: ShieldAlert,
      badge: 'Core',
      badgeColor: 'bg-brand-paypal text-white'
    },
    {
      id: 'sure-engine',
      label: 'SURE Engine Center',
      icon: Cpu,
      badge: 'AI',
      badgeColor: 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40'
    },
    {
      id: 'duplicates',
      label: 'Duplicate Guardian',
      icon: CopyX,
      badge: '1 Alert',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'failure-detective',
      label: 'AI Failure Detective',
      icon: Search,
      badge: null
    },
    {
      id: 'reconciliation',
      label: 'Smart Reconciliation',
      icon: Scale,
      badge: '2 Drift',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'disputes',
      label: 'Dispute Evidence',
      icon: FileText,
      badge: '1 Claim',
      badgeColor: 'bg-rose-100 text-rose-800'
    },
    {
      id: 'subscriptions',
      label: 'Subscription Rescue',
      icon: Repeat,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Merchant Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      label: 'PayPal & Settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Payment Intelligence
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-brand-navy text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Core Principle Card */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-brand-navy to-slate-900 text-white border border-brand-paypal/30 shadow-soft">
        <div className="flex items-center gap-1.5 text-brand-cyan text-xs font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SURE Principle</span>
        </div>
        <p className="text-[11px] text-slate-300 italic leading-snug">
          "Don't blindly retry a payment. Understand it, protect it, and recover it intelligently."
        </p>
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span>Engine v1.0.4</span>
          <span className="text-emerald-400 font-semibold">Ready</span>
        </div>
      </div>
    </aside>
  );
}
