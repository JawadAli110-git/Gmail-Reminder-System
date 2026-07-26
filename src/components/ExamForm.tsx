import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Calendar, Clock, BookOpen, GraduationCap, UserPlus, Trash2, Sparkles, Mail } from "lucide-react";
import type { SchoolClass, ExamEntry, Invigilator } from "../types";

interface ExamFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ExamEntry>) => Promise<void>;
  isSubmitting: boolean;
  examToEdit?: ExamEntry | null;
}

export function ExamForm({ isOpen, onClose, onSubmit, isSubmitting, examToEdit }: ExamFormProps) {
  const [formData, setFormData] = useState<Partial<ExamEntry>>({
    date: new Date().toISOString().split('T')[0],
    invigilators: []
  });

  React.useEffect(() => {
    if (isOpen) {
      if (examToEdit) {
        setFormData(examToEdit);
      } else {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          invigilators: []
        });
      }
      setNewInvigilator({ name: "", email: "" });
    }
  }, [isOpen, examToEdit]);

  const [newInvigilator, setNewInvigilator] = useState({ name: "", email: "" });

  if (!isOpen) return null;

  const handleAddInvigilator = () => {
    if (newInvigilator.name && newInvigilator.email) {
      setFormData(prev => ({
        ...prev,
        invigilators: [...(prev.invigilators || []), { ...newInvigilator }]
      }));
      setNewInvigilator({ name: "", email: "" });
    }
  };

  const handleRemoveInvigilator = (index: number) => {
    setFormData(prev => ({
      ...prev,
      invigilators: prev.invigilators?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invigilators || formData.invigilators.length === 0) {
      alert("Please add at least one invigilator.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-slate-50 dark:bg-black border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {examToEdit ? "Update Paper" : "Schedule Exam"}
            </h2>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <X size={18} className="text-slate-900 dark:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Subject / Paper</label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  required type="text"
                  value={formData.subject || ""} onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                  placeholder="e.g. Mid-term Mathematics"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    required type="date"
                    value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">Start Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      required type="time"
                      value={formData.time || ""} onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">End Time</label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="time"
                      value={formData.endTime || ""} onChange={e => setFormData({...formData, endTime: e.target.value})}
                      className="w-full pl-11 pr-4 py-2.5 md:py-3 rounded-2xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-black/5 dark:border-white/5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Invigilators</label>
              
              <div className="space-y-2 mb-3">
                {formData.invigilators?.map((inv, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black/5 dark:bg-white/5 px-3 py-2 rounded-xl">
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-slate-900 dark:text-white">{inv.name}</span>
                      <span className="text-slate-500 text-xs">{inv.email}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveInvigilator(idx)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!formData.invigilators || formData.invigilators.length === 0) && (
                  <p className="text-xs text-slate-500 ml-1">No invigilators added yet.</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="text" placeholder="Name"
                    value={newInvigilator.name} onChange={e => setNewInvigilator({...newInvigilator, name: e.target.value})}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInvigilator(); } }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                  />
                  <input 
                    type="email" placeholder="Email"
                    value={newInvigilator.email} onChange={e => setNewInvigilator({...newInvigilator, email: e.target.value})}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddInvigilator(); } }}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddInvigilator}
                  disabled={!newInvigilator.name || !newInvigilator.email}
                  className="p-2 w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
                >
                  <UserPlus size={18} />
                  <span className="text-sm font-medium">Add Invigilator</span>
                </button>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 md:py-3 rounded-2xl font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting && <Sparkles size={16} className="animate-pulse" />}
                {examToEdit ? "Update Paper" : "Schedule Paper"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
