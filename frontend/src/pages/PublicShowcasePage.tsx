import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppState } from '../context/AppStateContext';
import { dbService } from '../services/db';
import type { Project, User } from '../types';
import { Layers, Sparkles, Send, Search, Filter, Rocket, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicShowcasePage: React.FC = () => {
  const { user } = useAuth();
  const { sendTeamInvitation } = useAppState();

  const [projects, setProjects] = useState<Project[]>([]);
  const [userCache, setUserCache] = useState<{ [userId: string]: User }>({});
  const [memberCounts, setMemberCounts] = useState<{ [projectId: string]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Application Modal state
  const [applyingProject, setApplyingProject] = useState<Project | null>(null);
  const [applyNote, setApplyNote] = useState<string>('');
  const [sendingApply, setSendingApply] = useState<boolean>(false);
  const [applySuccessToast, setApplySuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const loadShowcaseData = async () => {
      setLoading(true);
      try {
        const [allProjects, allUsers] = await Promise.all([
          dbService.getAllPublicProjects(),
          dbService.getAllUsers()
        ]);

        setProjects(allProjects);

        const uMap: { [id: string]: User } = {};
        allUsers.forEach(u => { uMap[u.userId] = u; });
        setUserCache(uMap);

        // Fetch member count for each project
        const counts: { [id: string]: number } = {};
        await Promise.all(
          allProjects.map(async (p) => {
            const members = await dbService.getProjectMembers(p.projectId);
            // Default count to 1 (owner) if subcollection empty
            counts[p.projectId] = Math.max(1, members.length);
          })
        );
        setMemberCounts(counts);
      } catch (err) {
        console.error("Error loading public showcase:", err);
      } finally {
        setLoading(false);
      }
    };
    loadShowcaseData();
  }, []);

  const handleOpenApplyModal = (project: Project) => {
    setApplyingProject(project);
    if (user) {
      setApplyNote(
        `Hi team! I'm ${user.name}, a ${user.primaryRole} with skills in ${user.skills.slice(0, 3).map(s => s.name).join(', ')}. I'd love to join ${project.name}!`
      );
    }
  };

  const handleSendApplication = async () => {
    if (!applyingProject || !user) return;
    setSendingApply(true);
    try {
      // Send application invitation to the project owner
      await sendTeamInvitation(user.userId, applyNote);
      setApplySuccessToast(`Application sent to ${applyingProject.name} team lead!`);
      setTimeout(() => setApplySuccessToast(null), 4000);
      setApplyingProject(null);
    } catch (e) {
      console.error("Failed to send application:", e);
    } finally {
      setSendingApply(false);
    }
  };

  // Filter logic
  const filteredProjects = projects.filter(p => {
    const summaryText = p.aiSummary || p.description || '';
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          summaryText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || p.projectType.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Rocket className="w-3.5 h-3.5" />
            <span>Public Recruitment Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">Hackathon & Startup Team Showcase</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
            Explore live active teams looking for talented collaborators. Apply to join projects matching your skill sets.
          </p>
        </div>

        {user && (
          <Link to="/projects/new" className="btn-beam px-5 py-3 text-xs font-bold flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4" />
            <span>Post Your Project</span>
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects by title, tech stack, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-obsidian-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent-cyan"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['All', 'Hackathon', 'Startup', 'College Project'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                selectedType === type
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span>Loading public team feed...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-400 space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold">No teams found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map(proj => {
            const owner = userCache[proj.ownerId];
            const activeCount = memberCounts[proj.projectId] || 1;
            const openSlots = Math.max(0, proj.teamSize - activeCount);
            const isOwner = user?.userId === proj.ownerId;

            return (
              <div
                key={proj.projectId}
                className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
                        {proj.projectType}
                      </span>
                      <h3 className="text-lg font-bold text-white font-display mt-1.5">{proj.name}</h3>
                      {owner && (
                        <p className="text-xs text-slate-400">Led by <strong className="text-slate-200">{owner.name}</strong> ({owner.primaryRole})</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        openSlots > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {openSlots > 0 ? `${openSlots} Slots Open` : 'Team Full'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">{activeCount} / {proj.teamSize} Members</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {proj.aiSummary || proj.description}
                  </p>

                  {/* Required Tech Stack */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 block">Required Stack & Roles</span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.requiredSkills?.map(s => (
                        <span key={typeof s === 'string' ? s : (s as any).name} className="px-2 py-0.5 bg-obsidian-900 border border-slate-800 text-accent-cyan text-[11px] rounded-md font-medium">
                          {typeof s === 'string' ? s : (s as any).name}
                        </span>
                      ))}
                      {proj.requiredRoles?.map(r => (
                        <span key={typeof r === 'string' ? r : (r as any).name} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] rounded-md font-medium">
                          {typeof r === 'string' ? r : (r as any).name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Target Size: <strong className="text-slate-300">{proj.teamSize} Members</strong></span>

                  {isOwner ? (
                    <Link to={`/projects/${proj.projectId}/team`} className="btn-secondary !px-4 !py-1.5 text-xs text-accent-cyan font-bold">
                      Manage Team →
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleOpenApplyModal(proj)}
                      disabled={openSlots === 0 || !user}
                      className={`btn-primary !px-4 !py-1.5 text-xs font-bold flex items-center gap-1.5 ${
                        openSlots === 0 || !user ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500' : ''
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{openSlots === 0 ? 'Team Full' : 'Apply to Join'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Modal */}
      {applyingProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-indigo-500 to-emerald-500" />

            <div>
              <h3 className="text-base font-bold text-white font-display">Apply to Join {applyingProject.name}</h3>
              <p className="text-xs text-slate-400">Send an application pitch to the team lead.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Application Message</label>
              <textarea
                rows={4}
                value={applyNote}
                onChange={e => setApplyNote(e.target.value)}
                className="w-full bg-obsidian-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-accent-cyan leading-relaxed resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApplyingProject(null)}
                className="btn-secondary flex-1 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendApplication}
                disabled={sendingApply}
                className="btn-beam flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingApply ? 'Sending...' : 'Send Application'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {applySuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{applySuccessToast}</span>
        </div>
      )}
    </div>
  );
};
