import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Zap,
  Layers,
  ArrowRight,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Real weights from src/config/matchingConfig.ts — kept in sync with the actual engine
const SCORE_FACTORS = [
  { label: 'Skill Match', weight: 35, color: 'from-accent-cyan to-accent-cyan/60' },
  { label: 'Role Match', weight: 20, color: 'from-accent-purple to-accent-purple/60' },
  { label: 'Experience Match', weight: 15, color: 'from-accent-indigo to-accent-indigo/60' },
  { label: 'Availability Match', weight: 15, color: 'from-accent-emerald to-accent-emerald/60' },
  { label: 'Interest Match', weight: 10, color: 'from-accent-teal to-accent-teal/60' },
  { label: 'Complementarity', weight: 5, color: 'from-accent-ember to-accent-ember/60' },
];

const CANDIDATES = [
  { name: 'Aarif', role: 'Full Stack Dev', score: 94, top: '16%', ring: 'ring-accent-cyan/50', text: 'text-accent-cyan', delay: '0s' },
  { name: 'Priya', role: 'AI/ML Dev', score: 87, top: '50%', ring: 'ring-accent-purple/50', text: 'text-accent-purple', delay: '0.4s' },
  { name: 'Devan', role: 'UI/UX Designer', score: 81, top: '84%', ring: 'ring-accent-ember/50', text: 'text-accent-ember', delay: '0.8s' },
];

