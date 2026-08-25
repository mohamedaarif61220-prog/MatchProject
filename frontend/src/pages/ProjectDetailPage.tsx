import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { ArrowRight } from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, activeProject } = useAppState();

  const project = projects.find(p => p.projectId === projectId) || activeProject;

  if (!project) {
    return <div className="text-center py-20 text-slate-400">Project not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase font-semibold text-accent-cyan tracking-wider">{project.projectType}</span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">{project.name}</h2>
          </div>

          <Link
            to={`/projects/${project.projectId}/team`}
            className="btn-beam px-6 py-2.5 text-xs font-bold flex items-center gap-2"
          >
            <span>Open Team Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Description & AI Summary */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h3>
            <p className="text-sm text-slate-200 leading-relaxed bg-obsidian-900/60 p-4 rounded-xl border border-slate-800">
              {project.description}
            </p>
          </div>

          {project.aiSummary && (
            <div>
              <h3 className="text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1">AI Executive Summary</h3>
              <p className="text-xs text-slate-300 bg-accent-cyan/10 p-3 rounded-xl border border-accent-cyan/20 leading-relaxed">
                "{project.aiSummary}"
              </p>
            </div>
          )}
        </div>

        {/* Requirements Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-obsidian-900 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Team Size</span>
            <p className="text-base font-bold text-white mt-1">{project.teamSize} Members</p>
          </div>
          <div className="p-4 bg-obsidian-900 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Required Hours</span>
            <p className="text-base font-bold text-accent-cyan mt-1">{project.requiredHoursPerWeek} hrs/week</p>
          </div>
          <div className="p-4 bg-obsidian-900 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Project Deadline</span>
            <p className="text-base font-bold text-white mt-1">{project.deadline}</p>
          </div>
        </div>

        {/* Technical Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white mb-3">Required Roles</h4>
            <div className="flex flex-wrap gap-2">
              {project.requiredRoles.map(role => (
                <span key={role} className="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-700">
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white mb-3">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {project.requiredSkills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-slate-800 text-accent-cyan rounded-lg text-xs font-medium border border-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
