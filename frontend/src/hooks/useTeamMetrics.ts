import type { User, Project, TeamMetrics, WhatIfTeamImpact, SkillGapItem } from '../types';
import { calculateOverallScore } from './useMatchingEngine';

/**
 * Calculates deterministic team metrics based on active team members
 * Team Score = 0.40 * Skill Coverage + 0.25 * Role Coverage + 0.25 * Avg Candidate Compat + 0.10 * Avail Compat
 * All component metrics 0.0 - 1.0; final Team Score normalized between 0.0 and 1.0 (and available as 0-100 formatted string).
 */
export const calculateTeamMetrics = (currentTeam: User[], project: Project): TeamMetrics => {
  const reqSkills = project.requiredSkills || [];
  const reqRoles = project.requiredRoles || [];
  const requiredHours = project.requiredHoursPerWeek ?? 10;

  const emptySkillCoverageMap: { [skill: string]: number } = {};
  reqSkills.forEach(s => { emptySkillCoverageMap[s] = 0; });

  const emptyRoleCoverageMap: { [role: string]: number } = {};
  reqRoles.forEach(r => { emptyRoleCoverageMap[r] = 0; });

  if (currentTeam.length === 0) {
    const structuredGaps: SkillGapItem[] = [
      ...reqRoles.map(r => ({ type: 'role' as const, name: r, severity: 'high' as const })),
      ...reqSkills.map(s => ({ type: 'skill' as const, name: s, severity: 'high' as const }))
    ];

    return {
      teamCompatibility: 0.0,
      skillCoverageFraction: 0.0,
      roleCoverageFraction: 0.0,
      avgCandidateCompatibilityFraction: 0.0,
      availabilityCompatibilityFraction: 0.0,
      skillCoverageMap: emptySkillCoverageMap,
      roleCoverageMap: emptyRoleCoverageMap,
      strengths: [],
      gaps: structuredGaps.map(g => `Missing ${g.name} ${g.type}`),
      structuredGaps,
      aiRecommendations: 'Add team members to evaluate coverage and synergy metrics.'
    };
  }

  // 1. Skill Coverage per required skill (Member has skill level >= Intermediate)
  const skillCoverageMap: { [skillName: string]: number } = {};
  reqSkills.forEach(skill => {
    const qualifiedMembers = currentTeam.filter(member => {
      const s = member.skills.find(sk => sk.name.toLowerCase().trim() === skill.toLowerCase().trim());
      return s && s.level !== 'Beginner'; // Intermediate, Proficient, Advanced
    });
    skillCoverageMap[skill] = qualifiedMembers.length > 0 ? 1.0 : 0.0;
  });

  const uniqueSkillsCovered = Object.values(skillCoverageMap).filter(v => v > 0).length;
  const C_skills = reqSkills.length > 0 ? uniqueSkillsCovered / reqSkills.length : 1.0;

  // 2. Role Coverage per required role (Member primaryRole or preferredRoles matches)
  const roleCoverageMap: { [roleName: string]: number } = {};
  reqRoles.forEach(role => {
    const matchingMembers = currentTeam.filter(member => {
      const pRole = (member.primaryRole || '').toLowerCase().trim();
      const prefRoles = (member.preferredRoles || []).map(r => r.toLowerCase().trim());
      const target = role.toLowerCase().trim();
      return pRole === target || prefRoles.includes(target);
    });
    roleCoverageMap[role] = matchingMembers.length > 0 ? 1.0 : 0.0;
  });

  const uniqueRolesCovered = Object.values(roleCoverageMap).filter(v => v > 0).length;
  const C_roles = reqRoles.length > 0 ? uniqueRolesCovered / reqRoles.length : 1.0;

  // 3. Average Candidate Compatibility across team members (0.0 to 1.0)
  const memberScores = currentTeam.map(member => {
    const peerTeam = currentTeam.filter(m => m.userId !== member.userId);
    return calculateOverallScore(member, project, peerTeam).overallScore;
  });
  const S_avg_cand = memberScores.reduce((sum, v) => sum + v, 0) / currentTeam.length;

  // 4. Availability Compatibility per team member
  const availabilityCompatibilities = currentTeam.map(member => {
    if (requiredHours <= 0) return 1.0;
    return Math.min(1.0, (member.availabilityHoursPerWeek ?? 0) / requiredHours);
  });
  const C_avail = availabilityCompatibilities.reduce((sum, v) => sum + v, 0) / currentTeam.length;

  // 5. Final Team Score (0.0 to 1.0)
  // Formula: 0.40 * C_skills + 0.25 * C_roles + 0.25 * S_avg_cand + 0.10 * C_avail
  const rawTeamScore =
    C_skills * 0.40 +
    C_roles * 0.25 +
    S_avg_cand * 0.25 +
    C_avail * 0.10;

  const teamCompatibility = Math.round(rawTeamScore * 100) / 100;

  // 6. Structured Skill-Gap & Strengths Detection
  const strengths: string[] = [];
  const structuredGaps: SkillGapItem[] = [];

  if (C_skills === 1.0) strengths.push('Complete technical skill coverage');
  if (C_roles === 1.0) strengths.push('All required project roles fulfilled');
  if (C_avail >= 0.9) strengths.push('High overall weekly hour commitment');
  if (S_avg_cand >= 0.8) strengths.push('High candidate-project alignment');

  reqRoles.forEach(role => {
    if (roleCoverageMap[role] === 0) {
      structuredGaps.push({ type: 'role', name: role, severity: 'high' });
    }
  });

  reqSkills.forEach(skill => {
    if (skillCoverageMap[skill] === 0) {
      structuredGaps.push({ type: 'skill', name: skill, severity: 'high' });
    }
  });

  if (C_avail < 0.7) {
    structuredGaps.push({ type: 'availability', name: 'Weekly Hours Deficit', severity: 'medium' });
  }

  const gaps = structuredGaps.map(g => `Missing ${g.name} ${g.type}`);

  let aiRecommendations = 'Team composition is balanced and highly capable.';
  if (structuredGaps.length > 0) {
    const topGap = structuredGaps[0];
    aiRecommendations = `Recruit candidates providing ${topGap.name} to maximize team synergy.`;
  }

  return {
    teamCompatibility,
    skillCoverageFraction: C_skills,
    roleCoverageFraction: C_roles,
    avgCandidateCompatibilityFraction: S_avg_cand,
    availabilityCompatibilityFraction: C_avail,
    skillCoverageMap,
    roleCoverageMap,
    strengths,
    gaps,
    structuredGaps,
    aiRecommendations
  };
};

