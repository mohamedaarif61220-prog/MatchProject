import { GoogleGenerativeAI } from '@google/generative-ai';
import { ANALYZE_PROJECT_PROMPT, EXPLAIN_MATCH_PROMPT, IMPROVE_TEAM_PROMPT } from '../config/prompts';
import { ProjectRequirements } from '../types';

// ─── Local Fallback Dictionary ────────────────────────────────────────────────
const LOCAL_DICTIONARY = {
  skills: [
    "react", "typescript", "firebase", "python", "node", "javascript",
    "html", "css", "postgresql", "go", "docker", "flutter", "swift",
    "c++", "pytorch", "tensorflow", "figma", "tailwind", "next.js",
    "vite", "sql", "aws", "gemini api", "node.js"
  ],
  roles: [
    "frontend developer", "backend developer", "full stack developer",
    "ai/ml developer", "ui/ux designer", "product manager", "domain expert",
    "data engineer", "mobile developer", "cybersecurity student",
    "researcher", "developer"
  ]
};

// ─── Precomputed Deterministic Explanations (Local Fallback) ────────────────────
const PRECOMPUTED_EXPLANATIONS: Record<string, string> = {
  candidate_aarif:    "Strong React and TypeScript proficiency covers key technical requirements, while availability matches project needs.",
  candidate_liam:     "Advanced Python and Gemini API background directly satisfies AI service development requirements.",
  candidate_sophia:   "Figma and wireframing experience covers design system requirements, while Tailwind knowledge complements frontend efforts.",
  candidate_ethan:    "Strong SQL and data engineering background supports database architecture and query optimization.",
  candidate_mia:      "Flutter experience provides cross-platform mobile development capacity, backed by solid Firebase skills.",
  candidate_noah:     "Security audit background provides OWASP and authentication safety for student user data.",
  candidate_olivia:   "Academic research and user interview skills facilitate requirements gathering and user testing.",
  candidate_isabella: "Agile project management experience provides roadmap organization and team sprint coordination.",
  candidate_mason:    "Go and microservices expertise strengthens backend API delivery and cloud deployment.",
  candidate_lucas:    "C++ and embedded systems skills provide hardware integration capability."
};

// ─── SDK Initialisation ───────────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY ?? '';
const isRealApiKey = !!apiKey && apiKey !== 'mock_key_for_local_demo';

let genAI: GoogleGenerativeAI | null = null;
if (isRealApiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI Client initialised successfully on backend.');
  } catch (e) {
    console.error('Failed to initialise GoogleGenerativeAI client:', e);
  }
} else {
  console.log('No real Gemini API key detected on backend. Running in local fallback mode.');
}

