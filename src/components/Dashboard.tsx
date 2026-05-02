import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Zap, Target, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateDailyBriefing } from '../services/gemini';

const Dashboard: React.FC<{ tasks: any[]; docs: any[] }> = ({ tasks, docs }) => {
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      try {
        const text = await generateDailyBriefing(tasks, docs);
        setBriefing(text);
      } catch (err) {
        setBriefing("Good morning! Ready to tackle the day? (Briefing generation failed)");
      } finally {
        setLoading(false);
      }
    };
    fetchBriefing();
  }, [tasks.length, docs.length]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, Newton.</h1>
        <p className="text-[#706E6B] mt-2">Here is what your team achieved since yesterday.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Synthesis */}
        <div className="lg:col-span-2 bg-[#1A1A1A] text-white rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
            <Zap className="w-32 h-32 text-purple-400" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A09E9B]">Predictive Briefing</span>
            </div>
            
            <div className="flex-1 text-xl leading-relaxed prose prose-invert max-w-none">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="markdown-body">
                   <ReactMarkdown>{briefing}</ReactMarkdown>
                </div>
              )}
            </div>

            <button className="mt-8 flex items-center gap-2 text-sm font-semibold hover:gap-4 transition-all w-fit">
              View Detailed Timeline <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Stats */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E1DA] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#A09E9B]">Active Focus</span>
            </div>
            <div className="space-y-4">
              {tasks.filter(t => t.priority === 'high').slice(0, 3).map((task, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F9F8F6] transition-colors cursor-pointer border border-transparent hover:border-[#E5E1DA]">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{task.title}</p>
                </div>
              ))}
              {tasks.filter(t => t.priority === 'high').length === 0 && (
                <p className="text-sm text-[#A09E9B] italic">No high priority tasks currently.</p>
              )}
            </div>
          </div>

          <div className="bg-[#FDF1F1] border border-[#F5DCDC] rounded-3xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">Priority Risks</span>
            </div>
            <p className="text-sm text-red-800 font-medium">Alice is currently over-capacity. Consider reassigning 'Feature X' to Bob.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
