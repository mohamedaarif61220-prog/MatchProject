import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import type { ProjectRequirements } from '../types';
import { apiService } from '../services/api';
import { Sparkles, Plus, X, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export const ProjectAnalysisPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, updateProject, setActiveProject } = useAppState();
  const navigate = useNavigate();

  const currentProject = projects.find(p => p.projectId === projectId);

  const [requirements, setRequirements] = useState<ProjectRequirements | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newRoleName, setNewRoleName] = useState<string>('');

  useEffect(() => {
    if (!currentProject) return;

    // Load requirements from session cache or re-run analysis
    const cached = sessionStorage.getItem(`pm_reqs_${currentProject.projectId}`);
    if (cached) {
      setRequirements(JSON.parse(cached));
      setLoading(false);
    } else {
      apiService.analyzeProject(currentProject.description).then(res => {
        setRequirements(res);
        sessionStorage.setItem(`pm_reqs_${currentProject.projectId}`, JSON.stringify(res));
        setLoading(false);
      });
    }
  }, [currentProject]);

  if (!currentProject) {
    return <div className="text-center py-20 text-slate-400">Project not found.</div>;
  }

  if (loading || !requirements) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-accent-cyan border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-lg font-bold text-white font-display">Analyzing project requirements...</h3>
        <p className="text-xs text-slate-400">Extracting technical roles, skills, and complexity via Gemini AI...</p>
      </div>
    );
  }

  // --- Handlers for User Editing of Extracted Requirements ---

  const handleRemoveSkill = (skillName: string) => {
    setRequirements(prev => {
      if (!prev) return null;
      return {
        ...prev,
        requiredSkills: prev.requiredSkills.filter(s => s.name !== skillName)
      };
    });
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const name = newSkillName.trim();
    setRequirements(prev => {
      if (!prev) return null;
      if (prev.requiredSkills.some(s => s.name.toLowerCase() === name.toLowerCase())) return prev;
      return {
        ...prev,
        requiredSkills: [...prev.requiredSkills, { name, priority: 'required' }]
      };
    });
    setNewSkillName('');
  };

  const handleRemoveRole = (roleName: string) => {
    setRequirements(prev => {
      if (!prev) return null;
      return {
        ...prev,
        requiredRoles: prev.requiredRoles.filter(r => r.name !== roleName)
      };
    });
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    const name = newRoleName.trim();
    setRequirements(prev => {
      if (!prev) return null;
      if (prev.requiredRoles.some(r => r.name.toLowerCase() === name.toLowerCase())) return prev;
      return {
        ...prev,
        requiredRoles: [...prev.requiredRoles, { name, priority: 'required' }]
      };
    });
    setNewRoleName('');
  };

  const handleConfirmAndProceed = async () => {
    if (!requirements || !currentProject) return;

    // Save final user-edited requirements onto project object
    const updated = {
      ...currentProject,
      requiredSkills: requirements.requiredSkills.map(s => s.name),
      requiredRoles: requirements.requiredRoles.map(r => r.name),
      technologies: requirements.requiredSkills.map(s => s.name),
      aiSummary: requirements.summary
    };

    await updateProject(updated);
    setActiveProject(updated);

    // Proceed to Team Builder
    navigate(`/projects/${currentProject.projectId}/team`);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-accent-cyan/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Project Analysis Complete</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display">{currentProject.name}</h2>
        </div>

        <button
          onClick={handleConfirmAndProceed}
          className="btn-beam px-6 py-3 text-xs font-bold flex items-center gap-2"
        >
          <span>Find Candidate Pool</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Summary Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">AI Executive Summary</h3>
        <p className="text-sm text-slate-200 leading-relaxed bg-obsidian-900/60 p-4 rounded-xl border border-slate-800">
          "{requirements.summary}"
        </p>
      </div>

      {/* Project Metadata Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Project Type</span>
          <p className="text-base font-bold text-white mt-1">{requirements.projectType}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Complexity Level</span>
          <p className="text-base font-bold text-accent-cyan capitalize mt-1">{requirements.complexity}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Recommended Team Size</span>
          <p className="text-base font-bold text-white mt-1">{requirements.recommendedTeamSize} Members</p>
        </div>
      </div>

      {/* Extracted Roles & Skills Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Roles */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Required Roles ({requirements.requiredRoles.length})</span>
            </h4>
            <span className="text-xs text-slate-400">Editable</span>
          </div>

          <div className="space-y-2">
            {requirements.requiredRoles.map(role => (
              <div key={role.name} className="flex justify-between items-center p-3 bg-obsidian-900 rounded-xl border border-slate-800 text-xs">
                <span className="font-semibold text-slate-200">{role.name}</span>
                <button onClick={() => handleRemoveRole(role.name)} className="text-slate-400 hover:text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add role (e.g. Backend Dev)"
              value={newRoleName}
              onChange={e => setNewRoleName(e.target.value)}
              className="flex-1 bg-obsidian-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            />
            <button onClick={handleAddRole} className="btn-secondary !px-3 !py-1.5 text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Required Skills */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-cyan" />
              <span>Required Skills ({requirements.requiredSkills.length})</span>
            </h4>
            <span className="text-xs text-slate-400">Editable</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {requirements.requiredSkills.map(skill => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-accent-cyan rounded-lg text-xs font-medium border border-slate-700"
              >
                {skill.name}
                <button onClick={() => handleRemoveSkill(skill.name)} className="hover:text-red-400 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Docker)"
              value={newSkillName}
              onChange={e => setNewSkillName(e.target.value)}
              className="flex-1 bg-obsidian-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            />
            <button onClick={handleAddSkill} className="btn-secondary !px-3 !py-1.5 text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Confirm Bar */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleConfirmAndProceed}
          className="btn-beam px-8 py-3 text-sm font-bold flex items-center gap-2"
        >
          <span>Confirm Requirements & Open Team Builder</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