// ─── Local Fallback Parser & Normalizer ───────────────────────────────────────
export const runLocalFallbackAnalysis = (description: string): ProjectRequirements => {
  const descLower = (description || '').toLowerCase();

  // SmartCampus preset
  if (descLower.includes('smartcampus') || descLower.includes('campus assistant')) {
    return {
      summary: 'Build an AI-powered campus assistant that helps students find classrooms, events, academic resources, campus services and personalized recommendations.',
      projectType: 'Hackathon',
      complexity: 'intermediate',
      requiredRoles: [
        { name: 'Full Stack Developer', priority: 'required' },
        { name: 'AI/ML Developer',      priority: 'required' },
        { name: 'UI/UX Designer',        priority: 'required' },
        { name: 'Backend Developer',     priority: 'required' },
        { name: 'Product Manager',       priority: 'preferred' }
      ],
      requiredSkills: [
        { name: 'React',       priority: 'required' },
        { name: 'TypeScript',  priority: 'required' },
        { name: 'Firebase',    priority: 'required' },
        { name: 'Python',      priority: 'required' },
        { name: 'Gemini API',  priority: 'required' }
      ],
      recommendedTeamSize: 5,
      reasoning: 'Extracted via SmartCampus local seed template.'
    };
  }

  const capitalise = (s: string) =>
    s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const detectedSkills = LOCAL_DICTIONARY.skills
    .filter(sk => descLower.includes(sk))
    .map(sk => {
      if (sk === 'gemini api') return 'Gemini API';
      if (sk === 'next.js')    return 'Next.js';
      if (sk === 'node.js')    return 'Node.js';
      return capitalise(sk);
    });

  const detectedRoles = LOCAL_DICTIONARY.roles
    .filter(r => descLower.includes(r))
    .map(capitalise);

  if (detectedSkills.length === 0) detectedSkills.push('React', 'TypeScript', 'Firebase');
  if (detectedRoles.length === 0)  detectedRoles.push('Full Stack Developer', 'UI/UX Designer');

  return {
    summary: `Project based on: "${description.substring(0, 80)}..."`,
    projectType: descLower.includes('hackathon') ? 'Hackathon'
      : descLower.includes('startup') ? 'Startup'
      : 'College Project',
    complexity: descLower.includes('advanced') ? 'advanced'
      : descLower.includes('simple') ? 'beginner'
      : 'intermediate',
    requiredRoles:  detectedRoles.map(r  => ({ name: r,  priority: 'required' as const })),
    requiredSkills: detectedSkills.map(s => ({ name: s,  priority: 'required' as const })),
    recommendedTeamSize: Math.max(3, Math.min(6, detectedRoles.length + 1)),
    reasoning: 'Extracted locally via case-insensitive dictionary fallback.'
  };
};

/**
 * Validates and repairs malformed AI responses for ProjectRequirements
 */
export const validateAndRepairRequirements = (
  data: any,
  fallbackDesc: string
): ProjectRequirements => {
  if (!data || typeof data !== 'object') {
    return runLocalFallbackAnalysis(fallbackDesc);
  }

  const summary = typeof data.summary === 'string' && data.summary.trim().length > 0
    ? data.summary.trim()
    : `Project based on: ${fallbackDesc.substring(0, 80)}...`;

  const projectType = typeof data.projectType === 'string' && data.projectType.trim().length > 0
    ? data.projectType.trim()
    : 'College Project';

  const complexity = ['beginner', 'intermediate', 'advanced'].includes((data.complexity || '').toLowerCase())
    ? (data.complexity.toLowerCase() as 'beginner' | 'intermediate' | 'advanced')
    : 'intermediate';

  const recommendedTeamSize = typeof data.recommendedTeamSize === 'number' && data.recommendedTeamSize >= 2
    ? Math.min(8, Math.max(2, Math.round(data.recommendedTeamSize)))
    : 4;

  const requiredRoles = Array.isArray(data.requiredRoles)
    ? data.requiredRoles.map((r: any) => ({
        name: typeof r === 'string' ? r : (r?.name || r?.role || 'Developer'),
        priority: (r?.priority === 'preferred' ? 'preferred' : 'required') as 'required' | 'preferred'
      }))
    : [{ name: 'Full Stack Developer', priority: 'required' as const }];

  const requiredSkills = Array.isArray(data.requiredSkills)
    ? data.requiredSkills.map((s: any) => ({
        name: typeof s === 'string' ? s : (s?.name || s?.skill || 'TypeScript'),
        priority: (s?.priority === 'preferred' ? 'preferred' : 'required') as 'required' | 'preferred'
      }))
    : [{ name: 'React', priority: 'required' as const }];

  const reasoning = typeof data.reasoning === 'string' && data.reasoning.trim().length > 0
    ? data.reasoning.trim()
    : 'Structured requirements extracted via project analysis.';

  return {
    summary,
    projectType,
    complexity,
    requiredRoles,
    requiredSkills,
    recommendedTeamSize,
    reasoning
  };
};

/**
 * Builds a deterministic fallback explanation when Gemini is offline/failing
 */
