import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, Send, Calendar, User, Tag, Plus, FileUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeIntake } from '../services/gemini';

interface AIIntakeProps {
  onSave: (tasks: any[]) => void;
  onClose: () => void;
}

const AIIntake: React.FC<AIIntakeProps> = ({ onSave, onClose }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const results = await analyzeIntake(input);
      setExtractedTasks(results.map((r: any) => ({
        ...r,
        tags: r.tags || [],
        assignee: r.assignee || ''
      })));
    } catch (err: any) {
      console.error('Intake analysis failed', err);
      setError(err.message || 'Failed to analyze transcript. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
    };
    reader.readAsText(file);
  };

  const updateTask = (index: number, updates: any) => {
    const newTasks = [...extractedTasks];
    newTasks[index] = { ...newTasks[index], ...updates };
    setExtractedTasks(newTasks);
  };

  const removeTask = (index: number) => {
    setExtractedTasks(extractedTasks.filter((_, i) => i !== index));
  };

  const addTag = (index: number, tag: string) => {
    const task = extractedTasks[index];
    if (tag && !task.tags.includes(tag)) {
      updateTask(index, { tags: [...task.tags, tag] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#0F172A] rounded-xl p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Sparkles className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8]">Intelligent Intake Agent</span>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload Transcript"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
            >
              <FileUp className="w-4 h-4" aria-hidden="true" />
              Upload Transcript
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              id="transcript-upload-hidden"
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".txt,.md,.vtt"
              aria-label="Hidden file input"
            />
          </div>
          <label htmlFor="ai-intake-textarea" className="sr-only">Input meeting transcripts</label>
          <textarea
            id="ai-intake-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste meeting transcripts, emails, or thoughts..."
            className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-lg p-6 text-white text-lg placeholder-white/20 focus:ring-1 focus:ring-[#4F46E5] focus:border-[#4F46E5] transition-all resize-none mb-6"
          />
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold uppercase tracking-widest">
                Error: {error}
            </div>
          )}
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {isAnalyzing ? 'Gemini is processing transcript...' : 'Auto-extract tasks & updates'}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !input.trim()}
              className="bg-[#4F46E5] text-white px-8 py-3 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 disabled:opacity-50 hover:bg-[#4338CA] transition-colors shadow-xl shadow-blue-900/40"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Run Intelligent Extraction
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {extractedTasks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em]">Extraction Preview ({extractedTasks.length} tasks identified)</h3>
              <div className="flex gap-4">
                <button 
                  onClick={() => setExtractedTasks([])}
                  aria-label="Discard all extracted tasks"
                  className="text-[10px] font-black uppercase text-[#EF4444] hover:underline"
                >
                  Discard All
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {extractedTasks.map((task, idx) => (
                <motion.div 
                  key={idx}
                  layout
                  className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xl relative group"
                >
                  <button 
                    onClick={() => removeTask(idx)}
                    aria-label={`Remove task draft: ${task.title}`}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-[#475569] hover:text-red-500 transition-all font-bold text-xs uppercase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`title-${idx}`} className="text-[9px] font-black text-[#475569] uppercase tracking-widest block mb-1">Title</label>
                        <input 
                          id={`title-${idx}`}
                          value={task.title}
                          onChange={(e) => updateTask(idx, { title: e.target.value })}
                          className="text-xl font-black tracking-tight w-full border-none focus:ring-0 p-0 text-[#0F172A]"
                        />
                      </div>
                      <div>
                        <label htmlFor={`desc-${idx}`} className="text-[9px] font-black text-[#475569] uppercase tracking-widest block mb-1">Description</label>
                        <textarea 
                          id={`desc-${idx}`}
                          value={task.description}
                          onChange={(e) => updateTask(idx, { description: e.target.value })}
                          className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#0F172A] focus:ring-1 focus:ring-[#4F46E5] resize-none"
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`assignee-${idx}`} className="text-[9px] font-black text-[#475569] uppercase tracking-widest block mb-1">Assignee</label>
                        <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E2E8F0] rounded-lg px-3 py-2">
                          <User className="w-4 h-4 text-[#475569]" aria-hidden="true" />
                          <input 
                            id={`assignee-${idx}`}
                            value={task.assignee}
                            onChange={(e) => updateTask(idx, { assignee: e.target.value })}
                            className="bg-transparent border-none focus:ring-0 p-0 text-[10px] font-bold w-full text-[#0F172A]"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor={`priority-${idx}`} className="text-[9px] font-black text-[#475569] uppercase tracking-widest block mb-1">Priority</label>
                        <select 
                          id={`priority-${idx}`}
                          value={task.priority}
                          onChange={(e) => updateTask(idx, { priority: e.target.value })}
                          className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-lg px-3 py-2 text-[10px] font-bold text-[#0F172A]"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-black text-[#475569] uppercase tracking-widest block mb-1">Labels</label>
                        <div className="flex gap-2 flex-wrap">
                          {task.tags.map((tag: string) => (
                            <span key={tag} className="bg-[#F1F5F9] px-2 py-1 rounded text-[9px] font-black uppercase text-[#475569]">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center pt-8">
              <button 
                onClick={() => onSave(extractedTasks)}
                className="bg-[#0F172A] text-white px-12 py-4 rounded-xl text-xs font-black uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-blue-900/20"
              >
                Sync {extractedTasks.length} Tasks to Backlog
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIIntake;
