import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Project, User, Invitation } from '../types';
import { dbService } from '../services/db';
import { useAuth } from './AuthContext';

interface AppStateContextType {
  projects: Project[];
  activeProject: Project | null;
  currentTeam: User[];
  invitations: Invitation[];
  candidates: User[];
  loading: boolean;
  setActiveProject: (project: Project | null) => void;
  createProject: (project: Omit<Project, 'ownerId' | 'createdAt'>) => Promise<Project>;
  updateProject: (project: Project) => Promise<void>;
  addToTeam: (user: User) => Promise<void>;
  removeFromTeam: (userId: string) => Promise<void>;
  sendTeamInvitation: (recipientId: string, message: string) => Promise<void>;
  refreshState: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [currentTeam, setCurrentTeam] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Trigger loading state refresh whenever user logs in or out
  useEffect(() => {
    refreshState();
  }, [user]);

  const refreshState = async () => {
    if (!user) {
      setProjects([]);
      setActiveProjectState(null);
      setCurrentTeam([]);
      setInvitations([]);
      setCandidates([]);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch user projects
      const userProjs = await dbService.getUserProjects(user.userId);
      setProjects(userProjs);

      // Restore active project from local state if available, or default to first
      const savedActiveId = localStorage.getItem('pm_active_project_id');
      const matchedActive = userProjs.find(p => p.projectId === savedActiveId);
      
      if (matchedActive) {
        setActiveProjectState(matchedActive);
        // Load members for active project
        const members = await dbService.getProjectMembers(matchedActive.projectId);
        const allUsers = await dbService.getAllUsers();
        // Map members to User structures
        const teamUsers = members
          .map(m => allUsers.find(u => u.userId === m.userId))
          .filter((u): u is User => !!u);
        setCurrentTeam(teamUsers);
      } else if (userProjs.length > 0) {
        setActiveProjectState(userProjs[0]);
        const members = await dbService.getProjectMembers(userProjs[0].projectId);
        const allUsers = await dbService.getAllUsers();
        const teamUsers = members
          .map(m => allUsers.find(u => u.userId === m.userId))
          .filter((u): u is User => !!u);
        setCurrentTeam(teamUsers);
      } else {
        setActiveProjectState(null);
        setCurrentTeam([]);
      }

      // 2. Fetch candidates pool (all users except the current logged in user)
      const allUsers = await dbService.getAllUsers();
      const filteredCandidates = allUsers.filter(u => u.userId !== user.userId && u.userId !== 'demo_user');
      setCandidates(filteredCandidates);

      // 3. Fetch invitations
      const userInvites = await dbService.getInvitationsForUser(user.userId);
      setInvitations(userInvites);
    } catch (e) {
      console.error("Error refreshing global state:", e);
    } finally {
      setLoading(false);
    }
  };

  const setActiveProject = async (project: Project | null) => {
    setActiveProjectState(project);
    if (project) {
      localStorage.setItem('pm_active_project_id', project.projectId);
      // Load members for new active project
      const members = await dbService.getProjectMembers(project.projectId);
      const allUsers = await dbService.getAllUsers();
      const teamUsers = members
        .map(m => allUsers.find(u => u.userId === m.userId))
        .filter((u): u is User => !!u);
      setCurrentTeam(teamUsers);
    } else {
      localStorage.removeItem('pm_active_project_id');
      setCurrentTeam([]);
    }
  };

  const createProject = async (projectData: Omit<Project, 'ownerId' | 'createdAt'>): Promise<Project> => {
    if (!user) throw new Error("Auth required to create projects.");
    
    const newProject: Project = {
      ...projectData,
      ownerId: user.userId,
      createdAt: new Date().toISOString()
    };

    // Optimistically update local state immediately for instant UI response
    setProjects(prev => {
      if (prev.some(p => p.projectId === newProject.projectId)) {
        return prev.map(p => p.projectId === newProject.projectId ? newProject : p);
      }
      return [...prev, newProject];
    });
    setActiveProjectState(newProject);
    localStorage.setItem('pm_active_project_id', newProject.projectId);

    // Save to database asynchronously in background
    dbService.saveProject(newProject).catch(err => {
      console.error("Error persisting project to database:", err);
    });

    return newProject;
  };

  const updateProject = async (project: Project): Promise<void> => {
    await dbService.saveProject(project);
    // Refresh locally
    setProjects(prev => prev.map(p => p.projectId === project.projectId ? project : p));
    if (activeProject?.projectId === project.projectId) {
      setActiveProjectState(project);
    }
  };

  const addToTeam = async (candidate: User) => {
    if (!activeProject) return;
    
    const newMember = {
      userId: candidate.userId,
      role: candidate.primaryRole,
      status: 'active' as const,
      joinedAt: new Date().toISOString()
    };

    await dbService.addProjectMember(activeProject.projectId, newMember);
    setCurrentTeam(prev => {
      if (prev.some(u => u.userId === candidate.userId)) return prev;
      return [...prev, candidate];
    });
  };

  const removeFromTeam = async (userId: string) => {
    if (!activeProject) return;

    await dbService.removeProjectMember(activeProject.projectId, userId);
    setCurrentTeam(prev => prev.filter(u => u.userId !== userId));
  };

  const sendTeamInvitation = async (recipientId: string, message: string) => {
    if (!user || !activeProject) return;

    const newInvite: Invitation = {
      invitationId: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: activeProject.projectId,
      senderId: user.userId,
      recipientId,
      status: 'pending',
      message,
      createdAt: new Date().toISOString()
    };

    await dbService.saveInvitation(newInvite);
    setInvitations(prev => [...prev, newInvite]);
  };

  return (
    <AppStateContext.Provider value={{
      projects,
      activeProject,
      currentTeam,
      invitations,
      candidates,
      loading,
      setActiveProject,
      createProject,
      updateProject,
      addToTeam,
      removeFromTeam,
      sendTeamInvitation,
      refreshState
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
