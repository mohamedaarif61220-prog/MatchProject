import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, ArrowRight, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/firebase';

export const LoginPage: React.FC = () => {
  const { loginWithDemoProfile, loginWithEmail, registerWithEmail, loginWithGoogle, user, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    await loginWithDemoProfile();
    navigate('/dashboard');
  };

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
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-ember" />
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display text-white mb-2">Access ProjectMatch</h2>
          <p className="text-sm text-slate-400">Choose your preferred authentication option.</p>
        </div>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{localError || error}</span>
          </div>
        )}

        {user ? (
          <div className="text-center space-y-4">
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
          <div className="space-y-6">
            {/* Primary Demo Mode Login */}
            <div className="p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-left">
              <div className="flex items-center gap-2 text-accent-cyan font-semibold mb-1">
                <Zap className="w-4 h-4" />
                <span>Fast Competition Entry</span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Instantly initializes Demo Lead profile and SmartCampus dataset locally.
              </p>
              <button
                onClick={handleDemoLogin}
                disabled={submitting}
                className="btn-beam w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>Enter Demo Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-obsidian-900 px-3 text-xs text-slate-500 uppercase font-semibold absolute">or</span>
            </div>

            {/* Cloud Firebase Authentication */}
            <div className="p-4 rounded-xl bg-obsidian-900/80 border border-slate-800 text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Real Firebase Auth</span>
                </div>
                {isFirebaseConfigured && (
                  <div className="flex gap-2 text-xs">
                    <button 
                      type="button"
                      onClick={() => setMode('signin')}
                      className={`px-2 py-0.5 rounded ${mode === 'signin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Sign In
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMode('signup')}
                      className={`px-2 py-0.5 rounded ${mode === 'signup' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>

              {!isFirebaseConfigured ? (
                <div className="text-xs text-slate-400 space-y-2">
                  <p>Firebase environment variables not set. Firebase cloud features will fallback to local storage mode.</p>
                </div>
              ) : (
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full bg-obsidian-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full bg-obsidian-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-obsidian-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-secondary w-full py-2.5 text-xs text-white bg-indigo-600/80 hover:bg-indigo-600 border-indigo-500/50 flex items-center justify-center gap-1.5"
                  >
                    {mode === 'signup' ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                    <span>{submitting ? 'Authenticating...' : mode === 'signup' ? 'Create Firebase Account' : 'Sign In with Firebase'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={submitting}
                    className="w-full py-2 text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>Sign in with Google</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

