import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PendingReflection {
  cardId: string;
  duration: number; // seconds
}

interface FocusSessionState {
  isActive: boolean;
  sessionId: string | null;
  cardId: string | null;
  taskName: string;
  startTime: number; // Wall-clock ms timestamp (from BE start_time when available)
  lastFinishedCardId: string | null; // Prevents re-entering focus after finishing
  pendingReflection: PendingReflection | null; // Track incomplete reflection for resume

  startSession: (
    sessionId: string,
    cardId: string,
    taskName: string,
    startTime?: number // Override: pass BE's start_time (ms) for accuracy
  ) => void;
  endSession: () => void;
  markFinished: (cardId: string) => void;
  clearFinished: (cardId: string) => void;
  setPendingReflection: (cardId: string, duration: number) => void;
  clearPendingReflection: () => void;
}

export const useFocusSessionStore = create<FocusSessionState>()(
  persist(
    (set) => ({
      isActive: false,
      sessionId: null,
      cardId: null,
      taskName: "",
      startTime: 0,
      lastFinishedCardId: null,
      pendingReflection: null,

      startSession: (sessionId, cardId, taskName, startTime) =>
        set({
          isActive: true,
          sessionId,
          cardId,
          taskName,
          startTime: startTime ?? Date.now(),
          lastFinishedCardId: null,
        }),

      endSession: () =>
        set({
          isActive: false,
          sessionId: null,
          cardId: null,
          taskName: "",
          startTime: 0,
          lastFinishedCardId: null,
        }),

      markFinished: (cardId) => set({ lastFinishedCardId: cardId }),

      clearFinished: (cardId) =>
        set((state) =>
          state.lastFinishedCardId === cardId
            ? { lastFinishedCardId: null }
            : state
        ),

      setPendingReflection: (cardId, duration) =>
        set({ pendingReflection: { cardId, duration } }),

      clearPendingReflection: () => set({ pendingReflection: null }),
    }),
    {
      name: "focus-session-storage", // localStorage key
      partialize: (state) => ({
        isActive: state.isActive,
        sessionId: state.sessionId,
        cardId: state.cardId,
        taskName: state.taskName,
        startTime: state.startTime,
        lastFinishedCardId: state.lastFinishedCardId,
        pendingReflection: state.pendingReflection,
      }),
    }
  )
);
