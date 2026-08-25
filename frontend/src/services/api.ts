import type { ProjectRequirements, User } from '../types';
import { PRECOMPUTED_EXPLANATIONS } from '../config/seedCandidates';

const API_BASE = '/api';

// In-memory cache for explainMatch calls (Rule #15 Cost Efficiency)
const explanationCache = new Map<string, string>();

// --- Local Fallback Parser for Client (when backend or Gemini is offline) ---

const LOCAL_DICTIONARY = {
  skills: [
    "react", "typescript", "firebase", "python", "node", "javascript", "html", 
    "css", "postgresql", "go", "docker", "flutter", "swift", "c++", "pytorch", 
    "tensorflow", "figma", "tailwind", "next.js", "vite", "sql", "aws", "gemini api"
  ],
  roles: [
    "frontend developer", "backend developer", "full stack developer", 
    "ai/ml developer", "ui/ux designer", "product manager", "domain expert",
    "data engineer", "mobile developer", "cybersecurity student", "researcher", "developer"
  ]
};

const runLocalFallbackAnalysis = (description: string): ProjectRequirements => {
  const descLower = (description || '').toLowerCase();

  if (descLower.includes("smartcampus") || descLower.includes("campus assistant")) {
    return {
      summary: "Build an AI-powered campus assistant that helps students find classrooms, events, academic resources, campus services and personalized recommendations.",
      projectType: "Hackathon",
      complexity: "intermediate",
      requiredRoles: [
        { name: "Full Stack Developer", priority: "required" },
        { name: "AI/ML Developer", priority: "required" },
        { name: "UI/UX Designer", priority: "required" },
        { name: "Backend Developer", priority: "required" },
        { name: "Product Manager", priority: "preferred" }
      ],
      requiredSkills: [
        { name: "React", priority: "required" },
        { name: "TypeScript", priority: "required" },
        { name: "Firebase", priority: "required" },
        { name: "Python", priority: "required" },
        { name: "Gemini API", priority: "required" }
      ],
      recommendedTeamSize: 5,
      reasoning: "Extracted via client SmartCampus backup templates."
    };
  }

  const detectedSkills: string[] = [];
  LOCAL_DICTIONARY.skills.forEach(skill => {
    if (descLower.includes(skill)) {
      const formatted = skill === 'gemini api' ? 'Gemini API' : skill === 'next.js' ? 'Next.js' : skill === 'vite' ? 'Vite' : skill.charAt(0).toUpperCase() + skill.slice(1);
      detectedSkills.push(formatted);
    }
  });

  const detectedRoles: string[] = [];
  LOCAL_DICTIONARY.roles.forEach(role => {
    if (descLower.includes(role)) {
      const formatted = role.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      detectedRoles.push(formatted);
    }
  });

  if (detectedSkills.length === 0) detectedSkills.push("React", "TypeScript", "Firebase");
  if (detectedRoles.length === 0) detectedRoles.push("Full Stack Developer", "UI/UX Designer");

  return {
    summary: `Build a project based on: "${description.substring(0, 60)}..."`,
    projectType: descLower.includes("hackathon") ? "Hackathon" : descLower.includes("startup") ? "Startup" : "College Project",
    complexity: descLower.includes("advanced") ? "advanced" : descLower.includes("simple") ? "beginner" : "intermediate",
    requiredRoles: detectedRoles.map(r => ({ name: r, priority: "required" })),
    requiredSkills: detectedSkills.map(s => ({ name: s, priority: "required" })),
    recommendedTeamSize: Math.max(3, Math.min(6, detectedRoles.length + 1)),
    reasoning: "Extracted locally via case-insensitive pattern matching dictionary lookup (Fallback)."
  };
};

