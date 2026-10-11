import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldAlert, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles, 
  Database, 
  ArrowLeft, 
  ShieldCheck,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseActive } from '../lib/supabase';
import { SupabaseModal } from './SupabaseModal';

interface AdminLoginProps {
  onSuccess: () => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToWebsite }) => {
  const { login, resetPassword, updatePassword, error, clearError, authorizedAdmins } = useAuth();

  const [mode, setMode] = useState<'login' | 'reset' | 'new_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  const isConnectedToSupabase = isSupabaseActive();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalMessage(null);
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        onSuccess();
      } else if (result.error) {
        setLocalMessage({ type: 'error', text: result.error });
      }
    } catch (err: any) {
      setLocalMessage({ type: 'error', text: err?.message || 'Login encounter an unexpected error.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalMessage(null);
    setIsSubmitting(true);

    try {
      const res = await resetPassword(email);
      if (res.success) {
        setLocalMessage({ type: 'success', text: res.message });
      } else {
        setLocalMessage({ type: 'error', text: res.error || res.message });
      }
    } catch (err: any) {
      setLocalMessage({ type: 'error', text: err?.message || 'Password reset request failed.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalMessage(null);

    if (newPassword !== confirmNewPassword) {
      setLocalMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setLocalMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setLocalMessage({ type: 'success', text: res.message });
        setTimeout(() => {
          setMode('login');
          setPassword(newPassword);
        }, 1500);
      } else {
        setLocalMessage({ type: 'error', text: res.error || res.message });
      }
    } catch (err: any) {
      setLocalMessage({ type: 'error', text: err?.message || 'Failed to update password.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (adminEmail: string) => {
    setEmail(adminEmail);
    setPassword('AuraAdmin2026!');
    clearError();
    setLocalMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0c12] text-zinc-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Radial Glow & Grid Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-purple-900/25 via-indigo-950/15 to-transparent blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-950/10 blur-[120px] pointer-events-none -z-0" />
      
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between relative z-10">
        <button
          onClick={onBackToWebsite}
          className="group flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white px-3.5 py-2 rounded-xl bg-[#131620] border border-zinc-800 hover:border-purple-500/40 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Agency Site</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSupabaseModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isConnectedToSupabase 
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40' 
                : 'bg-zinc-900/80 border-purple-500/30 text-purple-300 hover:bg-purple-950/40'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Supabase RLS:</span>
            <span className="font-semibold">{isConnectedToSupabase ? 'Active' : 'Configure'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Brand Badge */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-950 to-zinc-900 border border-purple-500/40 shadow-xl shadow-purple-950/40 mb-3 text-purple-400">
              <Sparkles className="w-7 h-7 text-purple-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AuraDev <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300">Admin Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xs mx-auto">
              Secure enterprise management for client deployments, team roles, and lead pipeline
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#11141e]/90 backdrop-blur-xl border border-zinc-800/90 hover:border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] relative transition-all">
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-purple-500/60 to-transparent rounded-full" />

            {/* Error / Feedback Alert Banner */}
            {(error || localMessage) && (
              <div 
                className={`mb-6 p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 animate-fadeIn ${
                  (localMessage?.type === 'success') 
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300' 
                    : (localMessage?.type === 'info')
                    ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300'
                    : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                }`}
              >
                {localMessage?.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold mb-0.5">
                    {localMessage?.type === 'success' ? 'Verification Sent' : 'Security Alert'}
                  </div>
                  <p>{localMessage?.text || error}</p>
                </div>
              </div>
            )}

            {/* 1. SIGN IN MODE */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Admin Email Address</span>
                    <span className="text-[10px] text-purple-400 font-normal">Authorized Accounts Only</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="admin@auradev.studio"
                      className="w-full bg-[#161a25] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Master Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        clearError();
                        setLocalMessage(null);
                        setMode('reset');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) clearError();
                      }}
                      placeholder="••••••••••••"
                      className="w-full bg-[#161a25] border border-zinc-800 rounded-xl pl-10 pr-11 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:via-indigo-500 hover:to-purple-500 shadow-lg shadow-purple-950/60 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authenticate Session</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. PASSWORD RESET FLOW */}
            {mode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-base">Password Recovery</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Enter your registered administrator email address to trigger a secure reset verification via Supabase Auth.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@auradev.studio"
                      className="w-full bg-[#161a25] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setLocalMessage(null);
                      setMode('login');
                    }}
                    className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('new_password')}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    Have a reset token?
                  </button>
                </div>
              </form>
            )}

            {/* 3. SET NEW PASSWORD */}
            {mode === 'new_password' && (
              <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Set New Password</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Define a strong new administrative password (minimum 6 characters).
                </p>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#161a25] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#161a25] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Update Administrator Password</span>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      clearError();
                      setLocalMessage(null);
                      setMode('login');
                    }}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel and return to login
                  </button>
                </div>
              </form>
            )}

            {/* Quick Access Helper for Authorized Admins */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  Authorized Directory
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">RBAC Enabled</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {authorizedAdmins.slice(0, 2).map((admin) => (
                  <button
                    key={admin.email}
                    type="button"
                    onClick={() => handleQuickFill(admin.email)}
                    className="p-2.5 rounded-xl bg-[#161a26] hover:bg-purple-950/30 border border-zinc-800/80 hover:border-purple-500/30 text-left transition-all group"
                  >
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 truncate">
                      {admin.name.split(' ')[0]} ({admin.role.replace('_', ' ')})
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono truncate">{admin.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Security & RLS Disclaimer */}
          <div className="mt-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Supabase Row Level Security enforced on all endpoints</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-zinc-400 border-t border-zinc-900">
        &copy; {new Date().getFullYear()} AuraDev Web Development Business. All administrative rights reserved.
      </footer>

      {/* Supabase Connection Setup Modal */}
      <SupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};
