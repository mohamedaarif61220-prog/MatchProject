import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import { DEMO_PROJECT } from '../config/seedCandidates';
import { apiService } from '../services/api';
import { Sparkles, Zap, ArrowRight, FolderPlus, Bot, Send, CheckCircle2 } from 'lucide-react';

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

  // AI Assistant Chat State
  const [showAssistant, setShowAssistant] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; suggestedDesc?: string }>>([
    {
      sender: 'assistant',
      text: "Hi! I'm your Gemini AI Co-Pilot. Tell me about your project idea or target goals, and I'll help you write a high-impact description to recruit top candidates!"
    }
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  const handleAutofillDemo = () => {
    setName(DEMO_PROJECT.name);
    setDescription(DEMO_PROJECT.description);
    setProjectType(DEMO_PROJECT.projectType);
    setTeamSize(DEMO_PROJECT.teamSize);
    setRequiredHours(DEMO_PROJECT.requiredHoursPerWeek);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sendingChat) return;

    const userText = inputMsg.trim();
    const newMessages = [...chatMessages, { sender: 'user' as const, text: userText }];
    setChatMessages(newMessages);
    setInputMsg('');
    setSendingChat(true);

    try {
      const res = await apiService.chatProjectAssistant(newMessages, name, description);
      setChatMessages(prev => [
        ...prev,
        { sender: 'assistant', text: res.reply, suggestedDesc: res.suggestedDescription }
      ]);
      if (res.suggestedDescription && !description) {
        setDescription(res.suggestedDescription);
      }
    } catch (err) {
      console.error("AI Assistant chat failed:", err);
    } finally {
      setSendingChat(false);
    }
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
    <div className="max-w-4xl mx-auto py-10 px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Main Creation Form (7 cols) */}
      <div className="lg:col-span-7 glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Create New Project</h2>
              <p className="text-xs text-slate-400">Extract structured roles & tech stack with AI.</p>
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
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase">
                Project Description (Primary AI Input)
              </label>
              <button
                type="button"
                onClick={() => setShowAssistant(prev => !prev)}
                className="text-[11px] text-accent-cyan hover:underline flex items-center gap-1 font-semibold"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>{showAssistant ? 'Hide AI Co-Pilot' : 'Need Help Writing?'}</span>
              </button>
            </div>
            <textarea
              required
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail target goals, tech stack, scope, and deliverables..."
              className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Weekly Hours</label>
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

      {/* AI Assistant Chat Side Panel (5 cols) */}
      <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 sticky top-24">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Gemini AI Co-Pilot</h3>
              <p className="text-[10px] text-slate-400">Ask questions or brainstorm ideas</p>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full">
            Active
          </span>
        </div>

        {/* Chat History Messages */}
        <div className="h-72 overflow-y-auto space-y-3 pr-1 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-100 ml-6'
                  : 'bg-obsidian-900 border-slate-800 text-slate-200 mr-4'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                {msg.sender === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <p className="leading-relaxed">{msg.text}</p>

              {msg.suggestedDesc && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="p-2 bg-obsidian-950 rounded border border-slate-800 text-[11px] text-accent-cyan italic">
                    "{msg.suggestedDesc}"
                  </div>
                  <button
                    type="button"
                    onClick={() => setDescription(msg.suggestedDesc!)}
                    className="w-full py-1.5 bg-accent-cyan/20 hover:bg-accent-cyan/30 text-accent-cyan border border-accent-cyan/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Apply to Description</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
          <input
            type="text"
            placeholder="Ask AI: e.g., 'Make it sound like a startup'..."
            value={inputMsg}
            onChange={e => setInputMsg(e.target.value)}
            className="flex-1 bg-obsidian-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
          />
          <button
            type="submit"
            disabled={sendingChat || !inputMsg.trim()}
            className="btn-primary !px-3 !py-2 text-xs font-bold flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

