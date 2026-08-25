import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import type { Invitation } from '../types';
import { Mail, CheckCircle2, XCircle } from 'lucide-react';

export const InvitationsPage: React.FC = () => {
  const { user } = useAuth();

  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    dbService.getInvitationsForUser(user.userId).then(invites => {
      setReceivedInvitations(invites);
      setLoading(false);
    });
  }, [user]);

  const handleRespond = async (invitationId: string, status: 'accepted' | 'declined') => {
    await dbService.updateInvitationStatus(invitationId, status);
    setReceivedInvitations(prev =>
      prev.map(i => i.invitationId === invitationId ? { ...i, status } : i)
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Team Invitations</h2>
            <p className="text-xs text-slate-400">Manage incoming and sent project invitations.</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Loading invitations...</div>
        ) : receivedInvitations.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Mail className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm">No project invitations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {receivedInvitations.map(inv => (
              <div key={inv.invitationId} className="p-4 bg-obsidian-900 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Team Invitation</span>
                  <p className="text-sm font-bold text-white mt-0.5">{inv.message || "You have been invited to join a project team."}</p>
                  <span className="text-[10px] text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  {inv.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleRespond(inv.invitationId, 'accepted')}
                        className="btn-primary !px-3 !py-1.5 text-xs font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleRespond(inv.invitationId, 'declined')}
                        className="btn-secondary !px-3 !py-1.5 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full capitalize font-semibold ${
                      inv.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {inv.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
