import type { SkillLevel, User, Project, CandidateMatch } from '../types';
import {
  MATCHING_WEIGHTS,
  PROFICIENCY_COEFFICIENTS,
  EXPERIENCE_COEFFICIENTS,
  ROLE_ADJACENCY_MAP
} from '../config/matchingConfig';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const experienceRank = (level: string): number => {
  const normalized = (level || '').toLowerCase();
  if (normalized === 'beginner') return 1;
  if (normalized === 'intermediate') return 2;
  if (normalized === 'advanced') return 3;
  return 2; // Default fallback to intermediate
};

// ─── 5. Skill Matching Engine ────────────────────────────────────────────────
/**
 * Calculates deterministic Skill Score (35%)
 * S_raw_skill = coefficient sum / number of required skills
 * Nice-to-have bonus: +0.05 per matched nice-to-have skill
 * Cap at 1.0. Case-insensitive string comparisons.
 * Edge case: 0 required skills => returns 1.0 (neutral / fully satisfied).
 */
export const calculateSkillScore = (candidate: User, project: Project): number => {
  const reqSkills = project.requiredSkills || [];
  if (reqSkills.length === 0) return 1.0;

  let coefSum = 0;
  reqSkills.forEach(req => {
    const candidateSkill = candidate.skills.find(
      s => s.name.toLowerCase().trim() === req.toLowerCase().trim()
    );
    if (candidateSkill) {
      const coef = PROFICIENCY_COEFFICIENTS[candidateSkill.level as SkillLevel] ?? 0.0;
      coefSum += coef;
    }
  });

  let score = coefSum / reqSkills.length;

  const niceSkills = project.niceToHaveSkills || [];
  niceSkills.forEach(nice => {
    const hasNice = candidate.skills.some(
      s => s.name.toLowerCase().trim() === nice.toLowerCase().trim()
    );
    if (hasNice) {
      score += 0.05;
    }
  });

  return Math.min(1.0, score);
};

// ─── 6. Role Matching Engine ─────────────────────────────────────────────────
/**
 * Calculates deterministic Role Score (20%)
 * 1.0 -> primaryRole matches required role
 * 0.8 -> preferredRoles contains matching role
 * 0.2 -> primary role is adjacent
 * 0.0 -> no overlap
 * Edge case: 0 required roles => returns 1.0. Case-insensitive.
 */
export const calculateRoleScore = (candidate: User, project: Project): number => {
  const reqRoles = project.requiredRoles || [];
  if (reqRoles.length === 0) return 1.0;

  const candPrimary = (candidate.primaryRole || '').toLowerCase().trim();
  const candPreferred = (candidate.preferredRoles || []).map(r => r.toLowerCase().trim());

  // 1. Exact primary role match (1.0)
  const primaryMatch = reqRoles.some(role => role.toLowerCase().trim() === candPrimary);
  if (primaryMatch) return 1.0;

  // 2. Preferred roles match (0.8)
  const preferredMatch = candPreferred.some(pref =>
    reqRoles.some(req => req.toLowerCase().trim() === pref)
  );
  if (preferredMatch) return 0.8;

  // 3. Adjacent role match (0.2)
  const adjacentRoles = (ROLE_ADJACENCY_MAP[candPrimary] || []).map(r => r.toLowerCase().trim());
  const adjacentMatch = reqRoles.some(req =>
    adjacentRoles.includes(req.toLowerCase().trim())
  );
  if (adjacentMatch) return 0.2;

  // 4. No overlap (0.0)
  return 0.0;
};

// ─── 7. Experience Matching Engine ───────────────────────────────────────────
/**
 * Calculates deterministic Experience Score (15%)
 * Project level derived from aiSummary/complexity or defaults to 'Intermediate'.
 * Exact match or higher -> 1.0
 * One level below       -> 0.7
 * Two levels below      -> 0.3
 */
export const calculateExperienceScore = (candidate: User, project: Project): number => {
  // Determine project complexity based on project field or aiSummary, defaulting to Advanced for hackathons/competitions if specified
  const pType = (project.projectType || '').toLowerCase();
  const projComplexity = (project.aiSummary && project.aiSummary.toLowerCase().includes('advanced'))
    ? 'Advanced'
    : (pType.includes('hackathon') || pType.includes('competition') || pType.includes('startup'))
    ? 'Advanced'
    : 'Intermediate';

  const candRank = experienceRank(candidate.experience);
  const projRank = experienceRank(projComplexity);

  if (candRank >= projRank) {
    return EXPERIENCE_COEFFICIENTS.exactOrBetter; // 1.0
  } else if (projRank - candRank === 1) {
    return EXPERIENCE_COEFFICIENTS.oneLevelBelow; // 0.7
  } else {
    return EXPERIENCE_COEFFICIENTS.twoLevelsBelow; // 0.3
  }
};