/**
 * Pure What-if Team Simulation function
 * Calculates team impact without mutating the original team array or project state.
 */
export const previewTeamImpact = (
  candidate: User,
  action: 'add' | 'remove',
  currentTeam: User[],
  project: Project
): WhatIfTeamImpact => {
  const currentMetrics = calculateTeamMetrics(currentTeam, project);

  let predictedTeam: User[];
  if (action === 'add') {
    predictedTeam = [...currentTeam, candidate];
  } else {
    predictedTeam = currentTeam.filter(m => m.userId !== candidate.userId);
  }

  const predictedMetrics = calculateTeamMetrics(predictedTeam, project);
  const scoreDelta = Math.round((predictedMetrics.teamCompatibility - currentMetrics.teamCompatibility) * 100) / 100;

  const currentMissingRequirements = currentMetrics.gaps;
  const predictedMissingRequirements = predictedMetrics.gaps;

  const resolvedGaps: string[] = [];
  const newGaps: string[] = [];

  if (action === 'add') {
    currentMetrics.gaps.forEach(gap => {
      if (!predictedMetrics.gaps.includes(gap)) {
        resolvedGaps.push(gap);
      }
    });
  } else {
    predictedMetrics.gaps.forEach(gap => {
      if (!currentMetrics.gaps.includes(gap)) {
        newGaps.push(gap);
      }
    });
  }

  return {
    currentTeamScore: currentMetrics.teamCompatibility,
    predictedTeamScore: predictedMetrics.teamCompatibility,
    scoreDelta,
    currentSkillCoverage: currentMetrics.skillCoverageFraction,
    predictedSkillCoverage: predictedMetrics.skillCoverageFraction,
    currentRoleCoverage: currentMetrics.roleCoverageFraction,
    predictedRoleCoverage: predictedMetrics.roleCoverageFraction,
    currentMissingRequirements,
    predictedMissingRequirements,
    resolvedGaps,
    newGaps,
    currentMetrics,
    predictedMetrics
  };
};

/**
 * Custom React Hook exposing team metrics and What-if simulation
 */
export const useTeamMetrics = () => {
  return {
    calculateTeamMetrics,
    previewTeamImpact
  };
};
