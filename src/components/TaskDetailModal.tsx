import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Flag, User, Trash2, Save, 
  CheckCircle2, Clock, AlertCircle, Loader2,
  ChevronRight
} from 'lucide-react';
import { Task, TaskService } from '../services/taskService';
import { TeamService } from '../services/teamService';

interface TaskDetailModalProps {
  task: Task;
  teamId: string;
  onClose: () => void;
  onUpdate: (updatedTask: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function TaskDetailModal({ task, teamId, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadTeam = async () => {
      const members = await TeamService.getTeamMembers(teamId);
      setTeamMembers(members);
    };
    loadTeam();
  }, [teamId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(editedTask);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-[#F1F5F9] flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">
              <Clock className="w-3 h-3" /> Task Details
              <ChevronRight className="w-3 h-3" />
              <span className="text-[#4F46E5]">{task.id.slice(0, 8)}</span>
            </div>
            <input 
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="text-3xl font-black text-[#0F172A] tracking-tighter w-full bg-transparent border-none focus:ring-0 p-0"
              placeholder="Task Title"
            />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors">
            <X className="w-6 h-6 text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Main Controls */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Flag className="w-3 h-3" /> Priority
              </label>
              <select 
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Status
              </label>
              <select 
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Start Date
              </label>
              <input 
                type="date"
                value={editedTask.startDate || ''}
                onChange={(e) => setEditedTask({ ...editedTask, startDate: e.target.value })}
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Due Date
              </label>
              <input 
                type="date"
                value={editedTask.dueDate || ''}
                onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
              <User className="w-3 h-3" /> Assigned Owner
            </label>
            <div className="grid grid-cols-1 gap-2">
              <select 
                value={editedTask.assigneeId || ''}
                onChange={(e) => {
                  const member = teamMembers.find(m => m.uid === e.target.value);
                  setEditedTask({ 
                    ...editedTask, 
                    assigneeId: e.target.value,
                    assignee: member?.displayName || 'Unassigned'
                  });
                }}
                className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#4F46E5]"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(member => (
                  <option key={member.uid} value={member.uid}>{member.displayName} ({member.email})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#64748B] flex items-center gap-2">
              <AlertCircle className="w-3 h-3" /> Description
            </label>
            <textarea 
              value={editedTask.description || ''}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full bg-[#F9FAFB] border border-[#E2E8F0] rounded-xl px-4 py-3 font-medium text-sm outline-none focus:ring-2 focus:ring-[#4F46E5] min-h-[120px] resize-none"
              placeholder="Elaborate on the task objectives..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[#F1F5F9] flex justify-between items-center bg-[#F9FAFB]">
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Task
          </button>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-[#64748B] hover:bg-white transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-blue-900/20"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
