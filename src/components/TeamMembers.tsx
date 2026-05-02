import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Shield, User as UserIcon, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamService } from '../services/teamService';
import { useAuth } from '../hooks/useFirebase';

interface TeamMembersProps {
  teamId: string;
}

export default function TeamMembers({ teamId }: TeamMembersProps) {
  const { sendMagicLink } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [teamId]);

  const loadMembers = async () => {
    try {
      const data = await TeamService.getTeamMembers(teamId);
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setIsInviting(true);
    try {
      await TeamService.inviteMember(teamId, inviteEmail);
      await sendMagicLink(inviteEmail);
      setInvitationSent(true);
      setInviteEmail('');
      setTimeout(() => setInvitationSent(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-6xl font-black tracking-tighter text-[#0F172A]">TEAM ROSTER<span className="text-[#4F46E5]">.</span></h1>
        <p className="text-[#64748B] font-bold uppercase tracking-widest text-xs mt-4">Manage workspace access and invitations</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Invite Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#0F172A] rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserPlus className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Invite Member</h3>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#4F46E5] transition-all"
                    />
                  </div>
                </div>
                <button 
                  disabled={isInviting}
                  className="w-full bg-[#4F46E5] text-white py-4 rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-all shadow-xl shadow-blue-900/40"
                >
                  {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Magic Link <ArrowRight className="w-3 h-3" /></>}
                </button>
              </form>

              <AnimatePresence>
                {invitationSent && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Invitation Sent</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F9FAFB]">
              <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Active Members</h3>
              <span className="bg-[#4F46E5]/10 text-[#4F46E5] px-2 py-1 rounded text-[10px] font-black">{members.length} Total</span>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {members.map((member) => (
                <div key={member.uid} className="px-8 py-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#F1F5F9] rounded-full border border-[#E2E8F0] flex items-center justify-center overflow-hidden">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-[#64748B]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-tight group-hover:text-[#4F46E5] transition-colors">{member.displayName}</h4>
                      <p className="text-xs font-medium text-[#64748B]">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] rounded-full">
                      <Shield className="w-3 h-3 text-[#4F46E5]" />
                      <span className="text-[10px] font-black uppercase text-[#64748B] tracking-widest">Member</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
