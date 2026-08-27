import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Mail, Lock, LogIn, UserPlus, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      if (mode === 'signup') {
        await registerWithEmail(email, password, name);
        navigate('/onboarding');
      } else {
        await loginWithEmail(email, password);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setLocalError(err?.message || "Authentication failed. Please check credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setLocalError(err?.message || "Google auth failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="glass-panel w-full p-8 sm:p-12 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-ember" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Brand Panel */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Team Matchmaking</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              Build your ideal project team with{' '}
              <span className="bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-ember bg-clip-text text-transparent">
                precision AI.
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
              From hackathons and startups to research sprints and open-source builds, ProjectMatch intelligently connects collaborators using deterministic skill matching and Gemini AI.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white stat-mono">100%</div>
                <div className="text-xs text-slate-500">Deterministic Match</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white stat-mono">Gemini</div>
                <div className="text-xs text-slate-500">AI Extraction</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white stat-mono">Realtime</div>
                <div className="text-xs text-slate-500">Team Simulation</div>
              </div>
            </div>
          </div>

          {/* Right Authentication Form Panel */}
          <div className="lg:col-span-5 bg-obsidian-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="text-left mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-display text-white">
                  {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <div className="flex gap-1 bg-obsidian-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setLocalError(null); clearError(); }}
                    className={`px-3 py-1 rounded-md transition-all font-medium ${mode === 'signin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setLocalError(null); clearError(); }}
                    className={`px-3 py-1 rounded-md transition-all font-medium ${mode === 'signup' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Register
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'signup' ? 'Join ProjectMatch to start matching with teams.' : 'Sign in to access your projects and matches.'}
              </p>
            </div>

            {(error || localError) && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {user ? (
              <div className="text-center space-y-4 py-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                  Logged in as <strong>{user.name}</strong> ({user.primaryRole})
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full bg-obsidian-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 text-slate-500 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-obsidian-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-200 focus:outline-none p-1 rounded-md transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-500/50 flex items-center justify-center gap-2 transition-all mt-2"
                >
                  {mode === 'signup' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{submitting ? 'Authenticating...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-obsidian-900 px-3 text-[11px] text-slate-500 uppercase font-semibold absolute">or</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={submitting}
                  className="w-full py-2.5 text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Sign in with Google</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
