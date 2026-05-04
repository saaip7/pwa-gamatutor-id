"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ScrollText, Award } from "lucide-react";
import { useQuestStore } from "@/stores/quest";

interface QuestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestHistoryModal({ isOpen, onClose }: QuestHistoryModalProps) {
  const { history, loading, fetchHistory } = useQuestStore();

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, fetchHistory]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-50 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 border border-purple-100/50">
                  <ScrollText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900">Riwayat Quest</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-neutral-100 animate-pulse" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <ScrollText className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">Belum ada quest yang selesai</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100"
                    >
                      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 truncate">
                          {item.template_id ? `Quest #${item.template_id.slice(-6)}` : "Quest Selesai"}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {item.completed_at
                            ? new Date(item.completed_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </p>
                      </div>
                      {item.reward_applied && (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          +1 Reward
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
