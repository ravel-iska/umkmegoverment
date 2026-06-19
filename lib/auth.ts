"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Admin" | "Penjual" | "Pembeli" | null;

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  isLoggedIn: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loginWithEmail: (email: string, password: string) => Promise<{success: boolean, message?: string}>;
  registerWithEmail: (name: string, email: string, password: string, role?: string) => Promise<{success: boolean, message?: string}>;
  logout: () => Promise<void>;
  upgradeToSeller: () => Promise<{success: boolean, message?: string}>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      loginWithEmail: async (email, password) => {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          const data = await res.json();
          if (!res.ok) return { success: false, message: data.error };
          
          set({
            user: {
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              isLoggedIn: true,
            },
          });
          return { success: true };
        } catch (err) {
          return { success: false, message: "Terjadi kesalahan server" };
        }
      },

      registerWithEmail: async (name, email, password, role) => {
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role }),
          });
          const data = await res.json();
          if (!res.ok) return { success: false, message: data.error };
          
          set({
            user: {
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              isLoggedIn: true,
            },
          });
          return { success: true };
        } catch (err) {
          return { success: false, message: "Terjadi kesalahan server" };
        }
      },



      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {}
        set({ user: null });
        // Bersihkan localStorage agar tidak ada state basi saat login ulang
        if (typeof window !== "undefined") {
          localStorage.removeItem("pasar-podosari-auth");
        }
      },

      upgradeToSeller: async () => {
        try {
          const res = await fetch("/api/auth/upgrade", { method: "POST" });
          const data = await res.json();
          if (!res.ok) return { success: false, message: data.error };
          
          const current = get().user;
          if (current) {
            set({ user: { ...current, role: "Penjual" } });
          }
          return { success: true };
        } catch (e) {
          return { success: false, message: "Terjadi kesalahan" };
        }
      },
      
      checkSession: async () => {
        try {
          const res = await fetch("/api/auth/me");
          const data = await res.json();
          if (data.user) {
            set({ user: { ...data.user, isLoggedIn: true } });
          } else {
            set({ user: null });
          }
        } catch (e) {}
      }
    }),
    { name: "pasar-podosari-auth" }
  )
);
