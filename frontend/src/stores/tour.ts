import { create } from "zustand";

interface TourState {
  completedTours: string[];
  setCompletedTours: (tours: string[]) => void;
  markTourCompleted: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
  isAllToursCompleted: () => boolean;
}

const TOUR_IDS = ["tour-1", "tour-2", "tour-3", "tour-4", "tour-5"] as const;
export type TourId = (typeof TOUR_IDS)[number];

const STORAGE_KEY = "gamatutor-tour-state";

function loadState(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveState(tours: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
}

export const useTourStore = create<TourState>((set, get) => ({
  completedTours: [],

  setCompletedTours: (tours) => {
    set({ completedTours: tours });
    saveState(tours);
  },

  markTourCompleted: (tourId) => {
    const current = get().completedTours;
    if (current.includes(tourId)) return;
    const next = [...current, tourId];
    set({ completedTours: next });
    saveState(next);
  },

  isTourCompleted: (tourId) => {
    return get().completedTours.includes(tourId);
  },

  isAllToursCompleted: () => {
    const completed = get().completedTours;
    return TOUR_IDS.every((id) => completed.includes(id));
  },
}));

// Hydrate from localStorage on client
if (typeof window !== "undefined") {
  const stored = loadState();
  if (stored.length > 0) {
    useTourStore.getState().setCompletedTours(stored);
  }
}
