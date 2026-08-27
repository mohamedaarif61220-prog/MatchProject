import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, Skill, SkillLevel } from '../types';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Plus, X, UserCheck, CheckCircle2, Camera, Upload } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState<string>(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.userId || 'User'}`);
  const [bio, setBio] = useState<string>(user?.bio || '');
  const [primaryRole, setPrimaryRole] = useState<string>(user?.primaryRole || 'Full Stack Developer');
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(user?.experience || 'Intermediate');
  const [availabilityHoursPerWeek, setAvailability] = useState<number>(user?.availabilityHoursPerWeek || 10);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const [skills, setSkills] = useState<Skill[]>(user?.skills || [
    { name: 'React', level: 'Advanced' },
    { name: 'TypeScript', level: 'Intermediate' }
  ]);
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');

  const [interestsText, setInterestsText] = useState<string>((user?.interests || ['AI', 'Hackathon']).join(', '));
  const [preferredProjectTypesText, setPrefProjectTypesText] = useState<string>((user?.preferredProjectTypes || ['Hackathon', 'Startup']).join(', '));
  const [preferredRolesText, setPrefRolesText] = useState<string>((user?.preferredRoles || ['Frontend Developer', 'Full Stack Developer']).join(', '));

  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleAddSkill = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!newSkillName.trim()) return;
    const exists = skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (exists) return;
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      const interests = interestsText.split(',').map(s => s.trim()).filter(Boolean);
      const preferredProjectTypes = preferredProjectTypesText.split(',').map(s => s.trim()).filter(Boolean);
      const preferredRoles = preferredRolesText.split(',').map(s => s.trim()).filter(Boolean);

      const updatedUser: User = {
        userId: user?.userId || 'demo_user',
        name: name.trim(),
        avatarUrl: avatarUrl || user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
        bio: bio.trim(),
        primaryRole,
        skills,
        experience,
        interests,
        preferredProjectTypes,
        availabilityHoursPerWeek: Number(availabilityHoursPerWeek) || 10,
        preferredRoles,
        portfolioLinks: user?.portfolioLinks || [],
        createdAt: user?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Persist to database (Firestore / localStorage)
      await dbService.saveUserProfile(updatedUser);
      // 2. Immediately update in AuthContext React state
      updateUserProfile(updatedUser);

      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">User Profile & Skill Settings</h2>
            <p className="text-xs text-slate-400">Configure your profile attributes for deterministic match calculations.</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-sm text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Profile saved successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo Upload Panel */}
          <div className="p-4 bg-obsidian-900/60 rounded-xl border border-slate-800 flex items-center gap-5">
            <div className="relative group">
              <img
                src={avatarUrl}
                alt="Profile Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-cyan/40 bg-slate-800 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              >
                <Camera className="w-5 h-5 text-accent-cyan" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <label className="block text-xs font-semibold text-slate-200 uppercase">Profile Photo</label>
              <p className="text-[11px] text-slate-400">
                Upload a custom profile photo (PNG, JPG, WebP up to 5MB).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-xs !px-3 !py-1.5 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Upload Image</span>
                </button>
                {avatarUrl.startsWith('data:') && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim() || 'User'}`)}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition-colors px-2"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan"
                placeholder="e.g. Aarif"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Primary Role</label>
              <select
                value={primaryRole}
                onChange={e => setPrimaryRole(e.target.value)}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI/ML Developer">AI/ML Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Data Engineer">Data Engineer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="Cybersecurity Student">Cybersecurity Student</option>
                <option value="Researcher">Researcher</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan resize-none"
              placeholder="Brief professional background or specialization..."
            />
          </div>

          {/* Skills Management */}
          <div className="p-4 bg-obsidian-900/50 rounded-xl border border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-3">Structured Technical Skills</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map(skill => (
                <span
                  key={skill.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs border border-slate-700"
                >
                  <strong className="text-accent-cyan">{skill.name}</strong> ({skill.level})
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.name)}
                    className="hover:text-red-400 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(e);
                  }
                }}
                placeholder="Skill name (e.g. Python) — press Enter to add"
                className="flex-1 bg-obsidian-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
              />
              <select
                value={newSkillLevel}
                onChange={e => setNewSkillLevel(e.target.value as SkillLevel)}
                className="bg-obsidian-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Proficient">Proficient</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="btn-secondary !px-3 !py-1.5 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Experience & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Experience Level</label>
              <select
                value={experience}
                onChange={e => setExperience(e.target.value as any)}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Weekly Availability (Hours/Week)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={availabilityHoursPerWeek}
                onChange={e => setAvailability(Number(e.target.value))}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Interests (comma separated)</label>
              <input
                type="text"
                value={interestsText}
                onChange={e => setInterestsText(e.target.value)}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
                placeholder="AI, Mobile, Gaming"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Preferred Project Types (comma separated)</label>
              <input
                type="text"
                value={preferredProjectTypesText}
                onChange={e => setPrefProjectTypesText(e.target.value)}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
                placeholder="Hackathon, Startup, Competition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Preferred Roles (comma separated)</label>
              <input
                type="text"
                value={preferredRolesText}
                onChange={e => setPrefRolesText(e.target.value)}
                className="w-full bg-obsidian-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan"
                placeholder="Frontend Developer, Full Stack Developer"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 py-3 text-sm font-bold"
            >
              {saving ? 'Saving Profile...' : 'Save Profile & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

