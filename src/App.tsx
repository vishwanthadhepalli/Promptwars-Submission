/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import AIIntake from './components/AIIntake';
import { useAuth } from './hooks/useFirebase';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { Loader2, Plus, Sparkles } from 'lucide-react';

export default function App() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQuickIntakeOpen, setIsQuickIntakeOpen] = useState(false);

  // Mock data for demo if firestore is empty
  const [mockTasks] = useState([
    { title: 'Redesign Brand Identity', priority: 'high', status: 'in-progress' },
    { title: 'Implement AI Core', priority: 'high', status: 'todo' },
    { title: 'Quarterly Finance Review', priority: 'medium', status: 'done' }
  ]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFCFB]">
        <Loader2 className="w-12 h-12 text-[#1A1A1A] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFCFB] p-4 font-sans leading-relaxed">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-20 h-20 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mx-auto shadow-xl rotate-3">
             <span className="text-white font-bold text-4xl">N</span>
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-[#1A1A1A]">Newton</h1>
            <p className="mt-4 text-xl text-[#706E6B] font-medium italic">Precise. Proactive. Intelligent.</p>
          </div>
          <p className="text-[#A09E9B] leading-relaxed">
            A team workspace where humans and AI orchestrate the future of tasks.
          </p>
          <button 
            onClick={loginWithGoogle}
            className="w-full bg-[#1A1A1A] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale invert" alt="Google" />
            Continue with Team Account
          </button>
        </div>
      </div>
    );
  }

  const handleCreateTask = async (taskData: any) => {
    try {
      const teamId = 'demo-team'; // In real app, get from user profile
      const taskRef = doc(collection(db, 'teams', teamId, 'tasks'));
      await setDoc(taskRef, {
        ...taskData,
        creatorId: user.uid,
        status: 'todo',
        createdAt: serverTimestamp()
      });
      setIsQuickIntakeOpen(false);
      setActiveTab('tasks');
    } catch (err) {
      console.error('Failed to save task', err);
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={logout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'dashboard' && <Dashboard tasks={mockTasks} docs={[]} />}
      {activeTab === 'reports' && <Reports data={{ tasks: mockTasks }} />}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
           <header className="flex justify-between items-center">
            <h2 className="text-3xl font-bold tracking-tight">Project Backlog</h2>
            <button 
              onClick={() => setIsQuickIntakeOpen(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> AI Intake
            </button>
          </header>
          {isQuickIntakeOpen ? (
             <AIIntake onSave={handleCreateTask} onClose={() => setIsQuickIntakeOpen(false)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTasks.map((t, i) => (
                <div key={i} className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`text-[10px] uppercase font-black tracking-widest mb-3 ${
                    t.priority === 'high' ? 'text-red-500' : 'text-blue-500'
                  }`}>{t.priority} priority</div>
                  <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#F3F0EC]">
                     <span className="text-xs font-semibold text-[#706E6B] bg-[#F3F0EC] px-2 py-1 rounded">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {activeTab === 'workspace' && (
        <div className="h-[80vh] bg-white border border-[#E5E1DA] rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Newton Collaborative Engine</h2>
          <p className="text-[#706E6B] max-w-md">Real-time collaborative editing with AI @mentions is being optimized. Check back in Q3.</p>
        </div>
      )}
    </Layout>
  );
}
