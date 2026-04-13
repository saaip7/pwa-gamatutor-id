"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Minimize2,
  Square,
  Video,
  SquareCheckBig,
  Loader2,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { FocusTimer } from "@/components/feature/task/focus/FocusTimer";
import { FocusStrategyTip } from "@/components/feature/task/focus/FocusStrategyTip";
import { Drawer } from "@/components/ui/Drawer";
import { useBoardStore } from "@/stores/board";
import { useFocusSessionStore } from "@/stores/focusSession";
import { api } from "@/lib/api";
import type { BoardCard } from "@/types";

const DEFAULT_TIP =
  "Kerjakan satu langkah pada satu waktu. Fokus pada apa yang ada di depanmu.";

export default function FocusModePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const fetchCardDetail = useBoardStore((s) => s.fetchCardDetail);
  const updateCard = useBoardStore((s) => s.updateCard);
  const moveCard = useBoardStore((s) => s.moveCard);

  // Global focus session store
  const {
    isActive: storeHasSession,
    sessionId: storeSessionId,
    startTime: storeStartTime,
    startSession,
    endSession: clearStore,
    markFinished,
    clearFinished,
    setPendingReflection,
  } = useFocusSessionStore();

  const [card, setCard] = useState<BoardCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStarting, setSessionStarting] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [showEndDrawer, setShowEndDrawer] = useState(false);
  const [ending, setEnding] = useState(false);
  const [strategyTip, setStrategyTip] = useState(DEFAULT_TIP);

  const sessionStartedRef = useRef(false);
  const finishingRef = useRef(false);

  // Guard: if this card was just finished, redirect away
  useEffect(() => {
    const finishedId = useFocusSessionStore.getState().lastFinishedCardId;
    if (finishedId === id) {
      clearFinished(id);
      router.replace("/board");
      return;
    }
  }, [id]);

  // Fetch card detail on mount
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchCardDetail(id)
      .then((data) => setCard(data))
      .catch(() => setCard(null))
      .finally(() => setLoading(false));
  }, [id, fetchCardDetail]);

  // Fetch learning strategies from BE and pick a random tip
  useEffect(() => {
    if (!card?.learning_strategy) return;
    api
      .get<{ learning_strat_name: string; tips: string[] }[]>("/learningstrats")
      .then((strategies) => {
        const match = strategies.find(
          (s) => s.learning_strat_name === card.learning_strategy
        );
        if (match?.tips?.length) {
          const randomIndex = Math.floor(Math.random() * match.tips.length);
          setStrategyTip(match.tips[randomIndex]);
        }
      })
      .catch(() => {});
  }, [card?.learning_strategy]);

  // Extracted: start a new session via BE
  const startNewSession = useCallback(() => {
    if (!card) return;
    setSessionStarting(true);
    api
      .post<{ _id: string; card_id: string; start_time: string }>(
        "/api/study-sessions/start",
        { card_id: id }
      )
      .then((res) => {
        const beStartTime = new Date(res.start_time).getTime();
        setSessionId(res._id);
        setSessionStartTime(beStartTime);
        startSession(res._id, id, card.task_name || "Fokus Belajar", beStartTime);
      })
      .catch(() => {
        const now = Date.now();
        setSessionStartTime(now);
        startSession("local", id, card.task_name || "Fokus Belajar", now);
      })
      .finally(() => setSessionStarting(false));
  }, [card, id, startSession]);

  // Start study session — only ONCE, or resume from store
  useEffect(() => {
    if (!card || sessionStartedRef.current) return;
    sessionStartedRef.current = true;

    // Resume existing session from store — but validate against BE first
    if (storeHasSession && storeSessionId && storeSessionId !== "local" && useFocusSessionStore.getState().cardId === id) {
      setSessionStarting(true);
      // Verify session still exists in BE (not cleaned up by orphan job)
      api.get<{ _id: string; start_time: string; end_time: string | null }>(
        `/api/study-sessions/${storeSessionId}`
      ).then((res) => {
        if (res.end_time) {
          // Session was already ended (orphan cleanup or other reason)
          clearStore();
          toast.info("Sesi sebelumnya sudah berakhir. Memulai sesi baru...", { duration: 4000 });
          startNewSession();
        } else {
          // Session still valid — resume
          const beStartTime = new Date(res.start_time).getTime();
          setSessionId(storeSessionId);
          setSessionStartTime(beStartTime);
          setSessionStarting(false);
        }
      }).catch(() => {
        // Session not found in BE — start fresh
        clearStore();
        toast.info("Sesi sebelumnya sudah kadaluarsa. Memulai sesi baru...", { duration: 4000 });
        startNewSession();
      });
      return;
    }

    // No existing session — start new
    startNewSession();
  }, [card, id, storeHasSession, storeSessionId, clearStore, startNewSession]);

  // Derive strategy info from card
  const strategyName = card?.learning_strategy || "Fokus Mandiri";
  const strategyIcon = Video;

  // Personal best display
  const personalBestDisplay = (() => {
    const pb = card?.personal_best;
    if (!pb) return "—";
    if (typeof pb === "string") return pb;
    if (pb.duration_ms) {
      const totalMin = Math.floor(pb.duration_ms / 60000);
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return h > 0 ? `${h}j ${m}m` : `${m}m`;
    }
    return "—";
  })();

  // End session in DB — returns server-computed duration_ms
  const endSessionInDB = async (): Promise<number> => {
    if (sessionId && sessionId !== "local") {
      const res = await api.post<{ message: string; duration_ms: number }>(
        "/api/study-sessions/end",
        { session_id: sessionId }
      );
      return res.duration_ms ?? 0;
    }
    // Local session fallback — use wall clock
    return sessionStartTime ? Date.now() - sessionStartTime : 0;
  };

  // Save personal best if this session is a new record (longest single session)
  const savePersonalBest = async (durationMs: number) => {
    if (durationMs < 60000) return;

    const currentBest = card?.personal_best;
    const currentBestMs =
      currentBest && typeof currentBest === "object"
        ? currentBest.duration_ms ?? 0
        : 0;

    if (durationMs > currentBestMs) {
      await updateCard(id, {
        personal_best: {
          duration_ms: durationMs,
          date: new Date().toISOString(),
        },
      });
    }
  };

  // Action 1: Akhiri — end session, card stays in monitoring
  const handleEnd = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setEnding(true);

    let durationMs = 0;
    try {
      durationMs = await endSessionInDB();
    } catch {
      toast.error("Gagal mengakhiri sesi di server");
    }

    try {
      await savePersonalBest(durationMs);
    } catch {
      toast.error("Gagal menyimpan personal best");
    }

    markFinished(id);
    clearStore();
    router.back();
  };

  // Action 2: Jeda & Sesuaikan — end session, card moves to controlling
  const handlePause = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setEnding(true);

    let durationMs = 0;
    try {
      durationMs = await endSessionInDB();
    } catch {
      toast.error("Gagal mengakhiri sesi di server");
    }

    try {
      await savePersonalBest(durationMs);
    } catch {
      toast.error("Gagal menyimpan personal best");
    }

    try {
      await moveCard(id, "controlling");
    } catch {
      toast.error("Gagal memindahkan kartu ke Controlling");
    }

    markFinished(id);
    clearStore();
    router.back();
  };

  // Action 3: Selesai & Beri Refleksi — end session, navigate to reflection
  const handleFinish = async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setEnding(true);

    let durationMs = 0;
    try {
      durationMs = await endSessionInDB();
    } catch {
      toast.error("Gagal mengakhiri sesi di server");
    }

    try {
      await savePersonalBest(durationMs);
    } catch {
      toast.error("Gagal menyimpan personal best");
    }

    const durationSec = Math.floor(durationMs / 1000);
    markFinished(id);
    setPendingReflection(id, durationSec);
    clearStore();
    router.push(`/task/${id}/reflection?duration=${durationSec}`);
  };

  // Minimize → go back, SessionBar keeps session alive
  const handleMinimize = () => {
    router.back();
  };

  // Loading state
  if (loading || sessionStarting) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white max-w-md mx-auto">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col mx-auto bg-white relative overflow-hidden max-w-md">
      {/* Header */}
      <header className="shrink-0 pt-14 pb-3 px-5 border-b border-neutral-100 flex items-center justify-between bg-white z-50">
        <button
          onClick={handleMinimize}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600 active:scale-95 transition-all"
        >
          <Minimize2 className="w-5 h-5" />
        </button>

        <div className="flex-1 px-4 text-center">
          <h1 className="text-sm font-bold text-neutral-900 truncate">
            {card?.task_name ?? "Fokus Belajar"}
          </h1>
        </div>

        <button
          onClick={() => setShowEndDrawer(true)}
          className="h-10 px-3.5 flex items-center gap-1.5 rounded-xl bg-red-50 text-red-600 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          Akhiri
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 space-y-12">
        <FocusStrategyTip
          strategy={strategyName}
          tip={strategyTip}
          icon={strategyIcon}
        />

        <FocusTimer
          personalBest={personalBestDisplay}
          startTime={sessionStartTime || Date.now()}
        />
      </main>

      {/* Footer CTA — two buttons */}
      <footer className="shrink-0 pb-[34px] pt-4 px-6 bg-white border-t border-neutral-100 z-50 space-y-3">
        <button
          onClick={handleFinish}
          disabled={ending}
          className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 group"
        >
          {ending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SquareCheckBig className="w-5 h-5 group-active:scale-110 transition-transform" />
          )}
          {ending ? "Menyimpan..." : "Selesai & Beri Refleksi"}
        </button>

        <button
          onClick={handlePause}
          disabled={ending}
          className="w-full h-[48px] bg-white border-2 border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Pause className="w-4.5 h-4.5" />
          Jeda & Sesuaikan
        </button>
      </footer>

      {/* Akhiri Confirmation Drawer */}
      <Drawer
        isOpen={showEndDrawer}
        onClose={() => setShowEndDrawer(false)}
        title="Akhiri Sesi?"
      >
        <div className="space-y-6 pt-2">
          <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">
                Sesi ini akan tersimpan
              </p>
              <p className="text-xs text-amber-600 mt-1 font-medium leading-relaxed">
                Catatan sesi dan personal best akan disimpan. Kartu tetap berada
                di kolom Monitoring — kamu bisa melanjutkan sesi baru nanti.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEndDrawer(false)}
              className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-700 rounded-2xl font-bold text-sm active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleEnd}
              disabled={ending}
              className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all disabled:opacity-50"
            >
              {ending ? "Mengakhiri..." : "Ya, Akhiri"}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
