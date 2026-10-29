import React, { useState } from 'react';
import { Activity, Flame, ShieldAlert, Sparkles, ChevronDown, ChevronUp, Zap } from 'lucide-react';

export default function ToneMeter({ analysis, isAnalyzing }) {
  const [showDetails, setShowDetails] = useState(false);
  const score = analysis?.score || 0;
  const level = analysis?.level || 'green';
  const primaryTone = analysis?.primary_tone || 'Calm & Neutral';
  const triggers = analysis?.triggers || [];
  const latency = analysis?.latency_ms || 0;
  const breakdown = analysis?.breakdown || {
    sentiment_score: 0,
    negative_intensity: 0,
    passive_aggressive_score: 0,
    aggression_score: 0,
    defensiveness_score: 0,
  };

  // Color mappings
  const colorConfig = {
    green: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-950/20',
      pillBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      barColor: 'from-emerald-500 to-teal-400',
      badge: 'Calm & Empathetic',
      icon: Sparkles,
      iconColor: 'text-emerald-400',
    },
    yellow: {
      border: 'border-amber-500/30',
      bg: 'bg-amber-950/20',
      pillBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      barColor: 'from-amber-500 to-yellow-400',
      badge: 'Friction Warning',
      icon: Activity,
      iconColor: 'text-amber-400',
    },
    red: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-950/30',
      pillBg: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
      barColor: 'from-rose-500 via-orange-500 to-red-600',
      badge: 'High Volatility Detected',
      icon: Flame,
      iconColor: 'text-rose-400',
    },
  }[level];

  const CurrentIcon = colorConfig.icon;

  return (
    <div className={`rounded-xl border ${colorConfig.border} ${colorConfig.bg} p-4 transition-all duration-300 shadow-md backdrop-blur-sm`}>
      {/* Top Header: Volatility Status & Latency */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-slate-900 border ${colorConfig.border}`}>
            <CurrentIcon className={`w-4 h-4 ${colorConfig.iconColor} ${level === 'red' ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Emotional Temperature
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${colorConfig.pillBg}`}>
                {primaryTone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Latency badge */}
          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
            <Zap className="w-3 h-3 text-amber-400" />
            {latency > 0 ? `${latency}ms` : '< 1ms'}
          </span>

          {/* Numerical Score */}
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-black font-mono tracking-tight ${colorConfig.iconColor}`}>
              {score}
            </span>
            <span className="text-xs text-slate-400 font-mono">/100</span>
          </div>
        </div>
      </div>

      {/* Visual Temperature Meter Bar */}
      <div className="space-y-1 mb-3">
        <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colorConfig.barColor} transition-all duration-500`}
            style={{ width: `${Math.max(4, score)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1">
          <span className="text-emerald-400">0% Calm</span>
          <span className="text-amber-400">36% Friction</span>
          <span className="text-rose-400">70%+ Volatile</span>
        </div>
      </div>

      {/* Detected Triggers Pills */}
      {triggers.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            Friction triggers:
          </span>
          {triggers.map((t, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30"
            >
              "{t}"
            </span>
          ))}
        </div>
      )}

      {/* Expandable Granular Breakdown */}
      <div className="mt-3 pt-2 border-t border-slate-800/60">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-300 transition-colors"
        >
          <span>Gatekeeper ML Metrics ({analysis.secondary_tones?.join(', ') || 'Dual-Model Engine'})</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 text-[11px] font-mono">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Sentiment</span>
              <span className={`font-semibold ${breakdown.sentiment_score < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {breakdown.sentiment_score}
              </span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Aggression</span>
              <span className={`font-semibold ${breakdown.aggression_score > 0.5 ? 'text-rose-400' : 'text-slate-300'}`}>
                {(breakdown.aggression_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Passive-Aggression</span>
              <span className={`font-semibold ${breakdown.passive_aggressive_score > 0.5 ? 'text-rose-400' : 'text-slate-300'}`}>
                {(breakdown.passive_aggressive_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Defensiveness</span>
              <span className={`font-semibold ${breakdown.defensiveness_score > 0.5 ? 'text-rose-400' : 'text-slate-300'}`}>
                {(breakdown.defensiveness_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
