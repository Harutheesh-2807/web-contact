import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Copy, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  X, 
  Key, 
  Globe 
} from 'lucide-react';
import { 
  getActiveSupabaseConfig, 
  saveSupabaseConfig, 
  clearSupabaseConfig, 
  testSupabaseConnection, 
  SUPABASE_RLS_SQL_SCHEMA,
  isSupabaseActive 
} from '../lib/supabase';
import { dataStore } from '../lib/dataStore';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getActiveSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Both Supabase URL and public Anon Key are required.' });
      return;
    }

    saveSupabaseConfig(url.trim(), anonKey.trim());
    await dataStore.syncWithSupabase();
    setTestResult({ success: true, message: 'Configuration saved! Synced with Supabase database.' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleResetToEnv = () => {
    clearSupabaseConfig();
    const fresh = getActiveSupabaseConfig();
    setUrl(fresh.url);
    setAnonKey(fresh.anonKey);
    setTestResult(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#12151d] border border-purple-500/30 rounded-2xl shadow-2xl p-6 text-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-500/30 text-purple-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Supabase &amp; Row Level Security (RLS)
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  isSupabaseActive() 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
                }`}>
                  {isSupabaseActive() ? 'Connected' : 'Configuration Ready'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Secure cloud authentication, PostgreSQL database, and RLS policies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="mb-5 p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
          <div className="text-xs text-zinc-300 leading-relaxed">
            <span className="font-semibold text-purple-300">Frontend Security Guard:</span> Only public <code className="text-purple-200 bg-purple-950/60 px-1 py-0.5 rounded">Anon Key</code> is used in the browser. Service role keys and secrets are strictly protected. Client operations rely on Supabase Row Level Security (RLS) rules.
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzprojectid.supabase.co"
              className="w-full bg-[#181d28] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              Supabase Public Anon Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#181d28] border border-zinc-700/80 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono text-xs"
            />
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div className={`mb-5 p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
            testResult.success 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}>
            {testResult.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <div>
              <p className="font-medium">{testResult.message}</p>
              {testResult.latencyMs !== undefined && (
                <p className="text-[10px] text-zinc-400">Response latency: {testResult.latencyMs}ms</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testing || !url || !anonKey}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" /> : <RefreshCw className="w-3.5 h-3.5 text-purple-400" />}
              Test Connection
            </button>
            <button
              onClick={handleResetToEnv}
              className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors"
            >
              Reset
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={!url || !anonKey}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950/50 transition-all disabled:opacity-50"
          >
            Save &amp; Connect Supabase
          </button>
        </div>

        {/* SQL Schema Generator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Supabase SQL Migration &amp; RLS Policies
              </h3>
              <p className="text-[11px] text-zinc-400">
                Run this SQL script in your Supabase dashboard to provision tables with Row Level Security
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/50 transition-colors flex items-center gap-1.5"
            >
              {copiedSql ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy SQL Script
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-3.5 font-mono text-[11px] text-zinc-300 max-h-48 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{SUPABASE_RLS_SQL_SCHEMA}</pre>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <span>Requires Supabase project with PostgreSQL 15+</span>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noreferrer" 
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
            >
              Open Supabase Dashboard
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