// ─── 8. Availability Matching Engine ─────────────────────────────────────────
/**
 * Calculates deterministic Availability Score (15%)
 * candidate.availabilityHoursPerWeek / project.requiredHoursPerWeek
 * candidate >= required => 1.0
 * required = 0 => 1.0 (no divide by zero)
 * Clamped 0.0 to 1.0
 */
export const calculateAvailabilityScore = (candidate: User, project: Project): number => {
  const reqHours = project.requiredHoursPerWeek ?? 0;
  const candHours = candidate.availabilityHoursPerWeek ?? 0;

  if (reqHours <= 0) return 1.0;
  if (candHours >= reqHours) return 1.0;

  return Math.max(0.0, Math.min(1.0, candHours / reqHours));
};

// ─── 9. Interest Matching Engine ─────────────────────────────────────────────
/**
 * Calculates deterministic Interest Score (10%)
 * Jaccard similarity: Intersection / Union
 * T_project = projectType + technologies
 * I_candidate = interests + preferredProjectTypes
 * Case-insensitive, deduplicated sets. Empty union => 0.0.
 */
export const calculateInterestScore = (candidate: User, project: Project): number => {
  const projectSet = new Set<string>();
  if (project.projectType) {
    projectSet.add(project.projectType.toLowerCase().trim());
  }
  (project.technologies || []).forEach(t => {
    if (t) projectSet.add(t.toLowerCase().trim());
  });

  const candidateSet = new Set<string>();
  (candidate.interests || []).forEach(i => {
    if (i) candidateSet.add(i.toLowerCase().trim());
  });
  (candidate.preferredProjectTypes || []).forEach(p => {
    if (p) candidateSet.add(p.toLowerCase().trim());
  });

  if (projectSet.size === 0 || candidateSet.size === 0) return 0.0;

  let intersectionCount = 0;
  projectSet.forEach(tag => {
    if (candidateSet.has(tag)) {
      intersectionCount++;
    }
  });

  const unionSize = projectSet.size + candidateSet.size - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0.0;
};

// ─── 10. Complementarity Engine ──────────────────────────────────────────────
/**
 * Calculates deterministic Complementarity Score (5%)
 * Measures fraction of CURRENT UNMET team requirements added by candidate.
 * Candidate satisfies missing skill if level >= Beginner (i.e. has the skill).
 * Candidate satisfies missing role if role match >= 0.8.
 * If 0 missing requirements exist => S_comp = 1.0. Clamped 0.0 to 1.0.
 */
export const calculateComplementarityScore = (
  candidate: User,
  project: Project,
  currentTeam: User[]
): number => {
  if (currentTeam.length === 0) {
    return 1.0; // Requirement 10: Full contribution / synergy when team is empty
  }

  const reqSkills = project.requiredSkills || [];
  const reqRoles = project.requiredRoles || [];

  // Determine current uncovered skills (team has NO member with skill level >= Intermediate)
  const uncoveredSkills = reqSkills.filter(skill => {
    return !currentTeam.some(member => {
      const s = member.skills.find(sk => sk.name.toLowerCase().trim() === skill.toLowerCase().trim());
      return s && s.level !== 'Beginner';
    });
  });

  // Determine current uncovered roles (team has NO member with primary/preferred role match >= 0.8)
  const uncoveredRoles = reqRoles.filter(role => {
    return !currentTeam.some(member => {
      const candPrimary = (member.primaryRole || '').toLowerCase().trim();
      const candPref = (member.preferredRoles || []).map(r => r.toLowerCase().trim());
      const targetRole = role.toLowerCase().trim();
      return candPrimary === targetRole || candPref.includes(targetRole);
    });
  });

  const totalMissing = uncoveredSkills.length + uncoveredRoles.length;
  if (totalMissing === 0) return 1.0;

  let filledCount = 0;

  // Candidate satisfies missing skill if skill level >= Beginner
  uncoveredSkills.forEach(skill => {
    const candSkill = candidate.skills.find(
      s => s.name.toLowerCase().trim() === skill.toLowerCase().trim()
    );
    if (candSkill) filledCount++;
  });

  // Candidate satisfies missing role if role match >= 0.8
  uncoveredRoles.forEach(role => {
    const candPrimary = (candidate.primaryRole || '').toLowerCase().trim();
    const candPref = (candidate.preferredRoles || []).map(r => r.toLowerCase().trim());
    const targetRole = role.toLowerCase().trim();
    if (candPrimary === targetRole || candPref.includes(targetRole)) {
      filledCount++;
    }
  });

  return Math.min(1.0, filledCount / totalMissing);
};

