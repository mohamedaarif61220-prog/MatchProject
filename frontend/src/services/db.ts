import { db, isFirebaseConfigured } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import type { User, Project, ProjectMember, MatchResult, Invitation } from '../types';
import { SEED_CANDIDATES } from '../config/seedCandidates';

// --- LocalStorage Fallback Helpers ---

const getLocal = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocal = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize LocalStorage with seed data if not present or if candidates updated
const initializeLocalStorage = () => {
  const currentLocal = getLocal<User>('pm_users');
  if (currentLocal.length < SEED_CANDIDATES.length) {
    setLocal('pm_users', SEED_CANDIDATES);
    console.log("LocalStorage updated with latest seed candidates pool.");
  }
};

// Auto-run local storage initialization
if (typeof window !== 'undefined') {
  initializeLocalStorage();
}

// --- Combined DB Abstraction Layer ---

export const dbService = {
  // --- User Profiles ---
  
  async getUserProfile(userId: string): Promise<User | null> {
    if (isFirebaseConfigured && db) {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      return snapshot.exists() ? (snapshot.data() as User) : null;
    } else {
      const users = getLocal<User>('pm_users');
      return users.find(u => u.userId === userId) || null;
    }
  },

  async saveUserProfile(user: User): Promise<void> {
    const { userId, ...profileData } = user;
    const cleanProfile: User = {
      userId,
      name: profileData.name || '',
      avatarUrl: profileData.avatarUrl || '',
      bio: profileData.bio || '',
      primaryRole: profileData.primaryRole || 'Full Stack Developer',
      skills: profileData.skills || [],
      experience: profileData.experience || 'Intermediate',
      interests: profileData.interests || [],
      preferredProjectTypes: profileData.preferredProjectTypes || [],
      availabilityHoursPerWeek: profileData.availabilityHoursPerWeek ?? 10,
      preferredRoles: profileData.preferredRoles || [],
      portfolioLinks: profileData.portfolioLinks || [],
      createdAt: profileData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, cleanProfile, { merge: true });
    } else {
      const users = getLocal<User>('pm_users');
      const idx = users.findIndex(u => u.userId === userId);
      if (idx >= 0) {
        users[idx] = cleanProfile;
      } else {
        users.push(cleanProfile);
      }
      setLocal('pm_users', users);
    }
  },

  async getAllUsers(): Promise<User[]> {
    let dbUsers: User[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        dbUsers = snapshot.docs.map(d => d.data() as User);
      } catch (err) {
        console.error("Error fetching Firestore users:", err);
      }
    } else {
      dbUsers = getLocal<User>('pm_users');
    }

    // Merge SEED_CANDIDATES so demo candidates are always present alongside registered users
    const seedCandidates = SEED_CANDIDATES || [];
    const mergedMap = new Map<string, User>();
    
    // 1. Add seed candidates
    seedCandidates.forEach(u => mergedMap.set(u.userId, u));
    // 2. Add/overwrite with real database users
    dbUsers.forEach(u => {
      if (u && u.userId) mergedMap.set(u.userId, u);
    });

    return Array.from(mergedMap.values());
  },

  // --- Projects ---

  async getProject(projectId: string): Promise<Project | null> {
    if (isFirebaseConfigured && db) {
      const projectRef = doc(db, 'projects', projectId);
      const snapshot = await getDoc(projectRef);
      return snapshot.exists() ? (snapshot.data() as Project) : null;
    } else {
      const projects = getLocal<Project>('pm_projects');
      return projects.find(p => p.projectId === projectId) || null;
    }
  },

  async saveProject(project: Project): Promise<void> {
    if (isFirebaseConfigured && db) {
      const projectRef = doc(db, 'projects', project.projectId);
      await setDoc(projectRef, { ...project, updatedAt: new Date().toISOString() });
    } else {
      const projects = getLocal<Project>('pm_projects');
      const idx = projects.findIndex(p => p.projectId === project.projectId);
      if (idx >= 0) {
        projects[idx] = { ...project, updatedAt: new Date().toISOString() };
      } else {
        projects.push(project);
      }
      setLocal('pm_projects', projects);
    }
  },

  async getUserProjects(ownerId: string): Promise<Project[]> {
    if (isFirebaseConfigured && db) {
      const projectsRef = collection(db, 'projects');
      const q = query(projectsRef, where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as Project);
    } else {
      const projects = getLocal<Project>('pm_projects');
      return projects.filter(p => p.ownerId === ownerId);
    }
  },

  // --- Project Members (Subcollection) ---

  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    if (isFirebaseConfigured && db) {
      const membersRef = collection(db, 'projects', projectId, 'members');
      const snapshot = await getDocs(membersRef);
      return snapshot.docs.map(d => d.data() as ProjectMember);
    } else {
      const key = `pm_members_${projectId}`;
      return getLocal<ProjectMember>(key);
    }
  },

  async addProjectMember(projectId: string, member: ProjectMember): Promise<void> {
    if (isFirebaseConfigured && db) {
      const memberRef = doc(db, 'projects', projectId, 'members', member.userId);
      await setDoc(memberRef, member);
    } else {
      const key = `pm_members_${projectId}`;
      const members = getLocal<ProjectMember>(key);
      if (!members.some(m => m.userId === member.userId)) {
        members.push(member);
      }
      setLocal(key, members);
    }
  },

  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    if (isFirebaseConfigured && db) {
      const memberRef = doc(db, 'projects', projectId, 'members', userId);
      await deleteDoc(memberRef);
    } else {
      const key = `pm_members_${projectId}`;
      const members = getLocal<ProjectMember>(key);
      const filtered = members.filter(m => m.userId !== userId);
      setLocal(key, filtered);
    }
  },

  // --- Project Matches (Subcollection) ---

  async getProjectMatches(projectId: string): Promise<MatchResult[]> {
    if (isFirebaseConfigured && db) {
      const matchesRef = collection(db, 'projects', projectId, 'matches');
      const snapshot = await getDocs(matchesRef);
      return snapshot.docs.map(d => d.data() as MatchResult);
    } else {
      const key = `pm_matches_${projectId}`;
      return getLocal<MatchResult>(key);
    }
  },

  async saveProjectMatch(projectId: string, match: MatchResult): Promise<void> {
    if (isFirebaseConfigured && db) {
      const matchRef = doc(db, 'projects', projectId, 'matches', match.candidateId);
      await setDoc(matchRef, match);
    } else {
      const key = `pm_matches_${projectId}`;
      const matches = getLocal<MatchResult>(key);
      const idx = matches.findIndex(m => m.candidateId === match.candidateId);
      if (idx >= 0) {
        matches[idx] = match;
      } else {
        matches.push(match);
      }
      setLocal(key, matches);
    }
  },

  // --- Invitations (Root Level) ---

  async getInvitationsForUser(userId: string): Promise<Invitation[]> {
    if (isFirebaseConfigured && db) {
      const invitesRef = collection(db, 'invitations');
      const qReceived = query(invitesRef, where('recipientId', '==', userId));
      const qSent = query(invitesRef, where('senderId', '==', userId));

      const [recvSnap, sentSnap] = await Promise.all([getDocs(qReceived), getDocs(qSent)]);
      
      const received = recvSnap.docs.map(d => d.data() as Invitation);
      const sent = sentSnap.docs.map(d => d.data() as Invitation);
      
      // Merge unique entries
      const map = new Map<string, Invitation>();
      received.forEach(i => map.set(i.invitationId, i));
      sent.forEach(i => map.set(i.invitationId, i));
      return Array.from(map.values());
    } else {
      const invites = getLocal<Invitation>('pm_invitations');
      return invites.filter(i => i.recipientId === userId || i.senderId === userId);
    }
  },

  async saveInvitation(invitation: Invitation): Promise<void> {
    if (isFirebaseConfigured && db) {
      const inviteRef = doc(db, 'invitations', invitation.invitationId);
      await setDoc(inviteRef, invitation);
    } else {
      const invites = getLocal<Invitation>('pm_invitations');
      const idx = invites.findIndex(i => i.invitationId === invitation.invitationId);
      if (idx >= 0) {
        invites[idx] = invitation;
      } else {
        invites.push(invitation);
      }
      setLocal('pm_invitations', invites);
    }
  },

  async updateInvitationStatus(
    invitationId: string, 
    status: 'accepted' | 'declined' | 'cancelled'
  ): Promise<void> {
    if (isFirebaseConfigured && db) {
      const inviteRef = doc(db, 'invitations', invitationId);
      await updateDoc(inviteRef, { 
        status, 
        respondedAt: new Date().toISOString() 
      });
    } else {
      const invites = getLocal<Invitation>('pm_invitations');
      const idx = invites.findIndex(i => i.invitationId === invitationId);
      if (idx >= 0) {
        invites[idx] = { 
          ...invites[idx], 
          status, 
          respondedAt: new Date().toISOString() 
        };
        setLocal('pm_invitations', invites);
      }
    }
  },

  // --- Reset Local Demo State ---
  resetDemoState(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('pm_users');
    localStorage.removeItem('pm_projects');
    localStorage.removeItem('pm_invitations');
    localStorage.removeItem('pm_active_project_id');
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('pm_members_') || key.startsWith('pm_matches_')) {
        localStorage.removeItem(key);
      }
    });
    setLocal('pm_users', SEED_CANDIDATES);
    console.log("Local Demo state has been reset to seed defaults.");
  }
};
