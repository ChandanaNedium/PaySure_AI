import React from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const s = (status || '').toUpperCase();

  const configs = {
    COMPLETED: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Completed'
    },
    RECOVERED: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 shadow-sm shadow-indigo-100',
      dot: 'bg-indigo-500',
      icon: ShieldCheck,
      label: 'Recovered'
    },
    FAILED: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
      icon: XCircle,
      label: 'Failed'
    },
    PENDING: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500 animate-pulse',
      icon: Clock,
      label: 'Pending'
    },
    UNCERTAIN: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      dot: 'bg-purple-500 animate-ping',
      icon: HelpCircle,
      label: 'Uncertain'
    },
    DISPUTED: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      dot: 'bg-blue-500',
      icon: AlertTriangle,
      label: 'Disputed'
    },
    REFUNDED: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-400',
      icon: CheckCircle2,
      label: 'Refunded / Voided'
    }
  };

  const current = configs[s] || {
    bg: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
    icon: HelpCircle,
    label: s || 'Unknown'
  };

  const Icon = current.icon;
  const padding = size === 'lg' ? 'px-3 py-1 text-sm font-semibold' : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${padding} transition-all duration-150`}>
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
