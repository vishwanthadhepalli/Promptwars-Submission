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
    <div className="space-y-10 max-w-6xl mx-auto">
      <header>
        <h1 className="text-6xl font-black tracking-tighter text-[#0F172A]">WORKSPACE OVERVIEW<span className="text-[#4F46E5]">.</span></h1>
        <p className="text-[#475569] font-bold uppercase tracking-widest text-xs mt-4">Precision insights from Gemini Agent</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Synthesis */}
        <div className="lg:col-span-2 bg-[#0F172A] text-white rounded-xl p-10 relative overflow-hidden group shadow-2xl shadow-blue-900/10">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-48 h-48 text-white" aria-hidden="true" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-[#4F46E5]" aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#94A3B8]">DAILY SYNTHESIZER</span>
            </div>
            
            <div className="flex-1 text-lg font-medium leading-relaxed prose prose-invert max-w-none">
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

            <button className="mt-10 flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:gap-6 transition-all w-fit bg-[#4F46E5] px-6 py-3 rounded-lg shadow-lg">
              Open Timeline <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Stats */}
        <div className="space-y-8">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#475569]">CRITICAL FOCUS</span>
            </div>
            <div className="space-y-6">
              {tasks.filter(t => t.priority === 'high').slice(0, 3).map((task, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-black uppercase tracking-tight group-hover:text-[#4F46E5] transition-colors text-[#0F172A]">{task.title}</p>
                    <span className="text-[10px] font-black text-[#EF4444]">{task.risk || '0%'}</span>
                  </div>
                  <div className="h-1 bg-[#F1F5F9] w-full rounded-full overflow-hidden" role="progressbar" aria-valuenow={parseInt(task.risk || '0')} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-[#4F46E5] rounded-full transition-all duration-1000" style={{ width: task.risk || '10%' }} />
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.priority === 'high').length === 0 && (
                <p className="text-sm text-[#475569] italic">All critical path items are clear.</p>
              )}
            </div>
          </div>

          <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-8">
             <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EF4444]">RISK ORACLE</span>
            </div>
            <p className="text-[28px] font-black tracking-tighter text-[#EF4444] mb-2 leading-none">WORKLOAD OVERFLOW</p>
            <p className="text-xs text-[#991B1B] font-bold leading-relaxed">
              Predictive engine detected a 72% probability of delay in Project Orion due to resource contention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
