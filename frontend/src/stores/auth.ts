import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string }) => Promise<void>;
  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (usernameOrEmail, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{
        token: string;
        refreshToken?: string;
        user: User;
      }>("/api/login", {
        username: usernameOrEmail,
 password
 });
      set({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Login gagal";
      set({ error: msg, loading: false });
      throw e;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post<{ token: string; user: User }>(
        "/api/register",        data
      );
      localStorage.setItem("token", res.token);
      set({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        loading: false,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Registrasi gagal";
      set({ error: msg, loading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await api.post("/api/logout");
    } finally {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  fetchProfile: async () => {
    try {
      const user = await api.get<User>("/api/users/me");
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data) => {
    const user = await api.put<User>("/api/users/profile", data);
    set({ user });
  },

  updatePassword: async (data) => {
    await api.put("/api/users/password", data);
  },

  deleteAccount: async () => {
    await api.delete("/api/users/account");
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
