import React from 'react';

export default function StatCard({ title, value, icon: Icon, change, trend = 'up', description, glowColor = 'blue' }) {
  const glowStyles = {
    blue: 'border-blue-500/20 hover:border-blue-500/40 from-blue-950/20 to-transparent',
    emerald: 'border-emerald-500/20 hover:border-emerald-500/40 from-emerald-950/20 to-transparent',
    amber: 'border-amber-500/20 hover:border-amber-500/40 from-amber-950/20 to-transparent',
    purple: 'border-purple-500/20 hover:border-purple-500/40 from-purple-950/20 to-transparent',
  };

  const iconColors = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-b ${glowStyles[glowColor]} border glass-panel transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl ${iconColors[glowColor]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        {change && (
          <span className={`text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {change}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}
