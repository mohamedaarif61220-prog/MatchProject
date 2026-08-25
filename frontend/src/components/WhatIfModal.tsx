import React from 'react';
import type { User, WhatIfTeamImpact } from '../types';
import { X, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface WhatIfModalProps {
  candidate: User;
  impact: WhatIfTeamImpact;
  onClose: () => void;
  onConfirmAdd: () => void;
  isAlreadyMember: boolean;
}

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  candidate,
  impact,
  onClose,
  onConfirmAdd,
  isAlreadyMember
}) => {
  const currentPercent = Math.round(impact.currentTeamScore * 100);
  const predictedPercent = Math.round(impact.predictedTeamScore * 100);
  const deltaPercent = Math.round(impact.scoreDelta * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel max-w-xl w-full p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-semibold mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>What-If Team Simulation (Pure Calculation)</span>
            </div>
            <h3 className="text-xl font-bold text-white font-display">
              Preview Adding {candidate.name}
            </h3>
            <p className="text-xs text-slate-400">{candidate.primaryRole} • {candidate.experience}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compatibility Score Delta Banner */}
        <div className="p-4 bg-obsidian-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Current Score</span>
            <p className="text-2xl font-bold text-slate-300 font-display">{currentPercent}%</p>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-5 h-5 text-slate-500" />
            <span className={`text-xs font-bold ${deltaPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {deltaPercent >= 0 ? `+${deltaPercent}%` : `${deltaPercent}%`} Delta
            </span>
          </div>

          <div className="text-center">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Predicted Score</span>
            <p className="text-2xl font-bold text-accent-cyan font-display">{predictedPercent}%</p>
          </div>
        </div>

        {/* Skill & Role Coverage Comparison */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Skill Coverage</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-300 font-semibold">{Math.round(impact.currentSkillCoverage * 100)}%</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-accent-cyan font-bold">{Math.round(impact.predictedSkillCoverage * 100)}%</span>
            </div>
          </div>

          <div className="p-3 bg-obsidian-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium">Role Coverage</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-slate-300 font-semibold">{Math.round(impact.currentRoleCoverage * 100)}%</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <span className="text-indigo-400 font-bold">{Math.round(impact.predictedRoleCoverage * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Resolved vs Unresolved Gaps */}
        <div className="space-y-2 text-xs">
          {impact.resolvedGaps.length > 0 && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Gaps Resolved by this Candidate</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-emerald-200 pl-1">
                {impact.resolvedGaps.map(g => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          )}

          {impact.predictedMissingRequirements.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Remaining Team Gaps</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-200 pl-1">
                {impact.predictedMissingRequirements.map(g => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button onClick={onClose} className="btn-secondary !px-4 !py-2 text-xs text-slate-300">
            Close Preview
          </button>
          {!isAlreadyMember && (
            <button
              onClick={() => {
                onConfirmAdd();
                onClose();
              }}
              className="btn-beam !px-5 !py-2 text-xs font-bold"
            >
              Confirm & Add to Team
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
