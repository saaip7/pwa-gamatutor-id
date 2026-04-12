import { create } from "zustand";

interface FocusSessionState {
  isActive: boolean;
  sessionId: string | null;
  cardId: string | null;
  taskName: string;
  startTime: number; // Date.now() timestamp for wall-clock duration

  startSession: (
    sessionId: string,
    cardId: string,
    taskName: string
  ) => void;
  endSession: () => void;
}

export const useFocusSessionStore = create<FocusSessionState>((set) => ({
  isActive: false,
  sessionId: null,
  cardId: null,
  taskName: "",
  startTime: 0,

  startSession: (sessionId, cardId, taskName) =>
    set({
      isActive: true,
      sessionId,
      cardId,
      taskName,
      startTime: Date.now(),
    }),

  endSession: () =>
    set({
      isActive: false,
      sessionId: null,
      cardId: null,
      taskName: "",
      startTime: 0,
    }),
}));
