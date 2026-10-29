import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, Users, Sparkles, MessageSquare, Bot, AlertCircle, RefreshCw } from 'lucide-react';
import ToneMeter from './ToneMeter';
import SuggestionsCard from './SuggestionsCard';
import ScenarioPicker from './ScenarioPicker';
import { useToneWebSocket } from '../hooks/useToneWebSocket';

const CHANNELS = [
  { id: 'client-escalation', name: 'client-escalation', topic: 'Live incident triage with Enterprise client' },
  { id: 'code-reviews', name: 'code-reviews', topic: 'Sprint 26 PR reviews & architectural debate' },
  { id: 'urgent-deadlines', name: 'urgent-deadlines', topic: 'Final countdown to launch 🚀' },
];

const INITIAL_MESSAGES = {
  'client-escalation': [
    {
      id: 'm1',
      sender: 'Sarah (Client Lead)',
      avatar: '👩‍💼',
      time: '12:45 PM',
      text: 'Hey team, the client is asking why the dashboard exports are still failing in production. Has anyone reviewed the bug tickets from yesterday?',
      isUser: false,
    },
    {
      id: 'm2',
      sender: 'Marcus (DevOps)',
      avatar: '👨‍💻',
      time: '12:48 PM',
      text: 'The logs indicate an auth token expired during the nightly sync. We need dev to inspect the API payloads ASAP.',
      isUser: false,
    },
  ],
  'code-reviews': [
    {
      id: 'cr1',
      sender: 'Alex (Tech Lead)',
      avatar: '👨‍🏫',
      time: '11:15 AM',
      text: 'Just reviewed PR #412. There are several unbounded DB queries that could impact latency under high load.',
      isUser: false,
    },
  ],
  'urgent-deadlines': [
    {
      id: 'ud1',
      sender: 'Elena (PM)',
      avatar: '👩‍💻',
      time: '10:00 AM',
      text: 'Reminder: AFFECIO HACKS submission window closes soon! Let us make sure our demo is pristine.',
      isUser: false,
    },
  ],
};

export default function ChatSimulator({ apiKey, onOpenSettings }) {
  const [activeChannelId, setActiveChannelId] = useState('client-escalation');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draftText, setDraftText] = useState('');
  const [dismissedSuggestions, setDismissedSuggestions] = useState(false);
  const [lastRewritten, setLastRewritten] = useState(false);
  const messagesEndRef = useRef(null);

  const { analysis, isAnalyzing, connectionStatus, triggerRewrite } = useToneWebSocket(
    draftText,
    apiKey
  );

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  // Reset dismissed suggestions when user types new content
  useEffect(() => {
    setDismissedSuggestions(false);
  }, [draftText]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!draftText.trim()) return;

    const newMessage = {
      id: `user-${Date.now()}`,
      sender: 'You',
      avatar: '🧑‍💻',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: draftText.trim(),
      isUser: true,
      empathAiUsed: lastRewritten,
      originalScore: analysis.score,
      tone: analysis.primary_tone,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMessage],
    }));

    setDraftText('');
    setLastRewritten(false);
    setDismissedSuggestions(false);
  };

  const handleSelectSuggestion = (suggestedText) => {
    setDraftText(suggestedText);
    setLastRewritten(true);
    setDismissedSuggestions(false);
  };

  const handleSelectScenario = (scenarioText) => {
    setDraftText(scenarioText);
    setLastRewritten(false);
    setDismissedSuggestions(false);
  };

  const currentChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];
  const channelMessages = messages[activeChannelId] || [];

  const shouldShowSuggestions =
    !dismissedSuggestions &&
    analysis.suggestions &&
    analysis.suggestions.length > 0 &&
    (analysis.requires_rewrite || analysis.score >= 50);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      
      {/* Quick Scenario Preload Bar */}
      <ScenarioPicker onSelectScenario={handleSelectScenario} />

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Channels & Active Chat (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden min-h-[640px]">
          
          {/* Channel Header */}
          <div className="bg-slate-950/90 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-bold text-white text-base">
                <Hash className="w-5 h-5 text-indigo-400" />
                <span>{currentChannel.name}</span>
              </div>
              <span className="hidden sm:inline text-xs text-slate-400 border-l border-slate-800 pl-3">
                {currentChannel.topic}
              </span>
            </div>

            {/* Channel Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                    activeChannelId === ch.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  #{ch.name.split('-')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-slate-900 to-slate-950/70">
            {channelMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.isUser ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-lg shrink-0">
                  {msg.avatar}
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-md ${
                    msg.isUser
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-tl-sm'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 mb-1 text-xs ${
                      msg.isUser ? 'justify-end text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{msg.sender}</span>
                    <span>•</span>
                    <span className="text-[10px]">{msg.time}</span>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* EmpathAI Intervention Badge */}
                  {msg.empathAiUsed && (
                    <div className="mt-2.5 pt-2 border-t border-indigo-400/30 flex items-center gap-1.5 text-[11px] text-indigo-100 font-medium bg-indigo-500/30 px-2 py-1 rounded-md">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Transformed with EmpathAI (Friction De-escalated)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions Overlay (Appears directly above input when triggered) */}
          <div className="px-4">
            {shouldShowSuggestions && (
              <SuggestionsCard
                suggestions={analysis.suggestions}
                onSelectSuggestion={handleSelectSuggestion}
                onDismiss={() => setDismissedSuggestions(true)}
                level={analysis.level}
              />
            )}
          </div>

          {/* Typing Composer Bar */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="relative">
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Draft your message... (EmpathAI evaluates emotional volatility in real-time)"
                  rows={3}
                  className={`w-full bg-slate-900 border rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-none ${
                    analysis.level === 'red'
                      ? 'border-rose-500/60 focus:ring-1 focus:ring-rose-500'
                      : analysis.level === 'yellow'
                      ? 'border-amber-500/50 focus:ring-1 focus:ring-amber-500'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />

                {/* Sub-50ms typing indicator badge inside composer */}
                {draftText.trim() && (
                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                        analysis.level === 'red'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                          : analysis.level === 'yellow'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {analysis.level === 'red' ? '⚠️ High Friction' : analysis.primary_tone}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
                  {draftText.trim() && (
                    <button
                      type="button"
                      onClick={triggerRewrite}
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Sparkles className="w-3 h-3" />
                      Get AI Rewrites Now
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!draftText.trim()}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-all ${
                    draftText.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Send Message</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Real-Time Tone Analytics & System Architecture (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Real-time Tone Meter */}
          <ToneMeter analysis={analysis} isAnalyzing={isAnalyzing} />

          {/* Dual-Model Architecture Explainer Card */}
          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
              <Bot className="w-4 h-4 text-indigo-400" />
              Dual-Model Pipeline Architecture
            </h4>
            
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-white block font-medium">Gatekeeper NLP (Local):</strong>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Continuously scans keystrokes for passive-aggression, hostility, and volatility. Runs in &lt;2ms at zero API cost.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-white block font-medium">Generator LLM (Gemini):</strong>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Triggered only when friction crosses into the Red zone. Synthesizes 3 de-escalated, context-preserving alternatives.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Target Latency: &lt;500ms</span>
              <span className="text-emerald-400 font-mono font-medium">Current: {analysis.latency_ms}ms</span>
            </div>
          </div>

          {/* Privacy Guarantee Card */}
          <div className="bg-emerald-950/15 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-200/90 space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>🔒 Zero-Persistence Privacy Guarantee</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Messages and keystrokes are processed strictly in-memory during active evaluation. No chat history is logged or permanently retained.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