export const LandingPage: React.FC = () => {
  const { loginWithDemoProfile, user } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    if (!user) {
      await loginWithDemoProfile();
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6">
        {/* Ambient background glows — cool + warm, mirrors the matching duality */}
        <div className="absolute top-10 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-accent-ember/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-accent-purple/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian-900/80 border border-slate-800 text-xs font-semibold mb-8 stat-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-node-pulse" />
              <span className="text-slate-300">Deterministic Matching Engine · Built for Hackathons</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 font-display leading-[1.08]">
              Great teams aren't luck.
              <br />
              They're{' '}
              <span className="bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-ember bg-clip-text text-transparent">
                math.
              </span>
            </h1>

            <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              ProjectMatch reads your project brief with Gemini, then scores every candidate
              deterministically — skills, role, experience, availability, and complementarity —
              so you know exactly who to pick, and exactly why.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-12">
              <button
                onClick={handleDemoClick}
                className="btn-beam text-base flex items-center justify-center gap-2"
              >
                <span>Build My Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleDemoClick}
                className="btn-secondary px-8 py-3 text-base flex items-center justify-center gap-2 text-slate-300 hover:text-white"
              >
                <Zap className="w-4 h-4 text-accent-cyan" />
                <span>Try Demo Mode</span>
              </button>
            </div>

            {/* Real product stats, not logos */}
            <div className="flex items-center gap-8 text-left">
              <div>
                <div className="stat-mono text-2xl font-semibold text-white">6</div>
                <div className="text-xs text-slate-500">scoring factors</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <div className="stat-mono text-2xl font-semibold text-white">0%</div>
                <div className="text-xs text-slate-500">guesswork</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <div className="stat-mono text-2xl font-semibold text-white">100%</div>
                <div className="text-xs text-slate-500">explainable</div>
              </div>
            </div>
          </div>

          {/* Right: signature visualization — "the match beam" */}
          <div className="relative w-full max-w-md mx-auto aspect-square animate-float-slow">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible" aria-hidden="true">
              <defs>
                <linearGradient id="beamGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#fb7a3c" />
                </linearGradient>
              </defs>
              {/* glow underlay */}
              <path d="M14,50 C40,26 55,18 82,16" stroke="url(#beamGradient)" strokeWidth="2.2" fill="none" opacity="0.12" strokeLinecap="round" />
              <path d="M14,50 C40,50 55,50 88,50" stroke="url(#beamGradient)" strokeWidth="2.2" fill="none" opacity="0.12" strokeLinecap="round" />
              <path d="M14,50 C40,74 55,82 82,84" stroke="url(#beamGradient)" strokeWidth="2.2" fill="none" opacity="0.12" strokeLinecap="round" />
              {/* animated beams */}
              <path d="M14,50 C40,26 55,18 82,16" stroke="url(#beamGradient)" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeDasharray="3 2" className="animate-dash-flow" />
              <path d="M14,50 C40,50 55,50 88,50" stroke="url(#beamGradient)" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeDasharray="3 2" className="animate-dash-flow" style={{ animationDelay: '0.2s' }} />
              <path d="M14,50 C40,74 55,82 82,84" stroke="url(#beamGradient)" strokeWidth="0.6" fill="none" strokeLinecap="round" strokeDasharray="3 2" className="animate-dash-flow" style={{ animationDelay: '0.4s' }} />
            </svg>

            {/* Project node */}
            <div
              className="absolute left-[14%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 sm:w-28 glass-panel !rounded-xl px-3 py-3 border-accent-cyan/30 text-left z-10"
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                <GitBranch className="w-3 h-3" />
                Target
              </div>
              <div className="text-xs font-bold text-white leading-snug">SmartCampus AI Assistant</div>
            </div>

            {/* Candidate nodes */}
            {CANDIDATES.map((c) => (
              <div
                key={c.name}
                className="absolute right-0 -translate-y-1/2 flex items-center gap-2 z-10"
                style={{ top: c.top }}
              >
                <div className="glass-panel !rounded-full px-3 py-1.5 flex items-center gap-2 border-slate-800">
                  <div className={`w-7 h-7 rounded-full bg-obsidian-800 ring-2 ${c.ring} flex items-center justify-center text-[11px] font-bold text-white animate-node-pulse`} style={{ animationDelay: c.delay }}>
                    {c.name[0]}
                  </div>
                  <div className="text-left pr-1">
                    <div className="text-xs font-semibold text-white leading-tight">{c.name}</div>
                    <div className="text-[10px] text-slate-500 leading-tight">{c.role}</div>
                  </div>
                  <div className={`stat-mono text-xs font-bold ${c.text}`}>{c.score}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — asymmetric bento grid */}
      <section className="py-20 px-6 border-t border-slate-800/80 bg-obsidian-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-display mb-4 text-white">
              Engineered for speed, synergy &amp; transparency
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              LLM understanding on the way in, 100% deterministic scoring on the way out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-panel-interactive p-8 rounded-2xl flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="w-11 h-11 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Requirement Extraction</h3>
                <p className="text-sm text-slate-400 max-w-md">
                  Transforms an unstructured project description into structured roles, skills,
                  and complexity metrics via Gemini — no manual tagging required.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-xs stat-mono text-slate-500">
                <span className="px-2 py-1 rounded bg-obsidian-900 border border-slate-800">React</span>
                <span className="px-2 py-1 rounded bg-obsidian-900 border border-slate-800">TypeScript</span>
                <span className="px-2 py-1 rounded bg-obsidian-900 border border-slate-800">Gemini API</span>
              </div>
            </div>

            <div className="glass-panel-interactive p-8 rounded-2xl">
              <div className="w-11 h-11 rounded-lg bg-accent-emerald/10 flex items-center justify-center text-accent-emerald mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Explainable Matching</h3>
              <p className="text-sm text-slate-400">
                Six weighted, deterministic factors decide the score. Gemini explains it in plain
                language.
              </p>
            </div>

            <div className="glass-panel-interactive p-8 rounded-2xl">
              <div className="w-11 h-11 rounded-lg bg-accent-indigo/10 flex items-center justify-center text-accent-indigo mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Team Gap Detection</h3>
              <p className="text-sm text-slate-400">
                Watches your active roster to flag missing skills, unfilled roles, or hour
                deficits before they cost you.
              </p>
            </div>

            <div className="md:col-span-2 glass-panel-interactive p-8 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="w-11 h-11 rounded-lg bg-accent-ember/10 flex items-center justify-center text-accent-ember mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">What-If Team Simulation</h3>
                <p className="text-sm text-slate-400 max-w-sm">
                  Preview coverage and score deltas before you commit a candidate — swap people in
                  and out risk-free.
                </p>
              </div>
              <div className="w-full md:w-40 shrink-0">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 stat-mono">
                  <span>coverage</span><span>+12%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-accent-ember to-accent-cyan h-2 rounded-full w-[78%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it scores — real weighted factors from the engine */}
      <section className="py-20 px-6 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold font-display mb-4 text-white">How a match gets its score</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Every candidate is evaluated against the same six weighted factors — the same
              inputs, every time.
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-2xl space-y-5">
            {SCORE_FACTORS.map((f) => (
              <div key={f.label} className="flex items-center gap-4">
                <div className="w-40 shrink-0 text-sm font-medium text-slate-300">{f.label}</div>
                <div className="flex-1 h-2.5 bg-obsidian-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${f.color}`}
                    style={{ width: `${f.weight * 2.6}%` }}
                  />
                </div>
                <div className="w-12 text-right stat-mono text-sm font-semibold text-white">{f.weight}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <div className="glass-panel p-10 md:p-14 rounded-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent-ember/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <Users className="w-8 h-8 text-accent-cyan mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-white mb-4 font-display">
            Every teammate, scored. Every score, explained.
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            Try Demo Mode — zero setup, real scoring, your dream team in minutes.
          </p>
          <button
            onClick={handleDemoClick}
            className="btn-beam text-base font-bold inline-flex items-center gap-2"
          >
            <span>Find Your Team</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
