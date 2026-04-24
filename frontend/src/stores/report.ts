import { create } from "zustand";
import { api } from "@/lib/api";

export interface Report {
  _id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  status: "open" | "resolved";
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

interface ReportState {
  myReports: Report[];
  loading: boolean;
  submitting: boolean;
  fetchMyReports: () => Promise<void>;
  submitReport: (data: {
    type: string;
    title: string;
    description: string;
  }) => Promise<boolean>;
}

export const useReportStore = create<ReportState>((set) => ({
  myReports: [],
  loading: false,
  submitting: false,

  fetchMyReports: async () => {
    set({ loading: true });
    try {
      const res = await api.get<{ reports: Report[] }>("/api/reports/mine");
      set({ myReports: res.reports });
    } catch {
      set({ myReports: [] });
    } finally {
      set({ loading: false });
    }
  },

  submitReport: async (data) => {
    set({ submitting: true });
    try {
      await api.post("/api/reports", data);
      return true;
    } catch {
      return false;
    } finally {
      set({ submitting: false });
    }
  },
}));

interface AdminReportState {
  reports: Report[];
  total: number;
  page: number;
  loading: boolean;
  responding: string | null;
  fetchReports: (page?: number, status?: string) => Promise<void>;
  respondToReport: (reportId: string, response: string) => Promise<boolean>;
}

export const useAdminReportStore = create<AdminReportState>((set, get) => ({
  reports: [],
  total: 0,
  page: 1,
  loading: false,
  responding: null,

  fetchReports: async (page = 1, status?: string) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: "20",
      });
      if (status) params.set("status", status);
      const res = await api.get<{
        data: Report[];
        total: number;
        page: number;
      }>(`/admin/reports?${params}`);
      set({
        reports: res.data,
        total: res.total,
        page: res.page,
      });
    } catch {
      set({ reports: [], total: 0 });
    } finally {
      set({ loading: false });
    }
  },

  respondToReport: async (reportId, response) => {
    set({ responding: reportId });
    try {
      await api.put(`/admin/reports/${reportId}/respond`, { response });
      const { page, fetchReports } = get();
      await fetchReports(page);
      return true;
    } catch {
      return false;
    } finally {
      set({ responding: null });
    }
  },
}));