export const apiService = {
  async analyzeProject(description: string): Promise<ProjectRequirements> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Backend API responded with error status.");
      return await res.json();
    } catch (e) {
      console.warn("Express backend analysis failed or timed out, using local intelligence fallback:", e);
      return runLocalFallbackAnalysis(description);
    }
  },

  async explainMatch(
    requiredSkills: string[],
    requiredRoles: string[],
    candidate: User,
    deterministicScores: any
  ): Promise<string> {
    const cacheKey = `${candidate.userId}_${requiredSkills.join(',')}_${deterministicScores?.overallScore ?? 0}`;
    if (explanationCache.has(cacheKey)) {
      return explanationCache.get(cacheKey)!;
    }

    // Strip sensitive fields (Privacy Rule #14)
    const strippedCandidate = {
      candidateId: candidate.userId,
      name: candidate.name,
      primaryRole: candidate.primaryRole,
      skills: candidate.skills,
      experience: candidate.experience,
      availabilityHoursPerWeek: candidate.availabilityHoursPerWeek,
      interests: candidate.interests,
      preferredProjectTypes: candidate.preferredProjectTypes
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE}/explain-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiredSkills,
          requiredRoles,
          candidate: strippedCandidate,
          deterministicScores
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Backend explain-match responded with error status.");
      const data = await res.json();
      
      const explanation = data.explanation || PRECOMPUTED_EXPLANATIONS[candidate.userId];
      explanationCache.set(cacheKey, explanation);
      return explanation;
    } catch (e) {
      console.warn("Express backend explain-match failed, using local explanation fallback:", e);
      const fallback = PRECOMPUTED_EXPLANATIONS[candidate.userId] || 
        `${candidate.name} matches as a ${candidate.primaryRole} with relevant technical skills in ${candidate.skills.slice(0, 2).map(s => s.name).join(', ')}.`;
      explanationCache.set(cacheKey, fallback);
      return fallback;
    }
  },

  async improveTeam(
    requiredSkills: string[],
    requiredRoles: string[],
    currentTeam: User[],
    candidatesPool: User[]
  ): Promise<{ recommendedCandidateId: string; suggestedRole: string; reasoning: string }> {
    // Privacy payload minimization
    const strippedCurrentTeam = currentTeam.map(m => ({
      candidateId: m.userId,
      name: m.name,
      role: m.primaryRole,
      skills: m.skills
    }));

    const strippedPool = candidatesPool.map(c => ({
      candidateId: c.userId,
      name: c.name,
      primaryRole: c.primaryRole,
      skills: c.skills,
      experience: c.experience,
      availabilityHoursPerWeek: c.availabilityHoursPerWeek,
      interests: c.interests,
      preferredProjectTypes: c.preferredProjectTypes
    }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE}/improve-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: { requiredSkills, requiredRoles },
          currentTeam: strippedCurrentTeam,
          candidatesPool: strippedPool
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Backend improve-team responded with error status.");
      
      const result = await res.json();
      const candidateExists = candidatesPool.some(c => c.userId === result.recommendedCandidateId);
      if (!candidateExists) {
        throw new Error("AI returned invalid candidateId.");
      }
      return result;
    } catch (e) {
      console.warn("Express backend improve-team failed, compiling fallback suggestion locally:", e);
      
      const uncoveredSkills = requiredSkills.filter(skill => {
        return !currentTeam.some(m => m.skills.some(s => s.name.toLowerCase() === skill.toLowerCase() && s.level !== 'Beginner'));
      });
      const uncoveredRoles = requiredRoles.filter(role => {
        return !currentTeam.some(m => m.primaryRole.toLowerCase() === role.toLowerCase());
      });

      if (candidatesPool.length > 0) {
        for (const cand of candidatesPool) {
          const hasSkill = cand.skills.some(s => uncoveredSkills.includes(s.name) && s.level !== 'Beginner');
          const hasRole = uncoveredRoles.includes(cand.primaryRole);
          if (hasSkill || hasRole) {
            return {
              recommendedCandidateId: cand.userId,
              suggestedRole: cand.primaryRole,
              reasoning: `Adding ${cand.name} satisfies your team's missing gap for ${hasRole ? cand.primaryRole : uncoveredSkills[0]} and improves overall compatibility.`
            };
          }
        }
        
        const first = candidatesPool[0];
        return {
          recommendedCandidateId: first.userId,
          suggestedRole: first.primaryRole,
          reasoning: `Adding ${first.name} adds strong core development capability and increases synergy.`
        };
      }

      return {
        recommendedCandidateId: "",
        suggestedRole: "",
        reasoning: "No available candidates to recommend."
      };
    }
  }
};
