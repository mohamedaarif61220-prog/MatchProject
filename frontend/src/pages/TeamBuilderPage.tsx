import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { calculateOverallScore } from '../hooks/useMatchingEngine';
import { calculateTeamMetrics, previewTeamImpact } from '../hooks/useTeamMetrics';
import { CandidateMatchCard } from '../components/CandidateMatchCard';
import { WhatIfModal } from '../components/WhatIfModal';
import { apiService } from '../services/api';
import type { User, WhatIfTeamImpact } from '../types';
import { Sparkles, Users, Layers, ShieldCheck, AlertTriangle, Trash2 } from 'lucide-react';

export const TeamBuilderPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, activeProject, currentTeam, candidates, addToTeam, removeFromTeam } = useAppState();

  const project = projects.find(p => p.projectId === projectId) || activeProject;

  const [previewCandidate, setPreviewCandidate] = useState<User | null>(null);
  const [previewImpact, setPreviewImpact] = useState<WhatIfTeamImpact | null>(null);

  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendedCandidateId: string;
    suggestedRole: string;
    reasoning: string;
  } | null>(null);
  const [loadingAiRec, setLoadingAiRec] = useState<boolean>(false);

  if (!project) {
    return <div className="text-center py-20 text-slate-400">No active project selected.</div>;
  }

  // 1. Calculate Deterministic Team Metrics for active team
  const teamMetrics = calculateTeamMetrics(currentTeam, project);

  // 2. Rank Candidates pool using Deterministic Candidate Match Engine
  const candidateMatches = candidates.map(cand => ({
    user: cand,
    match: calculateOverallScore(cand, project, currentTeam)
  })).sort((a, b) => b.match.overallScore - a.match.overallScore);

  // 3. What-If Preview Handler
  const handlePreviewImpact = (candidate: User) => {
    const isMember = currentTeam.some(m => m.userId === candidate.userId);
    const action = isMember ? 'remove' : 'add';
    const impact = previewTeamImpact(candidate, action, currentTeam, project);
    setPreviewCandidate(candidate);
    setPreviewImpact(impact);
  };

  // 4. Improve My Team AI Integration
  const handleImproveMyTeam = async () => {
    setLoadingAiRec(true);
    try {
      const rec = await apiService.improveTeam(
        project.requiredSkills || [],
        project.requiredRoles || [],
        currentTeam,
        candidates
      );
      setAiRecommendation(rec);
    } catch (e) {
      console.error("Improve My Team failed:", e);
    } finally {
      setLoadingAiRec(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
      {/* Top Bar Navigation & Team Score Badge */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-accent-cyan">Dashboard</Link>
            <span>/</span>
            <span className="text-slate-200">{project.name}</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">Interactive Team Builder</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-3xl font-extrabold text-accent-cyan font-display">
              {teamMetrics.teamCompatibility}%
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Team Compatibility Score</span>
          </div>

          <button
            onClick={handleImproveMyTeam}
            disabled={loadingAiRec}
            className="btn-beam px-5 py-2.5 text-xs font-bold flex items-center gap-2"
          >
            {loadingAiRec ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing Gaps...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Improve My Team</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Recommendation Banner (if triggered) */}
      {aiRecommendation && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-accent-cyan/10 via-obsidian-900 to-accent-ember/10 border border-accent-cyan/40 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent-cyan text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Team Improvement Recommendation</span>
            </div>
            <button onClick={() => setAiRecommendation(null)} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
          </div>

          <p className="text-sm text-slate-200">
            "{aiRecommendation.reasoning}"
          </p>

          {(() => {
            const recUser = candidates.find(c => c.userId === aiRecommendation.recommendedCandidateId);
            if (!recUser) return null;
            const isAlready = currentTeam.some(m => m.userId === recUser.userId);
            return (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-slate-300">Suggested Addition: <strong className="text-white">{recUser.name}</strong> ({recUser.primaryRole})</span>
                <button
                  onClick={() => handlePreviewImpact(recUser)}
                  className="btn-secondary !px-3 !py-1 text-xs"
                >
                  Preview Addition Delta
                </button>
                {!isAlready && (
                  <button
                    onClick={() => addToTeam(recUser)}
                    className="btn-primary !px-3 !py-1 text-xs font-bold"
                  >
                    Add to Team
                  </button>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Main 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Ranked Candidate Discovery Pool (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-cyan" />
              <span>Ranked Candidate Discovery ({candidateMatches.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Highest compatibility first</span>
          </div>

          <div className="space-y-4">
            {candidateMatches.map(({ user: candidateUser, match }) => (
              <CandidateMatchCard
                key={candidateUser.userId}
                candidateMatch={match}
                candidateUser={candidateUser}
                project={project}
                onPreviewImpact={handlePreviewImpact}
                onAddToTeam={addToTeam}
                isAlreadyMember={currentTeam.some(m => m.userId === candidateUser.userId)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Active Team, Metrics & Skill Gaps (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          
          {/* Active Team Members Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Active Team ({currentTeam.length} / {project.teamSize})</span>
              </h4>
              <span className="text-xs font-semibold text-accent-cyan">{teamMetrics.teamCompatibility}% Match</span>
            </div>

            {currentTeam.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <p className="text-xs">No members added to team yet.</p>
                <p className="text-[11px] text-slate-500">Select candidate cards on the left to build team synergy.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentTeam.map(member => (
                  <div key={member.userId} className="flex justify-between items-center p-3 bg-obsidian-900 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-lg bg-slate-800" />
                      <div>
                        <p className="font-bold text-slate-200">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.primaryRole}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromTeam(member.userId)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skill Coverage Metrics */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Skill Coverage Breakdown</span>
            </h4>

            <div className="space-y-3 text-xs">
              {Object.entries(teamMetrics.skillCoverageMap).map(([skill, isCovered]) => (
                <div key={skill}>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>{skill}</span>
                    <span className={`font-semibold ${isCovered > 0 ? 'text-accent-cyan' : 'text-slate-500'}`}>
                      {isCovered > 0 ? '100% Covered' : 'Missing'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${isCovered > 0 ? 'bg-accent-cyan' : 'bg-slate-700'}`}
                      style={{ width: isCovered > 0 ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill & Role Gaps */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Structured Skill Gaps ({teamMetrics.structuredGaps.length})</span>
            </h4>

            {teamMetrics.structuredGaps.length === 0 ? (
              <p className="text-xs text-emerald-400 font-semibold">✓ All project roles and technical skills fully satisfied!</p>
            ) : (
              <div className="space-y-2 text-xs">
                {teamMetrics.structuredGaps.map(gap => (
                  <div key={gap.name} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex justify-between items-center">
                    <span>Missing {gap.name} ({gap.type})</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 rounded-md">
                      {gap.severity}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* What-If Team Simulation Modal */}
      {previewCandidate && previewImpact && (
        <WhatIfModal
          candidate={previewCandidate}
          impact={previewImpact}
          onClose={() => {
            setPreviewCandidate(null);
            setPreviewImpact(null);
          }}
          onConfirmAdd={() => addToTeam(previewCandidate)}
          isAlreadyMember={currentTeam.some(m => m.userId === previewCandidate.userId)}
        />
      )}
    </div>
  );
};
