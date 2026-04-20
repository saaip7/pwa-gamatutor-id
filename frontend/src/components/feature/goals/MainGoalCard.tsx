"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Edit2, Sparkles, CheckCircle2, X, Save } from "lucide-react";
import { useGoalsStore } from "@/stores/goals";
import { toast } from "sonner";

interface MainGoalCardProps {
  goalTextPre: string;
  goalTextHighlight: string;
  totalCompleted?: number;
  totalTasks?: number;
}

function getMotivation(completed: number, total: number): string {
  if (total === 0) return "Mulai buat tugas pertamamu di board!";
  const pct = (completed / total) * 100;
  if (pct === 0) return "Setiap tugas yang selesai membawamu lebih dekat.";
  if (pct < 25) return "Sudah ada yang selesai! Teruskan langkah berikutnya.";
  if (pct < 50) return "Kamu sudah menunjukkan komitmen. Jangan berhenti!";
  if (pct < 75) return "Lebih dari setengah jalan. Tujuanmu semakin dekat!";
  if (pct < 100) return "Hampir sampai! Beberapa tugas lagi menuju targetmu.";
  return "Semua tugas selesai! Luar biasa komitmenmu.";
}

export function MainGoalCard({ goalTextPre, goalTextHighlight, totalCompleted = 0, totalTasks = 0 }: MainGoalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPre, setEditPre] = useState(goalTextPre);
  const [editHighlight, setEditHighlight] = useState(goalTextHighlight);
  const [saving, setSaving] = useState(false);

  const updateGeneralGoal = useGoalsStore((s) => s.updateGeneralGoal);
  const motivation = getMotivation(totalCompleted, totalTasks);

  const handleStartEdit = () => {
    setEditPre(goalTextPre);
    setEditHighlight(goalTextHighlight);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editPre.trim() || !editHighlight.trim()) {
      toast.error("Tujuan utama tidak boleh kosong");
      return;
    }
    setSaving(true);
    try {
      await updateGeneralGoal({ textPre: editPre.trim(), textHighlight: editHighlight.trim() });
      toast.success("Tujuan utama diperbarui!");
      setIsEditing(false);
    } catch {
      toast.error("Gagal menyimpan tujuan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      className="mt-2 p-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 relative overflow-hidden shadow-xl shadow-amber-500/25 border border-white/10 group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute -right-6 -top-6 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-6 -bottom-6 w-40 h-40 bg-orange-700/20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col">
        <div className="flex justify-between items-center w-full mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-50 backdrop-blur-md border border-white/10 shadow-sm">
            <Target className="w-3.5 h-3.5" />
            Tujuan Utama
          </span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="w-8 h-8 flex items-center justify-center rounded-full text-amber-50 hover:text-white hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-8 h-8 flex items-center justify-center rounded-full text-amber-50 hover:text-white hover:bg-white/20 transition-colors active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={handleStartEdit}
              className="w-8 h-8 flex items-center justify-center rounded-full text-amber-50 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
              aria-label="Edit main goal"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[10px] font-bold text-amber-200/70 uppercase tracking-wider mb-1.5">Bagian awal</label>
                <input
                  type="text"
                  value={editPre}
                  onChange={(e) => setEditPre(e.target.value)}
                  placeholder="Contoh: Lulus dengan"
                  className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/30 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-200/70 uppercase tracking-wider mb-1.5">Target utama</label>
                <input
                  type="text"
                  value={editHighlight}
                  onChange={(e) => setEditHighlight(e.target.value)}
                  placeholder="Contoh: IPK 3.5"
                  className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/30 text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="relative"
            >
              <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow-md">
                {goalTextPre} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-yellow-50">
                  {goalTextHighlight}
                </span>
              </h2>
              <Sparkles className="absolute top-0 right-4 text-white/40 w-10 h-10 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isEditing && (
          <>
            <div className="mt-5 pt-4 border-t border-white/15">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-100" />
                  <span className="text-sm font-bold text-white">
                    {totalCompleted} dari {totalTasks} tugas selesai
                  </span>
                </div>
                {totalTasks > 0 && (
                  <span className="text-sm font-black text-white/80">
                    {Math.round((totalCompleted / totalTasks) * 100)}%
                  </span>
                )}
              </div>
              {totalTasks > 0 && (
                <div className="mt-2.5 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/80"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round((totalCompleted / totalTasks) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
            </div>

            <p className="mt-3 text-xs text-amber-100/70 italic leading-relaxed">
              {motivation}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
