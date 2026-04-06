import { create } from "zustand";
import { api } from "@/lib/api";
import type { Board, BoardCard, ColumnKey } from "@/types";

// BE list IDs → FE column keys
const LIST_MAP: Record<string, ColumnKey> = {
  list1: "planning",
  list2: "monitoring",
  list3: "controlling",
  list4: "reflection",
};

const REVERSE_LIST_MAP: Record<ColumnKey, string> = {
  planning: "list1",
  monitoring: "list2",
  controlling: "list3",
  reflection: "list4",
};

interface BoardState {
  board: Board | null;
  tasks: Record<string, BoardCard>; // keyed by card id
  columns: Record<ColumnKey, string[]>; // card IDs per column
  loading: boolean;
  error: string | null;

  fetchBoard: () => Promise<void>;
  createBoard: () => Promise<void>;
  updateBoard: (columns: Record<ColumnKey, string[]>) => Promise<void>;
  updateCard: (cardId: string, data: Partial<BoardCard>) => Promise<void>;
  getColumnKey: (listId: string) => ColumnKey;
  getListId: (columnKey: ColumnKey) => string;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: null,
  tasks: {},
  columns: {
    planning: [],
    monitoring: [],
    controlling: [],
    reflection: [],
  },
  loading: false,
  error: null,

  fetchBoard: async () => {
    set({ loading: true });
    try {
      const board = await api.get<Board>("/api/board");

      // Flatten cards and build column map
      const tasks: Record<string, BoardCard> = {};
      const columns: Record<ColumnKey, string[]> = {
        planning: [],
        monitoring: [],
        controlling: [],
        reflection: [],
      };

      for (const list of board.lists) {
        const colKey = LIST_MAP[list.id] || "planning";
        columns[colKey] = list.cards.map((card) => {
          tasks[card.id] = card;
          return card.id;
        });
      }

      set({ board, tasks, columns, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memuat board";
      set({ error: msg, loading: false });
    }
  },

  createBoard: async () => {
    set({ loading: true });
    try {
      const board = await api.post<Board>("/api/board");
      const tasks: Record<string, BoardCard> = {};
      const columns: Record<ColumnKey, string[]> = {
        planning: [],
        monitoring: [],
        controlling: [],
        reflection: [],
      };
      for (const list of board.lists) {
        const colKey = LIST_MAP[list.id] || "planning";
        columns[colKey] = list.cards.map((card) => {
          tasks[card.id] = card;
          return card.id;
        });
      }
      set({ board, tasks, columns, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal membuat board";
      set({ error: msg, loading: false });
    }
  },

  updateBoard: async (columns) => {
    const { board } = get();
    if (!board) return;

    // Convert FE columns back to BE lists format
    const lists = board.lists.map((list) => {
      const colKey = LIST_MAP[list.id] || "planning";
      const cardIds = columns[colKey] || [];
      return {
        ...list,
        cards: cardIds
          .map((id) => get().tasks[id])
          .filter(Boolean),
      };
    });

    try {
      await api.put("/api/board", { lists });
      set({ columns, board: { ...board, lists } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal update board";
      set({ error: msg });
    }
  },

  updateCard: async (cardId, data) => {
    try {
      const updated = await api.put<BoardCard>(
        `/api/board/card/${cardId}`,
        data
      );
      set((state) => ({
        tasks: { ...state.tasks, [cardId]: updated },
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal update card";
      set({ error: msg });
    }
  },

  getColumnKey: (listId) => LIST_MAP[listId] || "planning",
  getListId: (columnKey) => REVERSE_LIST_MAP[columnKey],
}));
