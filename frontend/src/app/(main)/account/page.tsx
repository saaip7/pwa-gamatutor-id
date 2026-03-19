"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Bell, Globe, User, ShieldCheck, LogOut } from "lucide-react";
import { AccountHeader } from "@/components/feature/account/AccountHeader";
import { ProfileCard } from "@/components/feature/account/ProfileCard";
import { SettingsGroup } from "@/components/feature/account/SettingsGroup";
import { SettingItem } from "@/components/feature/account/SettingItem";

// TODO: Fetch from API or Context
const MOCK_USER = {
  name: "Alex Walker",
  title: "The Strategist",
};

export default function AccountPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("id");

  return (
    <>
      <AccountHeader />

      <div className="flex-1 overflow-y-auto relative z-0 pb-[100px] px-5 pt-6 space-y-6">
        <ProfileCard name={MOCK_USER.name} title={MOCK_USER.title} />

        <SettingsGroup title="PENGATURAN APLIKASI" delay={0.1}>
          <SettingItem
            type="toggle"
            icon={Moon}
            label="Mode Gelap"
            isActive={isDarkMode}
            onToggle={() => setIsDarkMode(!isDarkMode)}
            iconBgClass="bg-neutral-100"
            iconColorClass="text-neutral-600"
          />
          <SettingItem
            type="link"
            icon={Bell}
            label="Notifikasi Belajar"
            href="/notifications"
            iconBgClass="bg-primary/10"
            iconColorClass="text-primary"
          />
          <SettingItem
            type="select"
            icon={Globe}
            label="Bahasa"
            value={language}
            onChange={setLanguage}
            options={[
              { label: "Indonesia", value: "id", flag: "🇮🇩" },
              { label: "English", value: "en", flag: "🇺🇸" },
            ]}
            iconBgClass="bg-purple-100" // Closer to the design's purple-50
            iconColorClass="text-purple-600" // Closer to the design's purple-500
          />
        </SettingsGroup>

        <SettingsGroup title="TENTANG AKUN" delay={0.2}>
          <SettingItem
            type="link"
            icon={User}
            label="Edit Profil"
            href="/account/edit"
            iconBgClass="bg-amber-100"
            iconColorClass="text-amber-600"
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

        {/* Logout Section */}
        <motion.div 
          className="pt-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <button 
            onClick={() => console.log("Logout clicked")}
            className="bg-white border border-red-100 flex items-center justify-center w-full px-4 py-4 rounded-[20px] hover:bg-red-50 active:scale-[0.98] transition-all duration-200 gap-2 shadow-sm text-error"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[15px] font-bold">Keluar</span>
          </button>
        </motion.div>
      </div>
    </>
  );
}
