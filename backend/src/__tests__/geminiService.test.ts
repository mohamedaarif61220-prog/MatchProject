import { describe, it, expect, vi } from 'vitest';
import {
  runLocalFallbackAnalysis,
  validateAndRepairRequirements,
  buildFallbackExplanation
} from '../services/gemini';

describe('Backend Gemini Service & Fallbacks', () => {

  describe('Local Fallback Analysis', () => {
    it('returns precomputed SmartCampus requirements template when keyword matches', () => {
      const result = runLocalFallbackAnalysis('SmartCampus AI Assistant for campus navigation');
      expect(result.summary).toContain('campus assistant');
      expect(result.requiredSkills.map(s => s.name)).toContain('Gemini API');
      expect(result.recommendedTeamSize).toBe(5);
    });

    it('extracts skills and roles dynamically for generic descriptions', () => {
      const desc = 'We need a React developer and Python developer to build an advanced machine learning hackathon project.';
      const result = runLocalFallbackAnalysis(desc);
      expect(result.projectType).toBe('Hackathon');
      expect(result.complexity).toBe('advanced');
      expect(result.requiredSkills.map(s => s.name)).toContain('React');
      expect(result.requiredSkills.map(s => s.name)).toContain('Python');
    });
  });

  describe('Response Validation & Repair', () => {
    it('validates and repairs incomplete/malformed AI JSON payload', () => {
      const malformed = {
        summary: 'Partial summary',
        recommendedTeamSize: 12, // Should be clamped to max 8
        requiredRoles: ['Frontend Developer'] // Should be repaired to array of objects
      };

      const repaired = validateAndRepairRequirements(malformed, 'Test description');
      expect(repaired.summary).toBe('Partial summary');
      expect(repaired.recommendedTeamSize).toBe(8); // Clamped
      expect(repaired.requiredRoles[0]).toEqual({ name: 'Frontend Developer', priority: 'required' });
      expect(repaired.complexity).toBe('intermediate'); // Repaired default
    });

    it('falls back to local parser if payload is null or completely invalid', () => {
      const repaired = validateAndRepairRequirements(null, 'SmartCampus Assistant');
      expect(repaired.summary).toContain('campus assistant');
    });
  });

  describe('Deterministic Fallback Explanations', () => {
    it('returns seed explanation if candidateId matches demo candidates', () => {
      const explanation = buildFallbackExplanation(
        { candidateId: 'candidate_aarif', name: 'Aarif', primaryRole: 'Full Stack Developer' },
        ['React'],
        ['Full Stack Developer'],
        { overallScore: 0.85 }
      );
      expect(explanation).toContain('React and TypeScript proficiency');
    });

    it('constructs dynamic explanation from candidate facts if not in seed pool', () => {
      const explanation = buildFallbackExplanation(
        { candidateId: 'cand_unknown', name: 'Zoe', primaryRole: 'Mobile Developer', skills: [{ name: 'Flutter' }] },
        ['Flutter'],
        ['Mobile Developer'],
        { overallScore: 0.90 }
      );
      expect(explanation).toContain('Mobile Developer candidate');
      expect(explanation).toContain('Flutter');
      expect(explanation).toContain('90% compatibility');
    });
  });

});
