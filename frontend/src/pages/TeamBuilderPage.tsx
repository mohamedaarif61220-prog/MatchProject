import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { calculateOverallScore } from '../hooks/useMatchingEngine';
import { calculateTeamMetrics, previewTeamImpact } from '../hooks/useTeamMetrics';
import { CandidateMatchCard } from '../components/CandidateMatchCard';
import { WhatIfModal } from '../components/WhatIfModal';
import { apiService } from '../services/api';
import type { User, WhatIfTeamImpact } from '../types';
import { Sparkles, Users, Layers, ShieldCheck, AlertTriangle, Trash2, Send, X } from 'lucide-react';

export const TeamBuilderPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, activeProject, currentTeam, candidates, addToTeam, removeFromTeam, sendTeamInvitation } = useAppState();

  const project = projects.find(p => p.projectId === projectId) || activeProject;

  const [previewCandidate, setPreviewCandidate] = useState<User | null>(null);
  const [previewImpact, setPreviewImpact] = useState<WhatIfTeamImpact | null>(null);

  // Invite modal state
  const [inviteModalCandidate, setInviteModalCandidate] = useState<User | null>(null);
  const [inviteCustomNote, setInviteCustomNote] = useState<string>('');
  const [sendingInvite, setSendingInvite] = useState<boolean>(false);
  const [inviteSentToast, setInviteSentToast] = useState<string | null>(null);

  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendedCandidateId: string;
    suggestedRole: string;
    reasoning: string;
  } | null>(null);
  const [loadingAiRec, setLoadingAiRec] = useState<boolean>(false);
  const [creatingTeam, setCreatingTeam] = useState<boolean>(false);

  if (!project) {
    return <div className="text-center py-20 text-slate-400">No active project selected.</div>;
  }

  // Handle invitation modal launch
  const handleOpenInviteModal = (candidate: User) => {
    setInviteModalCandidate(candidate);
    const topSkills = candidate.skills.slice(0, 3).map(s => s.name).join(', ');
    setInviteCustomNote(
      `Hi ${candidate.name}, we saw your impressive background in ${topSkills || candidate.primaryRole}. We're building ${project.name} and would love to collaborate with you as our ${candidate.primaryRole}!`
    );
  };

  const handleConfirmSendInvite = async () => {
    if (!inviteModalCandidate) return;
    setSendingInvite(true);
    try {
      await sendTeamInvitation(inviteModalCandidate.userId, inviteCustomNote);
      setInviteSentToast(`Invitation sent to ${inviteModalCandidate.name}!`);
      setTimeout(() => setInviteSentToast(null), 4000);
      setInviteModalCandidate(null);
    } catch (e) {
      console.error("Failed to send invitation:", e);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCreateTeamAndSendAllInvites = async () => {
    if (currentTeam.length === 0) return;
    setCreatingTeam(true);
    try {
      // Dispatch invitations to all team members concurrently
      await Promise.all(
        currentTeam.map(member => {
          const topSkills = member.skills.slice(0, 3).map(s => s.name).join(', ');
          const note = `Hi ${member.name}, we selected you for ${project.name}! Your expertise in ${topSkills || member.primaryRole} is a perfect match for our team as our ${member.primaryRole}. We're excited to work with you!`;
          return sendTeamInvitation(member.userId, note);
        })
      );
      setInviteSentToast(`Team Finalized! Sent invitations to all ${currentTeam.length} team members.`);
      setTimeout(() => setInviteSentToast(null), 5000);
    } catch (e) {
      console.error("Error creating team and sending invitations:", e);
    } finally {
      setCreatingTeam(false);
    }
  };

  const { user } = useAuth();

  // Ensure current logged-in user is always included in the active team list as Team Lead
  const effectiveTeam: User[] = React.useMemo(() => {
    if (!user) return currentTeam;
    if (currentTeam.some(m => m.userId === user.userId)) {
      return currentTeam;
    }
    return [user, ...currentTeam];
  }, [currentTeam, user]);

  // 1. Calculate Deterministic Team Metrics for active team including owner
  const teamMetrics = calculateTeamMetrics(effectiveTeam, project);

  // 2. Rank Candidates pool using Deterministic Candidate Match Engine
  const candidateMatches = candidates.map(cand => ({
    user: cand,
    match: calculateOverallScore(cand, project, effectiveTeam)
  })).sort((a, b) => b.match.overallScore - a.match.overallScore);

  // 3. What-If Preview Handler
  const handlePreviewImpact = (candidate: User) => {
    const isMember = effectiveTeam.some(m => m.userId === candidate.userId);
    const action = isMember ? 'remove' : 'add';
    const impact = previewTeamImpact(candidate, action, effectiveTeam, project);
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
                onSendInvite={handleOpenInviteModal}
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
                <span>Active Team ({effectiveTeam.length} / {project.teamSize})</span>
              </h4>
              <span className="text-xs font-semibold text-accent-cyan">{teamMetrics.teamCompatibility}% Match</span>
            </div>

            {effectiveTeam.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <p className="text-xs">No members added to team yet.</p>
                <p className="text-[11px] text-slate-500">Select candidate cards on the left to build team synergy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2.5">
                  {effectiveTeam.map(member => {
                    const isOwner = member.userId === user?.userId;
                    return (
                      <div key={member.userId} className="flex justify-between items-center p-3 bg-obsidian-900 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-lg bg-slate-800 object-cover" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-200">{member.name}</p>
                              {isOwner && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-accent-cyan/20 text-accent-cyan rounded border border-accent-cyan/40">
                                  You (Lead)
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">{member.primaryRole}</p>
                          </div>
                        </div>

                        {!isOwner ? (
                          <button
                            onClick={() => removeFromTeam(member.userId)}
                            className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Owner</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Create Team & Notify All Action Button */}
                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={handleCreateTeamAndSendAllInvites}
                    disabled={creatingTeam}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                      effectiveTeam.length >= project.teamSize
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {creatingTeam
                        ? 'Creating Team & Sending Invitations...'
                        : effectiveTeam.length >= project.teamSize
                        ? `Create Team & Notify All (${effectiveTeam.length} Members)`
                        : `Create Team & Notify (${effectiveTeam.length} / ${project.teamSize})`}
                    </span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5">
                    Sends automated personalized invitations to all selected candidates.
                  </p>
                </div>
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

      {/* Send Invitation Modal */}
      {inviteModalCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-ember" />

            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={inviteModalCandidate.avatarUrl}
                  alt={inviteModalCandidate.name}
                  className="w-12 h-12 rounded-xl bg-slate-800 border border-accent-cyan/30"
                />
                <div>
                  <h3 className="text-base font-bold text-white font-display">Invite {inviteModalCandidate.name}</h3>
                  <p className="text-xs text-slate-400">{inviteModalCandidate.primaryRole} • {inviteModalCandidate.experience} Level</p>
                </div>
              </div>
              <button
                onClick={() => setInviteModalCandidate(null)}
                className="text-slate-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-obsidian-900 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Target Project</span>
              <p className="font-bold text-white text-sm">{project.name}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {inviteModalCandidate.skills.map((s: any) => (
                  <span key={s.name} className="px-2 py-0.5 bg-slate-800 text-accent-cyan rounded text-[10px] border border-slate-700">
                    {s.name} ({s.level})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Invitation Note / Interest Pitch</label>
              <textarea
                rows={4}
                value={inviteCustomNote}
                onChange={e => setInviteCustomNote(e.target.value)}
                className="w-full bg-obsidian-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-accent-cyan leading-relaxed resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInviteModalCandidate(null)}
                className="btn-secondary flex-1 py-2.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSendInvite}
                disabled={sendingInvite}
                className="btn-beam flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingInvite ? 'Sending Invitation...' : 'Send Team Invitation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {inviteSentToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <ShieldCheck className="w-4 h-4" />
          <span>{inviteSentToast}</span>
        </div>
      )}
    </div>
  );
};
