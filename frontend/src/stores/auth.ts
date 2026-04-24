import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setTokens, clearTokens, isNetworkError, ApiError } from "@/lib/api";
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
  fetchProfile: () => Promise<boolean>;
  updateProfile: (data: { name?: string }) => Promise<void>;
  updatePassword: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const res = await api.post<{ token: string; refreshToken: string }>(
            "/api/login",
            { email, password }
          );
          setTokens(res.token, res.refreshToken);
          const user = await api.get<User>("/users/me");
          set({ token: res.token, user, isAuthenticated: true, loading: false });
        } catch (e: unknown) {
          set({ loading: false });
          if (isNetworkError(e)) {
            toast.error("Server tidak merespon. Silakan coba lagi nanti.");
          } else if (e instanceof Error) {
            toast.error(e.message);
          } else {
            toast.error("Email atau password salah");
          }
          throw e;
        }
      },

      register: async (data) => {
        set({ loading: true });
        try {
          await api.post<{ message: string; user_id: string }>("/api/register", data);
          toast.success("Registrasi berhasil!");
          const loginRes = await api.post<{ token: string; refreshToken: string }>(
            "/api/login",
            { email: data.email, password: data.password }
          );
          setTokens(loginRes.token, loginRes.refreshToken);
          const user = await api.get<User>("/users/me");
          set({ token: loginRes.token, user, isAuthenticated: true, loading: false });
        } catch (e: unknown) {
          set({ loading: false });
          if (isNetworkError(e)) {
            toast.error("Server tidak merespon. Silakan coba lagi nanti.");
          } else if (e instanceof Error) {
            toast.error(e.message);
          } else {
            toast.error("Registrasi gagal");
          }
          throw e;
        }
      },

      logout: async () => {
        try {
          await api.post("/api/logout");
        } finally {
          clearTokens();
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      fetchProfile: async () => {
        try {
          const user = await api.get<User>("/users/me");
          set({ user, isAuthenticated: true });
          return true;
        } catch (e: unknown) {
          if (isNetworkError(e)) return false;
          if (e instanceof ApiError && e.status === 401) {
            return false;
          }
          return false;
        }
      },

      updateProfile: async (data) => {
        try {
          await api.put("/users/profile", { name: data.name });
          const user = await api.get<User>("/users/me");
          set({ user });
        } catch (e: unknown) {
          toast.error("Gagal menyimpan profil");
          throw e;
        }
      },

      updatePassword: async (data) => {
        try {
          await api.put("/users/password", {
            current_password: data.currentPassword,
            new_password: data.newPassword,
          });
        } catch (e: unknown) {
          if (isNetworkError(e)) {
            toast.error("Server tidak merespon. Silakan coba lagi nanti.");
          } else {
            toast.error(e instanceof Error ? e.message : "Gagal mengubah password");
          }
          throw e;
        }
      },

      deleteAccount: async () => {
        try {
          await api.delete("/users/me");
          clearTokens();
          set({ user: null, token: null, isAuthenticated: false });
          toast.success("Akun berhasil dihapus");
        } catch (e: unknown) {
          toast.error("Gagal menghapus akun");
          throw e;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
