import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatSimulator from './components/ChatSimulator';
import ComparisonView from './components/ComparisonView';
import ApiKeyModal from './components/ApiKeyModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'comparison'
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('empathai_gemini_api_key') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('empathai_gemini_api_key', newKey);
    } else {
      localStorage.removeItem('empathai_gemini_api_key');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        connectionStatus={connectionStatus}
        hasApiKey={Boolean(apiKey)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'workspace' ? (
          <ChatSimulator
            apiKey={apiKey}
            onOpenSettings={() => setIsApiKeyModalOpen(true)}
          />
        ) : (
          <ComparisonView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">EmpathAI</span>
            <span>•</span>
            <span>AFFECIO HACKS '26 (AI & Social Interaction Track)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>FastAPI + WebSockets</span>
            <span>•</span>
            <span>Gatekeeper NLP</span>
            <span>•</span>
            <span>Google Gemini LLM</span>
            <span>•</span>
            <span>React + Tailwind</span>
          </div>
        </div>
      </footer>

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

    </div>
  );
}
