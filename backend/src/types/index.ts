export type SkillLevel = 'Beginner' | 'Intermediate' | 'Proficient' | 'Advanced';

export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface User {
  userId: string;
  name: string;
  avatarUrl: string;
  bio: string;
  primaryRole: string;
  skills: Skill[];
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  interests: string[];
  preferredProjectTypes: string[];
  availabilityHoursPerWeek: number;
  preferredRoles: string[];
  portfolioLinks: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  projectId: string;
  ownerId: string;
  name: string;
  description: string;
  projectType: 'College Project' | 'Hackathon' | 'Competition' | 'Research' | 'Startup' | 'Open Source' | 'Other';
  teamSize: number;
  deadline: string;
  requiredHoursPerWeek: number;
  technologies: string[];
  requiredRoles: string[];
  requiredSkills: string[];
  niceToHaveSkills: string[];
  aiSummary?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectMember {
  userId: string;
  role: string;
  status: 'active' | 'pending';
  joinedAt: string;
}

export interface MatchResult {
  candidateId: string;
  overallScore: number;
  skillScore: number;
  roleScore: number;
  experienceScore: number;
  availabilityScore: number;
  interestScore: number;
  complementarityScore: number;
  explanation: string;
  createdAt: string;
}

export interface Invitation {
  invitationId: string;
  projectId: string;
  senderId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  message: string;
  createdAt: string;
  respondedAt?: string;
}

export interface RequirementItem<T> {
  name: T;
  priority: 'required' | 'preferred';
}

export interface ProjectRequirements {
  summary: string;
  projectType: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  requiredRoles: RequirementItem<string>[];
  requiredSkills: RequirementItem<string>[];
  recommendedTeamSize: number;
  reasoning: string;
}

export interface TeamMetrics {
  teamCompatibility: number;
  skillCoverage: { [skillName: string]: number };
  roleCoverage: { [roleName: string]: number };
  strengths: string[];
  gaps: string[];
  aiRecommendations?: string;
}
