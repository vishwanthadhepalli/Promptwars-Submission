/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import AIIntake from './components/AIIntake';
import RegistrationForm from './components/RegistrationForm';
import TeamMembers from './components/TeamMembers';
import TaskDetailModal from './components/TaskDetailModal';
import { useAuth } from './hooks/useFirebase';
import { TaskService, Task } from './services/taskService';
import { TeamService } from './services/teamService';
import { Loader2, Plus, Sparkles, Database, User } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const { user, loading, loginWithGoogle, sendMagicLink, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuickIntakeOpen, setIsQuickIntakeOpen] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Initialize Workspace/User Data
  useEffect(() => {
    const initWorkspace = async () => {
      if (user) {
        // Sync user to firestore
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        const registrationData = window.localStorage.getItem('pendingRegistrationData');
        const parsedData = registrationData ? JSON.parse(registrationData) : null;

        if (!userSnap.exists()) {
          // If first time login, create user and their team
          await setDoc(userRef, {
            displayName: parsedData?.name || user.displayName || 'Guest',
            email: user.email,
            createdAt: serverTimestamp(),
            company: parsedData?.company || 'My Workspace'
          });

          const newTeamId = await TeamService.getOrCreateDefaultTeam(user.uid, user.email || undefined, parsedData?.company);
          setTeamId(newTeamId);
          window.localStorage.removeItem('pendingRegistrationData');
        } else {
          const tId = await TeamService.getOrCreateDefaultTeam(user.uid, user.email || undefined);
          setTeamId(tId);
        }
      }
    };

    initWorkspace();
  }, [user]);

  // Subscribe to Tasks
  useEffect(() => {
    if (teamId && user) {
      const unsub = TaskService.subscribeToTasks(teamId, user.uid, (fetchedTasks) => {
        setTasks(fetchedTasks);
      });
      return () => unsub();
    }
  }, [teamId, user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="w-12 h-12 text-[#4F46E5] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <RegistrationForm 
        onGoogleLogin={loginWithGoogle} 
        onMagicLinkRequest={async (email, details) => {
          window.localStorage.setItem('pendingRegistrationData', JSON.stringify(details));
          await sendMagicLink(email);
        }} 
      />
    );
  }

  const handleCreateTasks = async (tasksData: any[]) => {
    if (!teamId) return;
    try {
      for (const task of tasksData) {
        await TaskService.createTask(teamId, {
          ...task,
          creatorId: user.uid
        });
      }
      setIsQuickIntakeOpen(false);
      setActiveTab('tasks');
    } catch (err) {
      console.error('Failed to save tasks', err);
    }
  };

  const handleSeedData = async () => {
    if (!teamId) return;
    setIsSeeding(true);
    try {
      await TeamService.seedSampleData(teamId, user.uid);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={logout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && <Dashboard tasks={tasks} docs={[]} />}
      {activeTab === 'reports' && <Reports data={{ tasks }} />}
      {activeTab === 'team' && teamId && <TeamMembers teamId={teamId} />}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
           <header className="flex justify-between items-center bg-[#0F172A] p-8 rounded-xl text-white">
            <div>
              <h2 className="text-3xl font-black tracking-tighter">PROJECT BACKLOG<span className="text-[#4F46E5]">.</span></h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#64748B] mt-1">Managed by Intelligent Agent v2.4</p>
            </div>
            <div className="flex gap-4">
              {tasks.length === 0 && (
                <button 
                  onClick={handleSeedData}
                  disabled={isSeeding}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-white/10"
                >
                  {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  Seed Sample Data
                </button>
              )}
              <button 
                onClick={() => setIsQuickIntakeOpen(true)}
                className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-900/40"
              >
                <Sparkles className="w-4 h-4" /> AI Intake
              </button>
            </div>
          </header>

          {isQuickIntakeOpen ? (
             <AIIntake onSave={handleCreateTasks} onClose={() => setIsQuickIntakeOpen(false)} />
          ) : (
            <>
              {tasks.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#E2E8F0] rounded-xl text-[#64748B]">
                  <Database className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">No active tasks found in the cloud</p>
                  <button onClick={handleSeedData} className="mt-4 text-[#4F46E5] font-black text-[10px] uppercase underline">Quick Start with Sample Data</button>
                </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map((t, i) => (
                    <div 
                      key={t.id || i} 
                      onClick={() => setSelectedTask(t)}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                          t.priority === 'high' ? 'bg-[#FEE2E2] text-[#EF4444]' : 
                          t.priority === 'medium' ? 'bg-[#FEF3C7] text-[#D97706]' : 
                          'bg-[#F1F5F9] text-[#64748B]'
                        }`}>{t.priority}</div>
                        {t.risk && parseInt(t.risk) > 20 && (
                          <div className="flex items-center gap-1 text-[10px] font-extrabold text-[#EF4444] uppercase">
                            Risk: {t.risk}
                          </div>
                        )}
                      </div>
                      <h3 className="font-extrabold text-[#0F172A] text-lg mb-2 leading-tight group-hover:text-[#4F46E5] transition-colors">{t.title}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-full bg-[#E2E8F0] border border-white" />
                        <span className="text-xs font-semibold text-[#64748B]">{t.assignee || 'Unassigned'}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#F1F5F9]">
                        <span className="text-[10px] font-black tracking-widest uppercase text-[#64748B]">{t.status}</span>
                        <div className="flex gap-1">
                            {t.tags?.map(tag => (
                              <span key={tag} className="text-[9px] font-bold text-[#64748B] bg-[#F1F5F9] px-1.5 rounded uppercase">{tag}</span>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {activeTab === 'workspace' && (
        <div className="h-[80vh] bg-white border border-[#E2E8F0] rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-[#4F46E5]" />
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] mb-2 uppercase tracking-tight">Collaborative Workspace</h2>
          <p className="text-[#64748B] max-w-sm text-sm font-medium leading-relaxed">The real-time collaborative workspace is currently being optimized for high-concurrency workloads. Expected deployment: Q3 2026.</p>
        </div>
      )}

      {selectedTask && teamId && (
        <TaskDetailModal 
          task={selectedTask}
          teamId={teamId}
          onClose={() => setSelectedTask(null)}
          onUpdate={async (updates) => {
            if (selectedTask.id) {
              await TaskService.updateTask(teamId, selectedTask.id, updates);
            }
          }}
          onDelete={async () => {
            if (selectedTask.id) {
              await TaskService.deleteTask(teamId, selectedTask.id);
            }
          }}
        />
      )}
    </Layout>
  );
}

