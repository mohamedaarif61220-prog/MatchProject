import { describe, it, expect } from 'vitest';
import {
  calculateSkillScore,
  calculateRoleScore,
  calculateExperienceScore,
  calculateAvailabilityScore,
  calculateInterestScore,
  calculateComplementarityScore,
  calculateOverallScore
} from '../hooks/useMatchingEngine';
import {
  calculateTeamMetrics,
  previewTeamImpact
} from '../hooks/useTeamMetrics';
import type { User, Project } from '../types';

const mockProject: Project = {
  projectId: 'test_project',
  ownerId: 'owner_1',
  name: 'Test Project',
  description: 'Test Description',
  projectType: 'Hackathon',
  teamSize: 4,
  deadline: '2026-12-31',
  requiredHoursPerWeek: 10,
  technologies: ['React', 'TypeScript', 'Python'],
  requiredRoles: ['Frontend Developer', 'AI/ML Developer'],
  requiredSkills: ['React', 'TypeScript', 'Python'],
  niceToHaveSkills: ['Tailwind CSS'],
  status: 'active',
  createdAt: '2026-01-01'
};

const candidateAdvanced: User = {
  userId: 'cand_1',
  name: 'Alice',
  avatarUrl: '',
  bio: '',
  primaryRole: 'Frontend Developer',
  skills: [
    { name: 'React', level: 'Advanced' },
    { name: 'TypeScript', level: 'Proficient' },
    { name: 'Python', level: 'Intermediate' },
    { name: 'Tailwind CSS', level: 'Advanced' }
  ],
  experience: 'Advanced',
  interests: ['React', 'Hackathon'],
  preferredProjectTypes: ['Hackathon'],
  availabilityHoursPerWeek: 15,
  preferredRoles: ['Frontend Developer'],
  portfolioLinks: [],
  createdAt: '2026-01-01'
};

const candidateBeginner: User = {
  userId: 'cand_2',
  name: 'Bob',
  avatarUrl: '',
  bio: '',
  primaryRole: 'Data Scientist',
  skills: [
    { name: 'React', level: 'Beginner' }
  ],
  experience: 'Beginner',
  interests: ['Gaming'],
  preferredProjectTypes: ['Startup'],
  availabilityHoursPerWeek: 5,
  preferredRoles: ['AI/ML Developer'],
  portfolioLinks: [],
  createdAt: '2026-01-01'
};

