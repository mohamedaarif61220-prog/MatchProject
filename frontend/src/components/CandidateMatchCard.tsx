import React, { useState } from 'react';
import type { CandidateMatch } from '../types';
import { apiService } from '../services/api';
import { Sparkles, Check, ChevronDown, ChevronUp, UserPlus, Send } from 'lucide-react';

interface CandidateCardProps {
  candidateMatch: CandidateMatch;
  candidateUser: any;
  project: any;
  onPreviewImpact: (candidate: any) => void;
  onAddToTeam: (candidate: any) => void;
  onSendInvite?: (candidate: any) => void;
  isAlreadyMember: boolean;
}

export const CandidateMatchCard: React.FC<CandidateCardProps> = ({
  candidateMatch,
  candidateUser,
  project,
  onPreviewImpact,
  onAddToTeam,
  onSendInvite,
  isAlreadyMember
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>(candidateMatch.explanation || '');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  const overallPercent = Math.round(candidateMatch.overallScore * 100);

  const handleFetchAiExplanation = async () => {
    setExpanded(prev => !prev);
    if (!explanation || explanation === candidateMatch.explanation) {
      setLoadingAi(true);
      try {
        const text = await apiService.explainMatch(
          project.requiredSkills || [],
          project.requiredRoles || [],
          candidateUser,
          {
            overallScore: candidateMatch.overallScore,
            skillScore: candidateMatch.skillScore,
            roleScore: candidateMatch.roleScore,
            experienceScore: candidateMatch.experienceScore,
            availabilityScore: candidateMatch.availabilityScore,
            interestScore: candidateMatch.interestScore,
            complementarityScore: candidateMatch.complementarityScore
          }
        );
        setExplanation(text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAi(false);
      }
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <img
            src={candidateUser.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate"}
            alt={candidateUser.name}
            className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-white">{candidateUser.name}</h4>
              <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full font-medium">
                {candidateUser.experience}
              </span>
            </div>
            <p className="text-xs text-slate-400">{candidateUser.primaryRole}</p>
          </div>
        </div>

        {/* Radial Compatibility Score Badge */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-extrabold text-accent-cyan font-display">{overallPercent}%</span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Match Score</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onPreviewImpact(candidateUser)}
              className="btn-secondary !px-3 !py-1.5 text-xs text-slate-300 hover:text-white"
            >
              Preview Impact
            </button>

            <button
              onClick={() => onSendInvite ? onSendInvite(candidateUser) : onAddToTeam(candidateUser)}
              className="btn-secondary !px-3 !py-1.5 text-xs text-accent-cyan hover:text-white border-accent-cyan/40 flex items-center gap-1"
              title="Send direct invitation to candidate"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invite</span>
            </button>

            <button
              onClick={() => onAddToTeam(candidateUser)}
              disabled={isAlreadyMember}
              className={`btn-primary !px-3 !py-1.5 text-xs font-bold flex items-center gap-1 ${
                isAlreadyMember ? 'opacity-50 cursor-not-allowed bg-slate-700' : ''
              }`}
            >
              {isAlreadyMember ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              <span>{isAlreadyMember ? 'Added' : 'Add to Team'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Skills Tags */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-500 font-medium text-[11px]">Skills:</span>
        {candidateUser.skills.map((s: any) => (
          <span key={s.name} className="px-2 py-0.5 bg-obsidian-900 border border-slate-800 text-slate-300 rounded-md text-[11px]">
            {s.name} <span className="text-accent-cyan font-semibold">({s.level})</span>
          </span>
        ))}
      </div>

      {/* 6 Deterministic Factor Score Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Skills</span>
            <span className="font-semibold text-slate-200">{Math.round(candidateMatch.skillScore * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-accent-cyan h-1.5 rounded-full" style={{ width: `${candidateMatch.skillScore * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Role</span>
            <span className="font-semibold text-slate-200">{Math.round(candidateMatch.roleScore * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${candidateMatch.roleScore * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Exp</span>
            <span className="font-semibold text-slate-200">{Math.round(candidateMatch.experienceScore * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${candidateMatch.experienceScore * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Hours</span>
            <span className="font-semibold text-slate-200">{Math.round(candidateMatch.availabilityScore * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${candidateMatch.availabilityScore * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Interests</span>
            <span className="font-semibold text-slate-200">{Math.round(candidateMatch.interestScore * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-pink-400 h-1.5 rounded-full" style={{ width: `${candidateMatch.interestScore * 100}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Synergy</span>
            <span className="font-semibold text-slate-200">{Math.round(candidateMatch.complementarityScore * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${candidateMatch.complementarityScore * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Why This Match Toggle */}
      <div>
        <button
          onClick={handleFetchAiExplanation}
          className="text-xs font-semibold text-accent-cyan hover:text-accent-cyan/70 flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Why this Match?</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 p-3.5 bg-obsidian-900/80 rounded-xl border border-accent-cyan/20 text-xs text-slate-300 space-y-2">
            {loadingAi ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="w-3 h-3 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                <span>Analyzing match rationale...</span>
              </div>
            ) : (
              <p className="leading-relaxed">
                "{explanation}"
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Availability: <strong className="text-slate-200">{candidateUser.availabilityHoursPerWeek} hrs/wk</strong></span>
              <span>Matched Roles: <strong className="text-slate-200">{candidateMatch.matchedRoles.join(', ') || 'Primary Role'}</strong></span>
              <span>Synergy: <strong className="text-emerald-400">{candidateMatch.teamContribution}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
