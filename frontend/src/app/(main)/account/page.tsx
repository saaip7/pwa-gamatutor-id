"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Bell, Globe, User, ShieldCheck, LogOut, Flame, Archive, HelpCircle, Clock, MessageCircleWarning } from "lucide-react";
import { AccountHeader } from "@/components/feature/account/AccountHeader";
import { ProfileCard } from "@/components/feature/account/ProfileCard";
import { SettingsGroup } from "@/components/feature/account/SettingsGroup";
import { SettingItem } from "@/components/feature/account/SettingItem";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";
import { useBadgesStore } from "@/stores/badges";

export default function AccountPage() {
  const { user, logout } = useAuthStore();
  const { preferences, updateTheme } = usePreferencesStore();
  const { badges } = useBadgesStore();

  const [language, setLanguage] = useState("id");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isDarkMode = preferences?.theme === "dark";

  useEffect(() => {
  }, []);

  const displayName = user?.name || "Mahasiswa";

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalBadges = badges.length || 1;
  const title = `${unlockedCount} Pencapaian`;

  const handleDarkModeToggle = async () => {
    const next = isDarkMode ? "light" : "dark";
    await updateTheme(next);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <AccountHeader />

      <div className="flex-1 overflow-y-auto relative z-0 pb-[100px] px-5 pt-6 space-y-6">
        <ProfileCard name={displayName} title={title} />

        <SettingsGroup title="PENGATURAN APLIKASI" delay={0.1}>
          <SettingItem
            type="toggle"
            icon={Moon}
            label="Mode Gelap"
            isActive={isDarkMode}
            onToggle={handleDarkModeToggle}
            disabled
            iconBgClass="bg-neutral-100"
            iconColorClass="text-neutral-600"
          />
          <SettingItem
            type="link"
            icon={Bell}
            label="Notifikasi Belajar"
            href="/account/notifications"
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
          />
          <SettingItem
            type="select"
            icon={Globe}
            label="Bahasa"
            value={language}
            onChange={setLanguage}
            disabled
            options={[
              { label: "ID", value: "id" },
              { label: "EN", value: "en" },
            ]}
            iconBgClass="bg-purple-100"
            iconColorClass="text-purple-600"
          />
        </SettingsGroup>

        <SettingsGroup title="TENTANG AKUN" delay={0.2}>
          <SettingItem
            type="link"
            icon={HelpCircle}
            label="Bantuan"
            href="/onboarding/guide"
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
          />
          <SettingItem
            type="link"
            icon={Clock}
            label="Riwayat Belajar"
            href="/account/sessions"
            iconBgClass="bg-indigo-100"
            iconColorClass="text-indigo-600"
          />
          <SettingItem
            type="link"
            icon={Flame}
            label="Streak Saya"
            href="/account/streak"
            iconBgClass="bg-amber-100"
            iconColorClass="text-amber-600"
          />
          <SettingItem
            type="link"
            icon={Archive}
            label="Arsip Tugas"
            href="/account/archive"
            iconBgClass="bg-neutral-100"
            iconColorClass="text-neutral-600"
          />
          <SettingItem
            type="link"
            icon={User}
            label="Edit Profil"
            href="/account/edit"
            iconBgClass="bg-violet-100"
            iconColorClass="text-violet-600"
          />
          <SettingItem
            type="link"
            icon={ShieldCheck}
            label="Kebijakan Privasi"
            href="/privacy"
            iconBgClass="bg-emerald-100"
            iconColorClass="text-emerald-600"
          />
        </SettingsGroup>

        <SettingsGroup title="LAINNYA" delay={0.3}>
          <SettingItem
            type="link"
            icon={MessageCircleWarning}
            label="Laporkan Masalah"
            href="/account/reports"
            iconBgClass="bg-rose-100"
            iconColorClass="text-rose-600"
          />
        </SettingsGroup>

        {/* Logout Section */}
        <motion.div
          className="pt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-white border border-red-100 flex items-center justify-center w-full px-4 py-4 rounded-[20px] hover:bg-red-50 active:scale-[0.98] transition-all duration-200 gap-2 shadow-sm text-error disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base font-bold">
              {isLoggingOut ? "Keluar..." : "Keluar"}
            </span>
          </button>
        </motion.div>
      </div>
    </>
  );
}
