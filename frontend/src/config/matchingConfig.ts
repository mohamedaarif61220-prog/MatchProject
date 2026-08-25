export const MATCHING_WEIGHTS = {
  skillMatch: 0.35,
  roleMatch: 0.20,
  experienceMatch: 0.15,
  availabilityMatch: 0.15,
  interestMatch: 0.10,
  complementarity: 0.05
};

export const PROFICIENCY_COEFFICIENTS = {
  Advanced: 1.0,
  Proficient: 0.9,
  Intermediate: 0.7,
  Beginner: 0.4
};

export const EXPERIENCE_COEFFICIENTS = {
  exactOrBetter: 1.0,
  oneLevelBelow: 0.7,
  twoLevelsBelow: 0.3
};

/**
 * Deterministic role-adjacency map for role matching.
 * Used when a candidate's primaryRole is not an exact match but is closely adjacent.
 * If candidate primaryRole <-> required role matches an adjacent pair, roleScore = 0.2
 */
export const ROLE_ADJACENCY_MAP: Record<string, string[]> = {
  'frontend developer': ['full stack developer', 'ui/ux designer', 'mobile developer'],
  'backend developer': ['full stack developer', 'data engineer', 'ai/ml developer', 'go developer'],
  'full stack developer': ['frontend developer', 'backend developer', 'mobile developer'],
  'ai/ml developer': ['data scientist', 'backend developer', 'data engineer'],
  'data scientist': ['ai/ml developer', 'data engineer'],
  'ui/ux designer': ['product designer', 'frontend developer'],
  'product designer': ['ui/ux designer', 'product manager'],
  'product manager': ['product designer', 'domain expert'],
  'mobile developer': ['frontend developer', 'full stack developer']
};
