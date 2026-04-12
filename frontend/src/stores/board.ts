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

// Reverse lookup from BE list ID string to FE column key (for createCard)
const LIST_ID_TO_COL: Record<string, ColumnKey> = LIST_MAP;

interface BoardState {
  board: Board | null;
  tasks: Record<string, BoardCard>; // keyed by card id
  columns: Record<ColumnKey, string[]>; // card IDs per column
  loading: boolean;
  error: string | null;

  fetchBoard: () => Promise<void>;
  createBoard: () => Promise<void>;
  moveCard: (
    cardId: string,
    column: ColumnKey,
    position?: number
  ) => Promise<{
    message: string;
    newlyUnlocked: unknown[];
    streak: unknown;
  } | void>;
  reorderColumn: (column: ColumnKey, cardIds: string[]) => Promise<void>;
  updateCard: (cardId: string, data: Partial<BoardCard>) => Promise<void>;
  createCard: (data: {
    task_name: string;
    course_name?: string;
    description?: string;
    learning_strategy?: string;
    priority?: string;
    difficulty?: string;
    deadline?: string;
    goal_check?: { goal_text: string };
    checklists?: { id: string; title: string; isCompleted: boolean }[];
    links?: { id: string; title: string; url: string }[];
    pre_test_grade?: number;
    column?: string;
  }) => Promise<BoardCard>;
  deleteCard: (cardId: string) => Promise<void>;
  fetchCardDetail: (cardId: string) => Promise<BoardCard & { list_title: string; board_id: string }>;
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
      const board = await api.get<Board>("/board");

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
      const res = await api.post<{
        message: string;
        board_id: string;
        id: string;
        name: string;
        lists: Board["lists"];
      }>("/board");

      // Build the Board object from the response
      const board: Board = {
        _id: res.id,
        user_id: "",
        name: res.name,
        lists: res.lists,
      };

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

  moveCard: async (cardId, column, position = 0) => {
    const listId = REVERSE_LIST_MAP[column];
    try {
      const res = await api.patch<{
        message: string;
        newlyUnlocked: unknown[];
        streak: unknown;
      }>(`/board/card/${cardId}/move`, { column: listId, position });

      // Optimistically update local state
      set((state) => {
        const newColumns = { ...state.columns };
        // Remove from all columns
        for (const key of Object.keys(newColumns)) {
          newColumns[key as ColumnKey] = newColumns[key as ColumnKey].filter(
            (id) => id !== cardId
          );
        }
        // Add to target column at position
        const target = [...newColumns[column]];
        const insertPos = Math.min(position, target.length);
        target.splice(insertPos, 0, cardId);
        newColumns[column] = target;

        return { columns: newColumns };
      });

      return res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal memindahkan card";
      set({ error: msg });
      throw e; // Re-throw so caller can revert optimistic update
    }
  },

  reorderColumn: async (column, cardIds) => {
    const listId = REVERSE_LIST_MAP[column];
    try {
      await api.put("/board/column/reorder", {
        column: listId,
        card_ids: cardIds,
      });
      set((state) => ({
        columns: { ...state.columns, [column]: cardIds },
      }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengurutkan kolom";
      set({ error: msg });
      throw e;
    }
  },

  updateCard: async (cardId, data) => {
    try {
      const updated = await api.put<BoardCard>(
        `/board/card/${cardId}`,
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

  createCard: async (data) => {
    const res = await api.post<{ message: string; card: BoardCard }>(
      "/board/card",
      data
    );
    const card = res.card;
    const colKey = LIST_ID_TO_COL[data.column || "list1"] || "planning";
    set((state) => ({
      tasks: { ...state.tasks, [card.id]: card },
      columns: {
        ...state.columns,
        [colKey]: [...state.columns[colKey], card.id],
      },
    }));
    return card;
  },

  deleteCard: async (cardId) => {
    await api.delete(`/board/card/${cardId}`);
    set((state) => {
      const newTasks = { ...state.tasks };
      delete newTasks[cardId];
      const newColumns = { ...state.columns };
      for (const key of Object.keys(newColumns)) {
        newColumns[key as ColumnKey] = newColumns[key as ColumnKey].filter(
          (id) => id !== cardId
        );
      }
      return { tasks: newTasks, columns: newColumns };
    });
  },

  fetchCardDetail: async (cardId) => {
    const res = await api.get<{ card: BoardCard; list_title: string; board_id: string }>(
      `/board/card/${cardId}`
    );
    // Update the card in local tasks cache
    set((state) => ({
      tasks: { ...state.tasks, [cardId]: res.card },
    }));
    return { ...res.card, list_title: res.list_title, board_id: res.board_id };
  },

  getColumnKey: (listId) => LIST_MAP[listId] || "planning",
  getListId: (columnKey) => REVERSE_LIST_MAP[columnKey],
}));
