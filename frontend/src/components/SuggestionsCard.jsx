import React, { useState } from 'react';
import { Sparkles, Check, Copy, ArrowRight, X, ThumbsUp, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SuggestionsCard({
  suggestions,
  onSelectSuggestion,
  onDismiss,
  level,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const activeSuggestion = suggestions[selectedTab] || suggestions[0];

  const handleApply = (text) => {
    // Fire subtle celebratory confetti
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#10b981'],
    });
    onSelectSuggestion(text);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categoryStyles = {
    Collaborative: {
      tag: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      tabActive: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40',
      button: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    Assertive: {
      tag: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      tabActive: 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40',
      button: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    },
    Diplomatic: {
      tag: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      tabActive: 'bg-purple-600/20 text-purple-300 border-purple-500/40',
      button: 'bg-purple-600 hover:bg-purple-500 text-white',
    },
  };

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-slate-900/95 backdrop-blur-md p-4 shadow-2xl shadow-indigo-500/10 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header with Title & Dismiss */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              Empathetic AI Alternatives
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Preserves Intent • De-escalates Tone
              </span>
            </h4>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          title="Dismiss suggestions"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Alternative Tabs */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
        {suggestions.map((item, idx) => {
          const style = categoryStyles[item.category] || categoryStyles.Collaborative;
          const isActive = selectedTab === idx;
          return (
            <button
              key={item.id || idx}
              onClick={() => setSelectedTab(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                isActive
                  ? style.tabActive + ' font-semibold shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{item.category}</span>
              <span className="text-[10px] opacity-75 font-normal">({item.tone_badge})</span>
            </button>
          );
        })}
      </div>

      {/* Active Suggestion Body */}
      {activeSuggestion && (
        <div className="mt-3 bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80">
          <p className="text-sm text-slate-100 font-medium leading-relaxed">
            "{activeSuggestion.text}"
          </p>

          {/* Rationale & Educational Guidance */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-start gap-2 text-xs text-indigo-200/90 bg-indigo-950/20 p-2 rounded-lg">
            <ThumbsUp className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span className="leading-snug">
              <strong className="text-indigo-300">Why this works:</strong> {activeSuggestion.rationale}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3.5 flex items-center justify-between gap-3 pt-1">
            <button
              onClick={() => handleCopy(activeSuggestion.id, activeSuggestion.text)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {copiedId === activeSuggestion.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleApply(activeSuggestion.text)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <span>One-Click Replace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
