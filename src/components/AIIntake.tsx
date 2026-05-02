import React, { useState } from 'react';
import { Sparkles, Loader2, Send, Calendar, Flag, User, Tag, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { analyzeIntake } from '../services/gemini';

interface AIIntakeProps {
  onSave: (task: any) => void;
  onClose: () => void;
}

const AIIntake: React.FC<AIIntakeProps> = ({ onSave, onClose }) => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeIntake(input);
      setExtractedData(result);
    } catch (error) {
      console.error('Intake analysis failed', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-[#706E6B]">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-semibold uppercase tracking-wider">Intelligent Task Intake</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste meeting notes, emails, or just describe what needs to be done..."
          className="w-full min-h-[120px] bg-transparent border-none focus:ring-0 text-lg placeholder-[#A09E9B] resize-none"
        />
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#F3F0EC]">
          <div className="flex gap-2">
            <button className="p-2 hover:bg-[#F3F0EC] rounded-lg text-[#706E6B]">
              <span className="text-xl">🎙️</span>
            </button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !input.trim()}
            className="bg-[#1A1A1A] text-white px-6 py-2 rounded-full font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Analyze Input
          </button>
        </div>
      </div>

      {extractedData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E5E1DA] rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-sm font-semibold text-[#A09E9B] uppercase tracking-wider mb-4">AI Extraction Preview</h3>
          <div className="space-y-4">
            <input 
              value={extractedData.title}
              onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
              className="text-2xl font-bold w-full border-none focus:ring-0 p-0"
            />
            <p className="text-[#706E6B]">{extractedData.description}</p>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F3F0EC]">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[#A09E9B]" />
                <span className="bg-[#F3F0EC] px-2 py-1 rounded">{extractedData.dueDate || 'No date suggested'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Flag className="w-4 h-4 text-[#A09E9B]" />
                <span className={`px-2 py-1 rounded uppercase font-bold text-[10px] ${
                  extractedData.priority === 'high' ? 'bg-red-100 text-red-600' : 
                  extractedData.priority === 'medium' ? 'bg-blue-100 text-blue-600' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  {extractedData.priority}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {extractedData.tags?.map((tag: string) => (
                <span key={tag} className="flex items-center gap-1 bg-[#F3F0EC] text-[#706E6B] px-2 py-1 rounded-full text-xs">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setExtractedData(null)}
                className="px-4 py-2 text-sm font-medium text-[#706E6B] hover:text-[#1A1A1A]"
              >
                Discard
              </button>
              <button 
                onClick={() => onSave(extractedData)}
                className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIIntake;
