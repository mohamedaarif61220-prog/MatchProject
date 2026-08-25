import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { DEMO_PROJECT } from '../config/seedCandidates';
import { apiService } from '../services/api';
import { Sparkles, Zap, ArrowRight, FolderPlus } from 'lucide-react';

export const CreateProjectPage: React.FC = () => {
  const { createProject, setActiveProject } = useAppState();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [projectType, setProjectType] = useState<'College Project' | 'Hackathon' | 'Competition' | 'Research' | 'Startup' | 'Open Source' | 'Other'>('Hackathon');
  const [teamSize, setTeamSize] = useState<number>(5);
  const [deadline] = useState<string>('2026-12-31');
  const [requiredHoursPerWeek, setRequiredHours] = useState<number>(10);

  const [analyzing, setAnalyzing] = useState<boolean>(false);

  const handleAutofillDemo = () => {
    setName(DEMO_PROJECT.name);
    setDescription(DEMO_PROJECT.description);
    setProjectType(DEMO_PROJECT.projectType);
    setTeamSize(DEMO_PROJECT.teamSize);
    setRequiredHours(DEMO_PROJECT.requiredHoursPerWeek);
  };

  const handleAnalyzeAndCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setAnalyzing(true);
    try {
      // 1. Request Gemini analysis via backend /api/analyze endpoint
      const requirements = await apiService.analyzeProject(description);

      // 2. Create project instance with extracted requirements
      const newProject = await createProject({
        projectId: `proj_${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        projectType,
        teamSize,
        deadline,
        requiredHoursPerWeek,
        technologies: requirements.requiredSkills.map(s => s.name),
        requiredRoles: requirements.requiredRoles.map(r => r.name),
        requiredSkills: requirements.requiredSkills.map(s => s.name),
        niceToHaveSkills: ['Tailwind CSS', 'Figma'],
        aiSummary: requirements.summary,
        status: 'active'
      });

      setActiveProject(newProject);

      // Store extracted requirements in local state for review page
      sessionStorage.setItem(`pm_reqs_${newProject.projectId}`, JSON.stringify(requirements));

      navigate(`/projects/${newProject.projectId}/analysis`);
    } catch (err) {
      console.error("Project creation failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Create New Project</h2>
              <p className="text-xs text-slate-400">Describe your goals to extract structured requirements with Gemini AI.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutofillDemo}
            className="btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5 text-accent-cyan border-accent-cyan/30"
          >
            <Zap className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Autofill Demo</span>
          </button>
        </div>

        <form onSubmit={handleAnalyzeAndCreate} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. SmartCampus AI Assistant"
              className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
              Project Description (Primary AI Input)
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail the target goals, core tech stack, scope, and key deliverables of your project..."
              className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Project Type</label>
              <select
                value={projectType}
                onChange={e => setProjectType(e.target.value as any)}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="Hackathon">Hackathon</option>
                <option value="Startup">Startup</option>
                <option value="College Project">College Project</option>
                <option value="Competition">Competition</option>
                <option value="Research">Research</option>
                <option value="Open Source">Open Source</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Target Team Size</label>
              <input
                type="number"
                min={2}
                max={10}
                value={teamSize}
                onChange={e => setTeamSize(Number(e.target.value))}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Weekly Commitment</label>
              <input
                type="number"
                min={1}
                max={50}
                value={requiredHoursPerWeek}
                onChange={e => setRequiredHours(Number(e.target.value))}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={analyzing}
              className="btn-beam w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Requirements with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Project with AI & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
