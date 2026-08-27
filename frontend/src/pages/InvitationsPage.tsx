import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import type { Invitation, User, Project } from '../types';
import { Mail, CheckCircle2, XCircle, Send, Inbox, Clock, UserCheck } from 'lucide-react';

export const InvitationsPage: React.FC = () => {
  const { user } = useAuth();

  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [allInvitations, setAllInvitations] = useState<Invitation[]>([]);
  const [userCache, setUserCache] = useState<{ [userId: string]: User }>({});
  const [projectCache, setProjectCache] = useState<{ [projectId: string]: Project }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const invites = await dbService.getInvitationsForUser(user.userId);
        setAllInvitations(invites);

        // Fetch users & projects for label display
        const allUsers = await dbService.getAllUsers();
        const userMap: { [id: string]: User } = {};
        allUsers.forEach(u => { userMap[u.userId] = u; });
        setUserCache(userMap);

        const projects = await dbService.getUserProjects(user.userId);
        const projMap: { [id: string]: Project } = {};
        projects.forEach(p => { projMap[p.projectId] = p; });
        setProjectCache(projMap);
      } catch (err) {
        console.error("Error loading invitations:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleRespond = async (invitationId: string, status: 'accepted' | 'declined') => {
    await dbService.updateInvitationStatus(invitationId, status);
    setAllInvitations(prev =>
      prev.map(i => i.invitationId === invitationId ? { ...i, status } : i)
    );
  };

  const receivedInvites = allInvitations.filter(i => i.recipientId === user?.userId);
  const sentInvites = allInvitations.filter(i => i.senderId === user?.userId);

  const activeList = tab === 'received' ? receivedInvites : sentInvites;

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">Team Invitations</h2>
              <p className="text-xs text-slate-400">Track and respond to project collaboration requests.</p>
            </div>
          </div>

          {/* Received / Sent Tab Switcher */}
          <div className="flex bg-obsidian-950 p-1 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
            <button
              onClick={() => setTab('received')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                tab === 'received' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Received ({receivedInvites.length})</span>
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                tab === 'sent' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sent Out ({sentInvites.length})</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span>Loading invitations...</span>
          </div>
        ) : activeList.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-3">
            {tab === 'received' ? (
              <>
                <Inbox className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No Incoming Invitations</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When project leads invite you to join their team, their requests will appear here.
                </p>
              </>
            ) : (
              <>
                <Send className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No Outgoing Invitations Sent</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You can send team invitations to candidates directly from the Interactive Team Builder.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeList.map(inv => {
              const recipientUser = userCache[inv.recipientId];
              const targetProject = projectCache[inv.projectId];
              const isReceived = inv.recipientId === user?.userId;

              return (
                <div
                  key={inv.invitationId}
                  className="p-5 bg-obsidian-900/90 rounded-2xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isReceived ? 'bg-indigo-500/20 text-indigo-300' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {isReceived ? 'Received Invitation' : 'Sent Invitation'}
                      </span>
                      {recipientUser && !isReceived && (
                        <span className="text-xs text-slate-400">
                          To: <strong className="text-white">{recipientUser.name}</strong> ({recipientUser.primaryRole})
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-100 leading-relaxed">
                      {inv.message || "Invitation to collaborate on project team."}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(inv.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}{' '}
                          at{' '}
                          {new Date(inv.createdAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </span>
                      {targetProject && (
                        <span>Project: <strong className="text-slate-400">{targetProject.name}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Badges */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {isReceived && inv.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespond(inv.invitationId, 'accepted')}
                          className="btn-primary !px-3.5 !py-2 text-xs font-bold flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespond(inv.invitationId, 'declined')}
                          className="btn-secondary !px-3.5 !py-2 text-xs text-red-400 hover:text-red-300 border-red-500/30 flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 ${
                          inv.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : inv.status === 'declined'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {inv.status === 'accepted' && <UserCheck className="w-3.5 h-3.5" />}
                          {inv.status === 'declined' && <XCircle className="w-3.5 h-3.5" />}
                          {inv.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                          <span>{inv.status === 'pending' ? 'Pending Response' : inv.status}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

