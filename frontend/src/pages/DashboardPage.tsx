import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROJECT } from '../config/seedCandidates';
import { Plus, Users, Zap, Layers, FolderKanban, CheckCircle2, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { projects, activeProject, setActiveProject, createProject, invitations } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectProject = (proj: any) => {
    setActiveProject(proj);
    navigate(`/projects/${proj.projectId}/team`);
  };

  const handleAutofillDemo = async () => {
    const created = await createProject(DEMO_PROJECT);
    setActiveProject(created);
    navigate(`/projects/${created.projectId}/analysis`);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      {/* Header Profile Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"}
            alt="Avatar"
            className="w-14 h-14 rounded-xl border border-accent-cyan/30 bg-slate-800"
          />
          <div>
            <h2 className="text-xl font-bold text-white font-display">Welcome back, {user?.name || 'Developer'}</h2>
            <p className="text-sm text-slate-400">
              {user?.primaryRole} • {user?.availabilityHoursPerWeek || 10} hrs/week availability
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/onboarding" className="btn-secondary text-xs !px-4 !py-2.5">
            Edit Profile
          </Link>
          <Link to="/projects/new" className="btn-primary text-xs !px-4 !py-2.5 flex items-center gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Link>
        </div>
      </div>

      {/* Demo Project Quick Access Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-accent-cyan/10 via-obsidian-900 to-accent-ember/10 border border-accent-cyan/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Competition Preset</span>
          </div>
          <h3 className="text-xl font-bold text-white font-display">SmartCampus AI Assistant</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Build an AI-powered campus assistant that helps students find classrooms, events, academic resources, and campus services.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleAutofillDemo}
            className="btn-beam px-6 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Launch SmartCampus Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Projects & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Projects (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-accent-cyan" />
              <span>Active Projects ({projects.length})</span>
            </h3>
            <Link to="/projects/new" className="text-xs text-accent-cyan hover:underline">
              + New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="glass-panel p-8 text-center rounded-xl space-y-4">
              <p className="text-sm text-slate-400">No active projects found in workspace.</p>
              <button
                onClick={handleAutofillDemo}
                className="btn-primary text-xs px-4 py-2 font-bold"
              >
                Autofill Demo Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map(proj => {
                const isActive = activeProject?.projectId === proj.projectId;
                return (
                  <div
                    key={proj.projectId}
                    className={`glass-panel p-5 rounded-xl border transition-all cursor-pointer ${
                      isActive ? 'border-accent-cyan/60 bg-accent-cyan/5' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    onClick={() => handleSelectProject(proj)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                          {proj.projectType}
                        </span>
                        <h4 className="text-base font-bold text-white mt-0.5">{proj.name}</h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isActive ? 'Active Target' : 'Select'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                      {proj.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                      <span>Target Team: {proj.teamSize} members</span>
                      <span className="text-accent-cyan font-semibold flex items-center gap-1">
                        Team Builder <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Status (1 col) */}
        <div className="space-y-6">
          {/* Invitations Widget */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Invitations</span>
              </h4>
              <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-bold">
                {invitations.length}
              </span>
            </div>

            {invitations.length === 0 ? (
              <p className="text-xs text-slate-400">No pending team invitations.</p>
            ) : (
              <div className="space-y-2">
                {invitations.slice(0, 3).map(inv => (
                  <div key={inv.invitationId} className="p-2.5 bg-obsidian-900 rounded-lg border border-slate-800 text-xs">
                    <p className="text-slate-300 font-medium">Invitation from Team Lead</p>
                    <span className="text-[10px] text-accent-cyan capitalize">{inv.status}</span>
                  </div>
                ))}
              </div>
            )}

            <Link to="/invitations" className="block text-center text-xs text-indigo-400 hover:underline pt-2">
              View All Invitations →
            </Link>
          </div>

          {/* Core Engine Status */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Matching Engine</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between items-center">
                <span>Deterministic Math</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex justify-between items-center">
                <span>6-Factor Weights</span>
                <span className="text-slate-400">35/20/15/15/10/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Gemini API Service</span>
                <span className="text-accent-cyan">Active / Fallback Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
