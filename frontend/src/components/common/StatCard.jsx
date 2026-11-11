import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'positive', // positive, negative, neutral
  highlight = false,
  badgeText
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
        highlight
          ? 'bg-gradient-to-br from-brand-navy via-slate-900 to-brand-slate text-white border-brand-paypal/30 shadow-premium'
          : 'bg-white text-slate-800 border-slate-200/80 shadow-soft hover:shadow-md'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold uppercase tracking-wider ${highlight ? 'text-blue-200/90' : 'text-slate-500'}`}>
          {title}
        </span>
        {badgeText && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            highlight ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30' : 'bg-brand-paypal/10 text-brand-paypal'
          }`}>
            {badgeText}
          </span>
        )}
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            highlight ? 'bg-white/10 text-brand-cyan' : 'bg-slate-50 text-brand-paypal'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-2xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>
          {value}
        </span>
        {trend && (
          <span className={`inline-flex items-center text-xs font-semibold ${
            trendType === 'positive'
              ? highlight ? 'text-emerald-400' : 'text-emerald-600'
              : highlight ? 'text-rose-400' : 'text-rose-600'
          }`}>
            {trendType === 'positive' ? (
              <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
            )}
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className={`mt-1.5 text-xs ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>
          {subtext}
        </p>
      )}

      {/* Decorative subtle ambient light */}
      {highlight && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-cyan/10 blur-xl" />
      )}
    </div>
  );
}