// ─── 11. Overall Match Result & CandidateMatch Constructor ────────────────────
/**
 * Calculates complete deterministic CandidateMatch result with 6 component scores
 * S_total = 0.35*S_skill + 0.20*S_role + 0.15*S_exp + 0.15*S_avail + 0.10*S_interest + 0.05*S_comp
 */
export const calculateOverallScore = (
  candidate: User,
  project: Project,
  currentTeam: User[] = []
): CandidateMatch => {
  const skillScore = calculateSkillScore(candidate, project);
  const roleScore = calculateRoleScore(candidate, project);
  const experienceScore = calculateExperienceScore(candidate, project);
  const availabilityScore = calculateAvailabilityScore(candidate, project);
  const interestScore = calculateInterestScore(candidate, project);
  const complementarityScore = calculateComplementarityScore(candidate, project, currentTeam);

  const rawTotal =
    skillScore * MATCHING_WEIGHTS.skillMatch +
    roleScore * MATCHING_WEIGHTS.roleMatch +
    experienceScore * MATCHING_WEIGHTS.experienceMatch +
    availabilityScore * MATCHING_WEIGHTS.availabilityMatch +
    interestScore * MATCHING_WEIGHTS.interestMatch +
    complementarityScore * MATCHING_WEIGHTS.complementarity;

  const overallScore = Math.round(rawTotal * 100) / 100;

  // Derive extra deterministic metadata for discovery UI
  const reqSkills = project.requiredSkills || [];
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  reqSkills.forEach(sk => {
    const hasSk = candidate.skills.some(
      s => s.name.toLowerCase().trim() === sk.toLowerCase().trim()
    );
    if (hasSk) matchedSkills.push(sk);
    else missingSkills.push(sk);
  });

  const reqRoles = project.requiredRoles || [];
  const matchedRoles = reqRoles.filter(
    r =>
      r.toLowerCase().trim() === candidate.primaryRole.toLowerCase().trim() ||
      (candidate.preferredRoles || []).some(pr => pr.toLowerCase().trim() === r.toLowerCase().trim())
  );

  const reqHours = project.requiredHoursPerWeek ?? 0;
  const candHours = candidate.availabilityHoursPerWeek ?? 0;
  const availabilityStatus = candHours >= reqHours ? 'Sufficient' : 'Insufficient';

  const strengths: string[] = [];
  if (skillScore >= 0.8) strengths.push('Strong technical skill match');
  if (roleScore >= 0.8) strengths.push('Direct role fit');
  if (experienceScore >= 1.0) strengths.push('Meets required experience level');
  if (availabilityStatus === 'Sufficient') strengths.push('Full weekly availability');
  if (complementarityScore > 0.5) strengths.push('Fills existing team skill/role gaps');

  const teamContribution =
    complementarityScore > 0
      ? `Fills ${Math.round(complementarityScore * 100)}% of current open team gaps.`
      : 'Adds strength to existing team baseline.';

  return {
    candidateId: candidate.userId,
    overallScore,
    skillScore,
    roleScore,
    experienceScore,
    availabilityScore,
    interestScore,
    complementarityScore,
    explanation: `${candidate.name} scored ${Math.round(overallScore * 100)}% overall compatibility based on deterministic weight evaluation.`,
    createdAt: new Date().toISOString(),
    matchedSkills,
    missingSkills,
    matchedRoles,
    availabilityStatus,
    strengths,
    teamContribution
  };
};

/**
 * Custom React Hook to expose matching engine functions
 */
export const useMatchingEngine = () => {
  return {
    calculateOverallScore,
    calculateSkillScore,
    calculateRoleScore,
    calculateExperienceScore,
    calculateAvailabilityScore,
    calculateInterestScore,
    calculateComplementarityScore
  };
};