describe('Deterministic Matching Engine Unit Tests', () => {

  describe('Skill Score Calculation', () => {
    it('calculates skill score with proficiency coefficients and nice-to-have bonus', () => {
      // React: Advanced (1.0), TypeScript: Proficient (0.9), Python: Intermediate (0.7)
      // Sum = 2.6 / 3 = 0.8667
      // Tailwind CSS nice-to-have bonus: +0.05 => 0.9167
      const score = calculateSkillScore(candidateAdvanced, mockProject);
      expect(score).toBeCloseTo(0.9167, 3);
    });

    it('handles beginner level and missing skills', () => {
      // React: Beginner (0.4), missing TS (0.0), missing Python (0.0)
      // Sum = 0.4 / 3 = 0.1333
      const score = calculateSkillScore(candidateBeginner, mockProject);
      expect(score).toBeCloseTo(0.1333, 3);
    });

    it('caps skill score at 1.0', () => {
      const perfectCandidate: User = {
        ...candidateAdvanced,
        skills: [
          { name: 'React', level: 'Advanced' },
          { name: 'TypeScript', level: 'Advanced' },
          { name: 'Python', level: 'Advanced' },
          { name: 'Tailwind CSS', level: 'Advanced' }
        ]
      };
      const score = calculateSkillScore(perfectCandidate, mockProject);
      expect(score).toBe(1.0);
    });

    it('returns 1.0 when zero required skills are specified', () => {
      const noReqProject = { ...mockProject, requiredSkills: [] };
      const score = calculateSkillScore(candidateAdvanced, noReqProject);
      expect(score).toBe(1.0);
    });

    it('treats skill matching case-insensitively', () => {
      const caseCandidate: User = {
        ...candidateAdvanced,
        skills: [
          { name: 'react', level: 'Advanced' },
          { name: 'TYPESCRIPT', level: 'Advanced' },
          { name: 'PyThOn', level: 'Advanced' }
        ]
      };
      const score = calculateSkillScore(caseCandidate, mockProject);
      expect(score).toBe(1.0);
    });
  });

  describe('Role Score Calculation', () => {
    it('returns 1.0 for exact primary role match', () => {
      const score = calculateRoleScore(candidateAdvanced, mockProject);
      expect(score).toBe(1.0);
    });

    it('returns 0.8 when candidate preferredRoles contains matching role', () => {
      const score = calculateRoleScore(candidateBeginner, mockProject);
      expect(score).toBe(0.8);
    });

    it('returns 0.2 for adjacent primary role', () => {
      const adjacentCandidate: User = {
        ...candidateAdvanced,
        primaryRole: 'Full Stack Developer',
        preferredRoles: []
      };
      const score = calculateRoleScore(adjacentCandidate, mockProject);
      expect(score).toBe(0.2);
    });

    it('returns 0.0 when there is no role match or adjacency', () => {
      const noMatchCandidate: User = {
        ...candidateAdvanced,
        primaryRole: 'Cybersecurity Student',
        preferredRoles: ['Network Tester']
      };
      const score = calculateRoleScore(noMatchCandidate, mockProject);
      expect(score).toBe(0.0);
    });
  });

  describe('Experience Score Calculation', () => {
    it('returns 1.0 for exact or higher experience level', () => {
      const score = calculateExperienceScore(candidateAdvanced, mockProject);
      expect(score).toBe(1.0);
    });

    it('returns 0.3 for two levels below required project complexity', () => {
      const score = calculateExperienceScore(candidateBeginner, mockProject);
      expect(score).toBe(0.3);
    });
  });

  describe('Availability Score Calculation', () => {
    it('returns 1.0 when candidate availability >= required hours', () => {
      const score = calculateAvailabilityScore(candidateAdvanced, mockProject);
      expect(score).toBe(1.0);
    });

    it('returns fractional ratio when candidate availability < required hours', () => {
      // 5 / 10 = 0.5
      const score = calculateAvailabilityScore(candidateBeginner, mockProject);
      expect(score).toBe(0.5);
    });

    it('handles zero project required hours safely without division by zero', () => {
      const zeroReqProject = { ...mockProject, requiredHoursPerWeek: 0 };
      const score = calculateAvailabilityScore(candidateBeginner, zeroReqProject);
      expect(score).toBe(1.0);
    });
  });

  describe('Interest Score Calculation', () => {
    it('calculates Jaccard similarity for project vs candidate tags', () => {
      // projectTags: react, typescript, python, hackathon (4)
      // candidateTags: react, hackathon (2)
      // intersection: react, hackathon (2)
      // union: 4 + 2 - 2 = 4
      // score = 2 / 4 = 0.5
      const score = calculateInterestScore(candidateAdvanced, mockProject);
      expect(score).toBe(0.5);
    });

    it('handles case-insensitive deduplication and empty overlap', () => {
      const score = calculateInterestScore(candidateBeginner, mockProject);
      expect(score).toBe(0.0);
    });
  });

  describe('Complementarity Calculation', () => {
    it('returns 1.0 when candidate satisfies all missing team gaps', () => {
      const emptyTeamScore = calculateComplementarityScore(candidateAdvanced, mockProject, []);
      expect(emptyTeamScore).toBe(1.0);
    });

    it('calculates percentage of missing team gaps filled by candidate', () => {
      // Team has candidateAdvanced (Frontend Dev, covers React, TS, Python)
      // Missing role: AI/ML Developer
      // candidateBeginner has preferredRoles: AI/ML Developer -> fills missing role!
      const score = calculateComplementarityScore(candidateBeginner, mockProject, [candidateAdvanced]);
      expect(score).toBe(1.0); // Fills 1 out of 1 missing requirements
    });
  });

  describe('Overall Weighted Score Calculation', () => {
    it('combines all 6 factors with exact configured weights (35%, 20%, 15%, 15%, 10%, 5%)', () => {
      const result = calculateOverallScore(candidateAdvanced, mockProject, []);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(1.0);
      expect(result.matchedSkills).toContain('React');
      expect(result.availabilityStatus).toBe('Sufficient');
    });
  });

  describe('Team Metrics & What-If Simulation', () => {
    it('calculates correct team metrics for team of members', () => {
      const metrics = calculateTeamMetrics([candidateAdvanced], mockProject);
      expect(metrics.roleCoverageFraction).toBe(0.5); // Frontend Dev covered, AI/ML Dev missing
      expect(metrics.skillCoverageFraction).toBe(1.0); // React, TS, Python covered at level >= Intermediate
      expect(metrics.teamCompatibility).toBeGreaterThan(0);
    });

    it('previews What-if team simulation without mutating original state', () => {
      const currentTeam = [candidateAdvanced];
      const preview = previewTeamImpact(candidateBeginner, 'add', currentTeam, mockProject);

      expect(currentTeam.length).toBe(1); // Unmutated
      expect(preview.predictedRoleCoverage).toBe(1.0); // AI/ML Developer filled by Bob
      expect(preview.resolvedGaps).toContain('Missing AI/ML Developer role');
    });
  });

});