export const buildFallbackExplanation = (
  candidate: Record<string, any>,
  requiredSkills: string[],
  requiredRoles: string[],
  deterministicScores: Record<string, number>
): string => {
  const candidateId = candidate?.candidateId || candidate?.userId || '';
  if (PRECOMPUTED_EXPLANATIONS[candidateId]) {
    return PRECOMPUTED_EXPLANATIONS[candidateId];
  }

  const role = candidate?.primaryRole || 'Candidate';
  const overall = Math.round((deterministicScores?.overallScore ?? 0) * 100);
  const skills = Array.isArray(candidate?.skills)
    ? candidate.skills.slice(0, 2).map((s: any) => s.name).join(', ')
    : 'relevant skills';

  return `${role} candidate with ${skills} matching overall project requirements (${overall}% compatibility).`;
};

// ─── Gemini Service Object ───────────────────────────────────────────────────
export const geminiService = {

  async analyzeProjectDescription(description: string): Promise<ProjectRequirements> {
    if (!description || !description.trim()) {
      throw new Error('Project description is required.');
    }

    if (!isRealApiKey || !genAI) {
      return runLocalFallbackAnalysis(description);
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `${ANALYZE_PROJECT_PROMPT}\n\nProject Description:\n"${description}"`;
      
      const result = await model.generateContent(prompt);
      const rawText = result.response.text();
      const cleanJsonText = rawText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJsonText);
      
      return validateAndRepairRequirements(parsed, description);
    } catch (error) {
      console.error('Gemini analyzeProjectDescription failed or timed out, using fallback:', error);
      return runLocalFallbackAnalysis(description);
    }
  },

  async explainCandidateMatch(
    requiredSkills: string[],
    requiredRoles: string[],
    candidate: Record<string, any>,
    deterministicScores: Record<string, number>
  ): Promise<string> {
    const fallback = buildFallbackExplanation(candidate, requiredSkills, requiredRoles, deterministicScores);

    if (!isRealApiKey || !genAI) {
      return fallback;
    }

    try {
      // Strip candidate payload to minimal required fields only (Privacy Rule #14)
      const sanitizedCandidate = {
        candidateId: candidate.candidateId || candidate.userId,
        name: candidate.name,
        primaryRole: candidate.primaryRole,
        skills: candidate.skills,
        experience: candidate.experience,
        availabilityHoursPerWeek: candidate.availabilityHoursPerWeek,
        interests: candidate.interests,
        preferredProjectTypes: candidate.preferredProjectTypes
      };

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
${EXPLAIN_MATCH_PROMPT}

Project Required Skills: ${requiredSkills.join(', ')}
Project Required Roles: ${requiredRoles.join(', ')}

Candidate Payload:
${JSON.stringify(sanitizedCandidate, null, 2)}

Pre-Calculated Deterministic Scores (0-1 scale):
${JSON.stringify(deterministicScores, null, 2)}
`.trim();

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      return text.length > 0 ? text : fallback;
    } catch (e) {
      console.error('Gemini explainCandidateMatch failed, using fallback:', e);
      return fallback;
    }
  },

  async recommendTeamImprovement(
    requiredSkills: string[],
    requiredRoles: string[],
    currentTeam: Array<Record<string, any>>,
    candidatesPool: Array<Record<string, any>>
  ): Promise<{ recommendedCandidateId: string; suggestedRole: string; reasoning: string }> {

    // Filter uncovered skills/roles deterministically
    const uncoveredSkills = requiredSkills.filter(skill =>
      !currentTeam.some(m =>
        Array.isArray(m.skills) &&
        m.skills.some((s: any) => s.name.toLowerCase() === skill.toLowerCase() && s.level !== 'Beginner')
      )
    );
    const uncoveredRoles = requiredRoles.filter(role =>
      !currentTeam.some(m => ((m.primaryRole || m.role) as string || '').toLowerCase() === role.toLowerCase())
    );

    const buildLocalRecommendation = () => {
      for (const cand of candidatesPool) {
        const candId = cand.candidateId || cand.userId;
        const skills = Array.isArray(cand.skills) ? cand.skills : [];
        const hasSkill = skills.some((s: any) => uncoveredSkills.includes(s.name) && s.level !== 'Beginner');
        const hasRole = uncoveredRoles.includes(cand.primaryRole as string);

        if (hasSkill || hasRole) {
          return {
            recommendedCandidateId: candId,
            suggestedRole: cand.primaryRole || 'Team Member',
            reasoning: `Adding ${cand.name} fills the open gap for ${hasRole ? cand.primaryRole : uncoveredSkills[0]} and improves overall team synergy.`
          };
        }
      }

      const first = candidatesPool[0];
      const firstId = first ? (first.candidateId || first.userId) : '';
      return first
        ? { recommendedCandidateId: firstId, suggestedRole: first.primaryRole || 'Developer', reasoning: `Adding ${first.name} strengthens core team skills.` }
        : { recommendedCandidateId: '', suggestedRole: '', reasoning: 'No candidates available in pool.' };
    };

    if (!isRealApiKey || !genAI) {
      return buildLocalRecommendation();
    }

    try {
      // Privacy payload minimization
      const sanitizedTeam = currentTeam.map(m => ({
        userId: m.userId || m.candidateId,
        name: m.name,
        primaryRole: m.primaryRole || m.role,
        skills: m.skills
      }));

      const sanitizedPool = candidatesPool.map(c => ({
        candidateId: c.candidateId || c.userId,
        name: c.name,
        primaryRole: c.primaryRole,
        skills: c.skills,
        availabilityHoursPerWeek: c.availabilityHoursPerWeek
      }));

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
${IMPROVE_TEAM_PROMPT}

Project Required Skills: ${requiredSkills.join(', ')}
Project Required Roles: ${requiredRoles.join(', ')}

Current Team:
${JSON.stringify(sanitizedTeam, null, 2)}

Candidates Pool:
${JSON.stringify(sanitizedPool, null, 2)}
`.trim();

      const result = await model.generateContent(prompt);
      const cleanText = result.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanText);

      const recId = parsed.recommendedCandidateId || '';
      const candidateExists = candidatesPool.some(c => (c.candidateId || c.userId) === recId);

      if (!candidateExists) {
        console.warn(`Gemini recommended candidateId "${recId}" not found in candidate pool. Using fallback candidate.`);
        return buildLocalRecommendation();
      }

      return {
        recommendedCandidateId: recId,
        suggestedRole: parsed.suggestedRole || 'Team Member',
        reasoning: parsed.reasoning || 'Recommended candidate addresses active team skill gaps.'
      };
    } catch (e) {
      console.error('Gemini recommendTeamImprovement failed, using fallback:', e);
      return buildLocalRecommendation();
    }
  },

  async auditProjectFeasibility(
    project: any,
    currentTeam: any[]
  ): Promise<{ riskScore: number; riskLevel: 'Low' | 'Medium' | 'High'; feasibilitySummary: string; recommendations: string[] }> {
    const buildLocalAudit = () => {
      const teamCount = currentTeam.length;
      const targetSize = project.teamSize || 4;
      const coverageRatio = teamCount / targetSize;

      let riskScore = 20;
      let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
      const recommendations: string[] = [];

      if (teamCount === 1) {
        riskScore = 75;
        riskLevel = 'High';
        recommendations.push("Solo team detected: Recruiter at least 1 Frontend and 1 Backend/AI developer before hackathon deadline.");
        recommendations.push("Consider scoping down UI deliverables and using pre-built UI components like Tailwind/Shadcn.");
      } else if (coverageRatio < 0.8) {
        riskScore = 45;
        riskLevel = 'Medium';
        recommendations.push(`Team has ${teamCount}/${targetSize} members. Recruit remaining key roles to avoid bottlenecking.`);
        recommendations.push("Focus early hackathon hours on establishing API contracts and database schema.");
      } else {
        riskScore = 15;
        riskLevel = 'Low';
        recommendations.push("Team composition is highly balanced across primary roles.");
        recommendations.push("Schedule early dry-run presentation 3 hours before hackathon submission.");
      }

      recommendations.push("Keep core feature set minimal and prioritize end-to-end working MVP video.");

      return {
        riskScore,
        riskLevel,
        feasibilitySummary: `Feasibility Audit for ${project.name}: Current team of ${teamCount} member(s) evaluating a ${project.complexity || 'intermediate'} scope. ${riskLevel} implementation risk based on skill distribution.`,
        recommendations
      };
    };

    if (!isRealApiKey || !genAI) {
      return buildLocalAudit();
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
You are an expert AI Hackathon Pitch Doctor & Architecture Advisor.
Evaluate the feasibility of this software project based on the current team:

Project Name: ${project.name}
Project Description: ${project.description || ''}
Target Team Size: ${project.teamSize || 4}
Required Skills: ${(project.requiredSkills || []).map((s: any) => s.name).join(', ')}
Required Roles: ${(project.requiredRoles || []).map((r: any) => r.name).join(', ')}

Current Team Members:
${JSON.stringify(currentTeam.map(m => ({ name: m.name, role: m.primaryRole, skills: m.skills.map((s: any) => s.name) })), null, 2)}

Return ONLY valid JSON in this exact structure:
{
  "riskScore": 25,
  "riskLevel": "Low",
  "feasibilitySummary": "Concise summary of team readiness and scope risk",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}
`.trim();

      const result = await model.generateContent(prompt);
      const cleanText = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Gemini feasibility audit failed, using fallback:", e);
      return buildLocalAudit();
    }
  async chatProjectAssistant(
    messages: Array<{ sender: 'user' | 'assistant'; text: string }>,
    projectName?: string,
    currentDescription?: string
  ): Promise<{ reply: string; suggestedDescription?: string }> {
    const buildLocalReply = () => {
      const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || '';
      const lower = lastUserMsg.toLowerCase();

      let reply = `Great ideas! To make your project description clear for team recruitment, focus on your core features, key technologies, and primary user value proposition.`;
      let suggestedDescription: string | undefined = undefined;

      if (lower.includes('smartcampus') || lower.includes('campus') || lower.includes('student')) {
        suggestedDescription = `Build an AI-powered smart campus portal and mobile assistant for students to find live lecture halls, campus events, academic notices, and personalized study group recommendations using React, Node.js, Python, and Gemini AI APIs.`;
        reply = `I've updated your description with a clear campus assistant breakdown! Click "Apply to Description" to use it.`;
      } else if (lower.includes('tech') || lower.includes('stack') || lower.includes('react') || lower.includes('python')) {
        suggestedDescription = `${currentDescription || ''} Built using modern full-stack web technologies including React, TypeScript, Node.js, and AI API integrations to deliver high reliability and intuitive UI.`;
        reply = `Added technical stack specifications to your project description!`;
      } else if (lastUserMsg.length > 10) {
        suggestedDescription = `${currentDescription ? currentDescription + ' ' : ''}${lastUserMsg.trim()}`;
        reply = `I've incorporated your feedback into a refined project description. Take a look below!`;
      }

      return { reply, suggestedDescription };
    };

    if (!isRealApiKey || !genAI) {
      return buildLocalReply();
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const conversationHistory = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
      
      const prompt = `
You are an expert AI Project Co-Pilot helping a project creator refine and write a high-impact, professional project description for team recruitment.

Project Name: ${projectName || 'Untitled Project'}
Current Project Description: "${currentDescription || 'Not specified yet'}"

Conversation History:
${conversationHistory}

Task:
1. Provide a helpful, concise assistant response answering the user's questions or asking clarifying questions about target users, core features, or technical stack.
2. If the user provides new details or asks you to write/improve the description, generate a polished 2-4 sentence project description.

Return ONLY valid JSON in this exact structure:
{
  "reply": "Your helpful response to the user here...",
  "suggestedDescription": "Optional refined project description if applicable, or omit if just conversing"
}
`.trim();

      const result = await model.generateContent(prompt);
      const cleanText = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Gemini chatProjectAssistant failed, using local fallback:", e);
      return buildLocalReply();
    }
  }
};
