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
  },

  async auditProjectFeasibility(
    project: any,
    currentTeam: User[]
  ): Promise<{ riskScore: number; riskLevel: 'Low' | 'Medium' | 'High'; feasibilitySummary: string; recommendations: string[] }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, currentTeam }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Backend audit API failed.");
      return await res.json();
    } catch (e) {
      console.warn("Backend feasibility audit failed, fallback to local analysis:", e);

      const teamCount = currentTeam.length;
      const targetSize = project.teamSize || 4;
      const coverageRatio = teamCount / targetSize;

      let riskScore = 20;
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      const recommendations: string[] = [];

      if (teamCount === 1) {
        riskScore = 70;
        riskLevel = 'High';
        recommendations.push("Solo team: Recruit at least 1 Frontend and 1 Backend/AI developer before hackathon deadline.");
        recommendations.push("Scope down complex backend microservices and leverage serverless / Firebase APIs.");
      } else if (coverageRatio < 0.8) {
        riskScore = 40;
        riskLevel = 'Medium';
        recommendations.push(`Team currently has ${teamCount}/${targetSize} members. Invite remaining key candidate roles.`);
        recommendations.push("Establish API schema contracts early to prevent frontend/backend integration delays.");
      } else {
        riskScore = 15;
        riskLevel = 'Low';
        recommendations.push("Team role distribution is well balanced across primary skill sets.");
        recommendations.push("Schedule a dry-run presentation 3 hours prior to submission.");
      }

      recommendations.push("Keep MVP feature scope constrained to core user journey to ensure demo stability.");

      return {
        riskScore,
        riskLevel,
        feasibilitySummary: `Feasibility Audit for ${project.name}: Current team of ${teamCount} member(s) evaluating a ${project.complexity || 'intermediate'} scope. ${riskLevel} implementation risk.`,
        recommendations
      };
    }
  },

  async chatProjectAssistant(
    messages: Array<{ sender: 'user' | 'assistant'; text: string }>,
    projectName?: string,
    currentDescription?: string
  ): Promise<{ reply: string; suggestedDescription?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE}/chat-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, projectName, currentDescription }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Backend chat assistant API failed.");
      return await res.json();
    } catch (e) {
      console.warn("Backend chat assistant failed, fallback to local intelligent response:", e);

      const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || '';
      const lower = lastUserMsg.toLowerCase();

      let reply = `That's a great question! For a project like ${projectName || 'this'}, focus on breaking down your core features into MVP stages, choosing a reliable tech stack, and defining key team roles early.`;
      let suggestedDescription: string | undefined = undefined;

      if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        reply = `Hello! How can I assist you with your project today? You can ask me for tech stack advice, feature ideas, team role recommendations, or help drafting your description.`;
      } else if (lower.includes('role') || lower.includes('team') || lower.includes('who should i recruit')) {
        reply = `For a typical software or hackathon project, a balanced team includes: 1 Full Stack Developer, 1 UI/UX Designer, 1 Backend/AI Specialist, and 1 Product Lead.`;
      } else if (lower.includes('database') || lower.includes('backend') || lower.includes('firebase') || lower.includes('sql')) {
        reply = `For fast prototyping and hackathons, Firebase or Supabase is ideal due to built-in auth and real-time database capabilities. For complex queries, PostgreSQL with Node.js/Express is a great choice!`;
      } else if (lower.includes('smartcampus') || lower.includes('campus') || lower.includes('student')) {
        suggestedDescription = `Build an AI-powered smart campus portal and mobile assistant for students to find live lecture halls, campus events, academic notices, and personalized study group recommendations using React, Node.js, Python, and Gemini AI APIs.`;
        reply = `I've prepared a comprehensive SmartCampus description for you! Click "Apply to Description" to insert it into your project form.`;
      } else if (lower.includes('tech') || lower.includes('stack') || lower.includes('react') || lower.includes('python')) {
        suggestedDescription = `${currentDescription || ''} Powered by a robust modern tech stack including React, TypeScript, Node.js, and AI integrations for seamless user experience.`;
        reply = `Added technical stack details to your description! Click "Apply to Description" to update your form.`;
      } else if (lastUserMsg.length > 8) {
        suggestedDescription = `${currentDescription ? currentDescription + '\n\n' : ''}${lastUserMsg.trim()}`;
        reply = `Got it! I've updated your proposed project description below based on your input.`;
      }

      return { reply, suggestedDescription };
    }
  }
};
