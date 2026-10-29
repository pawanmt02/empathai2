import React from 'react';
import { HeartHandshake, ShieldCheck, Settings, Sparkles, SplitSquareVertical, MessageSquare } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  connectionStatus,
  hasApiKey 
}) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Track Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                EmpathAI
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AFFECIO '26
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI Communication Intermediary • Social Interaction Track
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'workspace'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Live Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            Side-by-Side Impact Simulator
          </button>
        </div>

        {/* Right Action Badges */}
        <div className="flex items-center gap-3">
          {/* Privacy Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>In-Memory Privacy Active</span>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-indigo-400'
              }`}
            />
            <span className="capitalize font-mono text-[11px]">
              {connectionStatus === 'connected' ? 'WebSocket Real-Time' : 'REST Mode'}
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              hasApiKey
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Configure Gemini API Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">
              {hasApiKey ? 'Gemini 2.5 Active' : 'API Settings'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
