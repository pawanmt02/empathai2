import React from 'react';
import { PlayCircle, AlertTriangle, ShieldCheck, Flame, HelpCircle } from 'lucide-react';

export const DEMO_SCENARIOS = [
  {
    id: 'pa-email',
    title: 'Passive-Aggressive Email',
    category: 'Workplace',
    level: 'red',
    icon: Flame,
    text: 'Per my last email, if you actually bothered to read the specs you would know this.',
    frictionDescription: 'Exasperation + competence questioning',
  },
  {
    id: 'hostile-review',
    title: 'Hostile Review / Dismissive',
    category: 'Engineering',
    level: 'red',
    icon: AlertTriangle,
    text: 'This is a complete waste of my time. Are you serious??',
    frictionDescription: 'Aggressive interrogation + time devaluation',
  },
  {
    id: 'defensive-blame',
    title: 'Defensive Disengagement',
    category: 'Collaboration',
    level: 'red',
    icon: Flame,
    text: 'Fine, whatever. Do whatever you want, not my problem.',
    frictionDescription: 'Resignation + refusing ownership',
  },
  {
    id: 'broken-deploy',
    title: 'Aggressive Escalation',
    category: 'Incident',
    level: 'red',
    icon: AlertTriangle,
    text: 'Did you even test this before pushing to main?? It is completely broken.',
    frictionDescription: 'Public shaming + accusatory phrasing',
  },
  {
    id: 'calm-team',
    title: 'Constructive Sync',
    category: 'Team Chat',
    level: 'green',
    icon: ShieldCheck,
    text: 'Hey team, thanks for pushing through the sprint milestones. Looking forward to our demo!',
    frictionDescription: 'Warm, positive reinforcement',
  },
];

export default function ScenarioPicker({ onSelectScenario }) {
  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
          Test Friction Scenarios (One-Click Preload):
        </span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Click any preset to test the Gatekeeper & Rewriter in real-time
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {DEMO_SCENARIOS.map((sc) => {
          const isRed = sc.level === 'red';
          return (
            <button
              key={sc.id}
              onClick={() => onSelectScenario(sc.text)}
              className="text-left p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-800/80 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {sc.title}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRed ? 'bg-rose-500 shadow-sm shadow-rose-500' : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1">
                "{sc.text}"
              </p>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {sc.frictionDescription}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
