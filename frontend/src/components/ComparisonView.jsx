import React, { useState } from 'react';
import { SplitSquareVertical, AlertTriangle, Sparkles, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const COMPARISON_SCENARIOS = [
  {
    title: 'The "Per My Last Email" Classic',
    rawMessage: 'Per my last email, if you actually bothered to read the specs you would know this.',
    rawScore: 78,
    rawTone: 'Passive-Aggressive',
    rawReaction: 'I did read the specs. There is no need to be condescending. If you would rather handle this solo, let our manager know.',
    rawOutcome: 'Resentment escalated. Collaboration stalled for 48 hours.',

    empathicMessage: 'Following up on the notes from our previous discussion, here is a quick recap so we are all aligned on the requirements.',
    empathicScore: 0,
    empathicTone: 'Warm & Collaborative',
    empathicReaction: 'Thanks so much for the recap! I missed that detail in the earlier thread. Pushing the fix right now.',
    empathicOutcome: 'Issue resolved in 10 minutes. Mutual trust preserved.',
  },
  {
    title: 'The Code Review Critique',
    rawMessage: 'This is a complete waste of my time. Did you even test it before pushing?? Completely broken.',
    rawScore: 84,
    rawTone: 'Hostile & Accusatory',
    rawReaction: 'I spent all weekend on this. If you are just going to insult my work instead of giving constructive feedback, review it yourself.',
    rawOutcome: 'Developer disengagement. High risk of burnout and turnover.',

    empathicMessage: 'I reviewed the latest build and spotted a few edge cases where tests are failing. Let us look over them together so we can get this merged.',
    empathicScore: 0,
    empathicTone: 'Supportive & Constructive',
    empathicReaction: 'Good catch on those edge cases! Thanks for offering to look together. When do you have 10 minutes?',
    empathicOutcome: 'Defects fixed rapidly. Mentorship and psychological safety reinforced.',
  },
  {
    title: 'The Boundary Push / Responsibility Dodge',
    rawMessage: 'Fine, whatever. Do whatever you want, not my problem.',
    rawScore: 75,
    rawTone: 'Defensive Disengagement',
    rawReaction: 'Nice to know we cannot count on you when things get tight. We will manage without your input.',
    rawOutcome: 'Team division. Siloed communication culture.',

    empathicMessage: 'I have some reservations about this direction, but let us pause and make sure we both feel confident in the plan before moving forward.',
    empathicScore: 0,
    empathicTone: 'Diplomatic & Assertive',
    empathicReaction: 'I appreciate you speaking up. What specific concerns are you seeing? Let us talk through them.',
    empathicOutcome: 'Constructive risk mitigation. Better architectural outcome.',
  },
];

export default function ComparisonView() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const current = COMPARISON_SCENARIOS[selectedIdx];

  const handleCelebrate = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#6366f1', '#ec4899'],
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span>Interactive Side-by-Side Impact Demonstration</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          How EmpathAI Protects Human Connection
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Text strips away tone and body language. Witness the dramatic relational difference between sending raw, emotionally volatile text versus an EmpathAI empathetic transformation.
        </p>

        {/* Scenario Selectors */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {COMPARISON_SCENARIOS.map((sc, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedIdx === i
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/25'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Column 1: Without EmpathAI (Escalation) */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 space-y-5 relative shadow-xl shadow-rose-950/20 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <XCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Path A: Without EmpathAI</h3>
                  <span className="text-[11px] text-rose-400">Raw impulsive communication</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Score: {current.rawScore}/100 (Red)
              </span>
            </div>

            {/* User drafted text */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                1. Sender writes and sends:
              </span>
              <div className="bg-slate-950 p-4 rounded-xl border border-rose-500/30 text-rose-100 text-sm font-medium leading-relaxed">
                "{current.rawMessage}"
              </div>
              <span className="text-[11px] text-rose-400/90 block font-mono">
                Detected Tone: {current.rawTone}
              </span>
            </div>

            {/* Recipient Reaction */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                2. Recipient emotional reaction:
              </span>
              <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/20 text-slate-300 text-sm leading-relaxed flex items-start gap-3">
                <span className="text-xl shrink-0">😠</span>
                <div>
                  <p className="italic">"{current.rawReaction}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Friction Outcome */}
          <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-200 space-y-1 mt-4">
            <div className="font-bold flex items-center gap-1.5 text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Relational Damage:</span>
            </div>
            <p className="leading-relaxed">{current.rawOutcome}</p>
          </div>
        </div>

        {/* Column 2: With EmpathAI (Empathetic De-escalation) */}
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 space-y-5 relative shadow-xl shadow-emerald-950/20 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Path B: With EmpathAI</h3>
                  <span className="text-[11px] text-emerald-400">Context-preserving de-escalation</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Score: {current.empathicScore}/100 (Green)
              </span>
            </div>

            {/* AI Transformed Message */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
                <span>1. One-Click Empathetic Substitution:</span>
                <span className="text-emerald-400 font-mono text-[10px]">✨ Dual-Model AI Applied</span>
              </span>
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 text-emerald-100 text-sm font-medium leading-relaxed">
                "{current.empathicMessage}"
              </div>
              <span className="text-[11px] text-emerald-400/90 block font-mono">
                Transformed Tone: {current.empathicTone}
              </span>
            </div>

            {/* Recipient Reaction */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                2. Recipient emotional reaction:
              </span>
              <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 text-slate-300 text-sm leading-relaxed flex items-start gap-3">
                <span className="text-xl shrink-0">🤝</span>
                <div>
                  <p className="italic">"{current.empathicReaction}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Connection Outcome */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 text-xs text-emerald-200 space-y-1 mt-4">
            <div className="font-bold flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 fill-emerald-400" />
                Human Connection Preserved:
              </span>
              <button
                onClick={handleCelebrate}
                className="text-[10px] text-emerald-300 hover:text-white underline cursor-pointer"
              >
                Celebrate 🎉
              </button>
            </div>
            <p className="leading-relaxed">{current.empathicOutcome}</p>
          </div>
        </div>

      </div>

      {/* Value Proposition Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Sub-500ms Latency</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Local Gatekeeper scores keystrokes in &lt;2ms, triggering the generator only on friction to preserve flow.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Tone vs Grammar</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike structural linters, EmpathAI corrects emotional intent—mitigating passive-aggression and defensive bias.
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">100% In-Memory Privacy</span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Messages are processed entirely in ephemeral memory with zero database retention or user tracking.
          </p>
        </div>
      </div>

    </div>
  );
}
