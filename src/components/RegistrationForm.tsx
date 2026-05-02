import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Sparkles, Building2, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface RegistrationFormProps {
  onMagicLinkRequest: (email: string, details: any) => Promise<void>;
  onGoogleLogin: () => void;
}

export default function RegistrationForm({ onMagicLinkRequest, onGoogleLogin }: RegistrationFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onMagicLinkRequest(email, { name, company });
      setIsSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-3xl shadow-2xl border border-[#E2E8F0]"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-[#0F172A] mb-4 uppercase">CHECK YOUR INBOX</h2>
          <p className="text-[#64748B] text-sm font-medium leading-relaxed mb-8">
            A secure magic link has been sent to <span className="text-[#0F172A] font-bold">{email}</span>. Click the link to instantly unlock your workspace.
          </p>
          <div className="p-4 bg-[#F1F5F9] rounded-xl text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
            No password required. No registration friction.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Branding Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <Sparkles className="w-96 h-96 text-white" />
        </div>
        <div className="relative z-10">
          <div className="text-3xl font-black text-white tracking-tighter mb-2">NEWTON<span className="text-[#4F46E5]">.</span></div>
          <p className="text-[#64748B] font-bold uppercase tracking-[0.3em] text-xs">Aesthetics & Intelligence</p>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none mb-8">
            REDEFINING <br /> THE MODERN <br /> WORKSPACE.
          </h1>
          <p className="text-[#64748B] max-w-md text-lg leading-relaxed">
            The intelligent agent system for high-performing teams. Zero friction configuration. Professional grade aesthetics.
          </p>
        </div>

        <div className="relative z-10 flex gap-12">
            <div>
                <p className="text-white font-black text-2xl tracking-tighter">99.9%</p>
                <p className="text-[#64748B] text-[10px] font-black uppercase tracking-widest">System Uptime</p>
            </div>
            <div>
                <p className="text-white font-black text-2xl tracking-tighter">0-SEC</p>
                <p className="text-[#64748B] text-[10px] font-black uppercase tracking-widest">Setup Latency</p>
            </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 bg-white">
        <div className="max-w-md w-full">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter mb-2 uppercase">Welcome to Newton</h2>
            <p className="text-[#64748B] font-medium">Create your collaborative workspace in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Cooper"
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Building2 className="w-3 h-3" /> Company / Workspace Name
              </label>
              <input 
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Newton Research Lab"
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Mail className="w-3 h-3" /> Professional Email
              </label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all font-medium"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0F172A] text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-blue-900/20"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Magic Link <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-12 pt-12 border-t border-[#F1F5F9]">
            <p className="text-center text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-6">Or continue with</p>
            <button 
              onClick={onGoogleLogin}
              className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-[#F9FAFB] transition-all"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Sign in with Google
            </button>
          </div>

          <p className="mt-12 text-center text-[10px] font-medium text-[#64748B] leading-relaxed">
            By signing up, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Protocol</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
