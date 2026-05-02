import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { FileDown, Sparkles, Loader2, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateReport } from '../services/gemini';

const Reports: React.FC<{ data: any }> = ({ data }) => {
  const [query, setQuery] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const result = await generateReport(query, data);
      setReport(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!report?.chartSuggestions) return null;
    const { type, data: chartData } = report.chartSuggestions;

    const COLORS = ['#1A1A1A', '#A09E9B', '#F3F0EC', '#E5E1DA'];

    return (
      <div className="h-64 mt-8 bg-[#F9F8F6] rounded-2xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'Pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#0F172A]">Intelligence Reports</h1>
          <p className="text-[#475569] mt-1 font-bold uppercase text-[10px] tracking-widest">Instant, deep-dive analysis of your team's progress.</p>
        </div>
        <button 
          aria-label="Export report to PDF"
          className="flex items-center gap-2 border border-[#E5E1DA] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F3F0EC] transition-colors focus:ring-2 focus:ring-[#1A1A1A] outline-none"
        >
          <FileDown className="w-4 h-4" aria-hidden="true" />
          Export to PDF
        </button>
      </header>

      <div className="bg-white border border-[#E5E1DA] rounded-3xl p-6 shadow-sm">
        <div className="relative">
          <label htmlFor="report-query" className="sr-only">Ask for a customized report</label>
          <input 
            id="report-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'Create a weekly progress report for stakeholders'..." 
            className="w-full bg-[#F3F0EC] border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-1 focus:ring-[#1A1A1A] text-[#0F172A] placeholder-[#475569]"
          />
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" aria-hidden="true" />
          <button 
            disabled={loading}
            onClick={handleGenerate}
            aria-label="Generate AI Report"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#1A1A1A] text-white rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-[#E5E1DA] rounded-3xl p-8 shadow-md">
            <h2 className="text-xl font-bold mb-6">Generated Analysis</h2>
            <div className="markdown-body prose prose-slate prose-sm max-w-none">
              <ReactMarkdown>{report.summary}</ReactMarkdown>
            </div>
            
            <div className="mt-8 pt-8 border-t border-[#F3F0EC]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#A09E9B] mb-4">Key Achievements</h3>
              <ul className="space-y-2">
                {report.achievements?.map((a: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-[#1A1A1A]">
                    <span className="text-green-500 font-bold">✓</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white border border-[#E5E1DA] rounded-3xl p-8 shadow-md">
            <h2 className="text-xl font-bold mb-2">Data Visualization</h2>
            <p className="text-xs text-[#A09E9B] uppercase font-semibold">Suggested perspective based on context</p>
            {renderChart()}

            <div className="mt-8 pt-8 border-t border-[#F3F0EC]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#A09E9B] mb-4">Identified Risks</h3>
              <ul className="space-y-2">
                {report.risks?.map((r: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-[#1A1A1A]">
                    <span className="text-red-500 font-bold">!</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
