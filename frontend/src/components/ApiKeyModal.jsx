import React, { useState } from 'react';
import { Key, Sparkles, X, Check, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setStatusMessage('Key saved for active session!');
    setTimeout(() => {
      setStatusMessage('');
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
    setStatusMessage('Key cleared. Heuristic mode will be used.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Google Gemini LLM Settings</h3>
            <p className="text-xs text-slate-400">
              Configure your API credentials for generative empathetic rewrites
            </p>
          </div>
        </div>

        {/* Dual-Model Strategy Notice */}
        <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 mb-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold">
            <Cpu className="w-4 h-4" />
            <span>EmpathAI Dual-Model Pipeline:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong>1. Gatekeeper NLP (Local):</strong> Evaluates keystrokes in sub-2ms with 0 API consumption.
          </p>
          <p className="text-slate-300 leading-relaxed">
            <strong>2. Generator LLM (Gemini 2.5 Flash):</strong> Invoked only when emotional friction breaches the threshold to rewrite messages with high emotional intelligence.
          </p>
          <p className="text-slate-400 text-[11px]">
            * Note: If left empty, EmpathAI seamlessly runs its built-in rule-based empathetic engine so all features work completely offline!
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 font-mono outline-none transition-all"
          />
          <div className="flex items-center justify-between text-[11px] pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
            >
              <span>Get a free Gemini API key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {apiKey && (
              <button
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 hover:underline"
              >
                Clear Saved Key
              </button>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
