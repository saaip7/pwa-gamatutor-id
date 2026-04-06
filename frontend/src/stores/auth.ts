import { create } from "zustand";
import { api } from "@/lib/api";
import type { User } from "@/types";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<void>;
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post<{ token: string; refreshToken: string }>(
        "/api/login",
        { email, password }
      );
      localStorage.setItem("token", res.token);
      // Fetch user profile after login
      const user = await api.get<User>("/users/me");
      set({ token: res.token, user, isAuthenticated: true, loading: false });
    } catch (e: unknown) {
      set({ loading: false });
      const msg = e instanceof Error ? e.message : "Email atau password salah";
      toast.error(msg);
      throw e;
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      // BE register returns { message, user_id } — no token
      await api.post<{ message: string; user_id: string }>("/api/register", data);
      toast.success("Registrasi berhasil!");
      // Auto-login after register
      const loginRes = await api.post<{ token: string; refreshToken: string }>(
        "/api/login",
        { email: data.email, password: data.password }
      );
      localStorage.setItem("token", loginRes.token);
      const user = await api.get<User>("/users/me");
      set({ token: loginRes.token, user, isAuthenticated: true, loading: false });
    } catch (e: unknown) {
      set({ loading: false });
      const msg = e instanceof Error ? e.message : "Registrasi gagal";
      toast.error(msg);
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
      const user = await api.get<User>("/users/me");
      set({ user, isAuthenticated: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const user = await api.put<User>("/users/profile", data);
      set({ user });
      toast.success("Profil berhasil disimpan");
    } catch (e: unknown) {
      toast.error("Gagal menyimpan profil");
      throw e;
    }
  },

  updatePassword: async (data) => {
    try {
      await api.put("/users/password", data);
      toast.success("Password berhasil diubah");
    } catch (e: unknown) {
      toast.error("Gagal mengubah password");
      throw e;
    }
  },

  deleteAccount: async () => {
    try {
      await api.delete("/users/me");
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false });
      toast.success("Akun berhasil dihapus");
    } catch (e: unknown) {
      toast.error("Gagal menghapus akun");
      throw e;
    }
  },
}));
