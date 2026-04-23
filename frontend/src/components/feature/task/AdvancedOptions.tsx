"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2,
  ChevronDown,
  BarChart2,
  Leaf,
  Flame,
  Mountain,
  LineChart,
  CheckSquare,
  Plus,
  X,
  GripVertical,
  Link as LinkIcon,
  Youtube,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdvancedOptionsData {
  difficulty: "Easy" | "Medium" | "Hard";
  checklists: { id: string; title: string; isCompleted: boolean }[];
  links: { id: string; title: string; url: string }[];
  preTestGrade?: number;
  postTestGrade?: number;
}

interface AdvancedOptionsProps {
  onChange: (data: AdvancedOptionsData) => void;
  defaultValue?: AdvancedOptionsData;
}

export function AdvancedOptions({ onChange, defaultValue }: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    defaultValue?.difficulty ?? "Medium"
  );
  const [isTrackNilai, setTrackNilai] = useState(
    defaultValue?.preTestGrade != null && defaultValue.preTestGrade > 0
  );
  const [preTestGrade, setPreTestGrade] = useState<string>(
    defaultValue?.preTestGrade != null ? String(defaultValue.preTestGrade) : ""
  );
  const [postTestGrade, setPostTestGrade] = useState<string>(
    defaultValue?.postTestGrade != null ? String(defaultValue.postTestGrade) : ""
  );
  const [postGradeError, setPostGradeError] = useState("");

  // Subtasks State (mapped to checklists for BE)
  const [subtasks, setSubtasks] = useState<{ id: string; text: string }[]>(
    defaultValue?.checklists?.map((c) => ({ id: c.id, text: c.title })) ?? []
  );

  // Links State
  const [links, setLinks] = useState<{ id: string; title: string; url: string }[]>(
    defaultValue?.links ?? []
  );
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  // Notify parent whenever data changes
  useEffect(() => {
    onChange({
      difficulty,
      checklists: subtasks
        .filter((s) => s.text.trim())
        .map((s) => ({ id: s.id, title: s.text, isCompleted: false })),
      links: links.filter((l) => l.title.trim() && l.url.trim()),
      preTestGrade: preTestGrade ? Number(preTestGrade) : undefined,
      postTestGrade: postTestGrade ? Number(postTestGrade) : undefined,
    });
  }, [difficulty, subtasks, links, preTestGrade, postTestGrade, onChange]);

  const handlePostGradeChange = (value: string) => {
    if (value === "") {
      setPostTestGrade("");
      setPostGradeError("");
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return;
    if (num < 0 || num > 100) {
      setPostGradeError("Nilai harus antara 0-100");
    } else {
      setPostGradeError("");
    }
    setPostTestGrade(value);
  };

  // Subtask Actions
  const addSubtask = () => {
    const id = Math.random().toString(36).substr(2, 9);
    setSubtasks([...subtasks, { id, text: "" }]);
  };

  const updateSubtask = (id: string, text: string) => {
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, text } : s)));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  // Link Actions
  const addLink = () => {
    if (!newLink.title || !newLink.url) return;
    const id = Math.random().toString(36).substr(2, 9);
    setLinks([...links, { id, ...newLink }]);
    setNewLink({ title: "", url: "" });
    setShowLinkInput(false);
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  return (
    <div className="bg-white border-y border-neutral-100 -mx-5 px-5 py-6 mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-[18px] h-[18px] text-neutral-500" />
          <span className="text-base font-semibold text-neutral-900">
            Opsi Lanjutan
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-7 space-y-8">
              {/* Tingkat Kesulitan */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <BarChart2 className="w-3.5 h-3.5" />
                  Tingkat Kesulitan
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "Easy" as const, label: "Mudah", icon: Leaf, color: "text-emerald-500" },
                    { id: "Medium" as const, label: "Sedang", icon: Flame, color: "text-amber-500" },
                    { id: "Hard" as const, label: "Sulit", icon: Mountain, color: "text-error" },
                  ].map((diff) => {
                    const isSelected = difficulty === diff.id;
                    const DiffIcon = diff.icon;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => setDifficulty(diff.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border transition-all relative",
                          isSelected
                            ? "border-2 border-amber-500 bg-amber-50"
                            : "border-neutral-200 bg-white"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <DiffIcon className={cn("w-6 h-6", diff.color)} />
                        <span
                          className={cn(
                            "text-sm",
                            isSelected
                              ? "font-semibold text-amber-700"
                              : "font-medium text-neutral-600"
                          )}
                        >
                          {diff.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Evaluasi */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <LineChart className="w-3.5 h-3.5" />
                  Tracking Evaluasi
                </label>
                <div className="p-4 rounded-xl border border-neutral-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">
                        Track Nilai
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Pantau progress pre/post test
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTrackNilai(!isTrackNilai)}
                      className={cn(
                        "w-11 h-6 rounded-full relative transition-colors focus:outline-none",
                        isTrackNilai ? "bg-primary" : "bg-neutral-200"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                          isTrackNilai ? "translate-x-5" : "translate-x-0"
                        )}
                      ></div>
                    </button>
                  </div>

                  {isTrackNilai && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-4 border-t border-neutral-100 space-y-4"
                    >
                      <label className="text-xs font-medium text-neutral-600 mb-2 block">
                        Nilai Pre-test (Opsional)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="0"
                          value={preTestGrade}
                          onChange={(e) => setPreTestGrade(e.target.value)}
                          min="0"
                          max="100"
                          className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">
                          / 100
                        </span>
                      </div>

                      <div className="pt-3 border-t border-neutral-100">
                        <label className="text-xs font-medium text-neutral-600 mb-2 block">
                          Nilai Post-test (Opsional)
                        </label>
                        <p className="text-[11px] text-neutral-400 font-medium mb-2">
                          Isi setelah menyelesaikan tugas untuk melihat peningkatan.
                        </p>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="0"
                            value={postTestGrade}
                            onChange={(e) => handlePostGradeChange(e.target.value)}
                            min="0"
                            max="100"
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all",
                              postGradeError
                                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                : "border-neutral-200 focus:border-primary"
                            )}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">
                            / 100
                          </span>
                        </div>
                        {postGradeError && (
                          <p className="text-xs text-red-500 font-medium mt-1">{postGradeError}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Subtasks
                </label>
                <div className="space-y-3">
                  <AnimatePresence>
                    {subtasks.map((subtask) => (
                      <motion.div
                        key={subtask.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-3 pl-2 pr-3 py-2 rounded-xl border border-neutral-200 bg-white focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all group"
                      >
                        <div className="text-neutral-300 shrink-0">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={subtask.text}
                          onChange={(e) => updateSubtask(subtask.id, e.target.value)}
                          placeholder="Apa yang perlu dilakukan?"
                          className="flex-1 text-sm py-1.5 outline-none text-neutral-900 bg-transparent min-w-0"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubtask(subtask.id)}
                          className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-error hover:bg-red-50 rounded-full transition-colors shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <button
                    type="button"
                    onClick={addSubtask}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-neutral-200 text-sm font-bold text-neutral-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Plus className="w-5 h-5" />
                    Tambah Subtask
                  </button>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-3 pb-6">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Links
                </label>
                <div className="space-y-3">
                  <AnimatePresence>
                    {links.map((link) => (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-white"
                      >
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-500 shrink-0 border border-neutral-100">
                          {link.url.includes("youtube.com") ||
                          link.url.includes("youtu.be") ? (
                            <Youtube className="w-5 h-5 text-error" />
                          ) : (
                            <LinkIcon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-bold text-neutral-900 truncate">
                            {link.title}
                          </p>
                          <p className="text-xs text-neutral-500 truncate mt-0.5">
                            {link.url}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-400 hover:text-error hover:bg-red-50 transition-colors shrink-0"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {showLinkInput ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-3 shadow-inner"
                    >
                      <input
                        type="text"
                        placeholder="Judul Link (misal: Tutorial Bab 1)"
                        value={newLink.title}
                        onChange={(e) =>
                          setNewLink({ ...newLink, title: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all"
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newLink.url}
                        onChange={(e) =>
                          setNewLink({ ...newLink, url: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={addLink}
                          className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                          Simpan Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLinkInput(false)}
                          className="px-6 py-3.5 bg-white text-neutral-500 border border-neutral-200 rounded-xl font-bold text-sm active:scale-95 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowLinkInput(true)}
                      className="w-full py-4 rounded-xl border-2 border-dashed border-neutral-200 text-sm font-bold text-neutral-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Plus className="w-5 h-5" />
                      Tambah Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
