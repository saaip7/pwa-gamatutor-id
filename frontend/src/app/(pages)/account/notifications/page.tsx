"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Zap, Users, MoonStar, Clock } from "lucide-react";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { SettingsGroup } from "@/components/feature/account/SettingsGroup";
import { SettingItem } from "@/components/feature/account/SettingItem";
import { cn } from "@/lib/utils";

export default function NotificationSettingsPage() {
  // Notification Toggles State
  const [preferences, setPreferences] = useState({
    deadline: true,
    smartReminder: true,
    socialPresence: true,
    quietSchedule: true,
  });

  // Quiet Schedule Time State
  const [quietTime, setQuietTime] = useState({
    start: "22:00",
    end: "07:00",
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log("Saving Notification Preferences:", { preferences, quietTime });
  };

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col mx-auto overflow-hidden relative max-w-md">
      <SettingsHeader title="Notifikasi Belajar" onSave={handleSave} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-28 space-y-6">
        <div className="px-2 mb-2">
          <p className="text-sm text-neutral-500 leading-relaxed">
            Atur preferensi notifikasi sesuai kenyamananmu. Pengaturan ini sepenuhnya <span className="font-bold text-neutral-700">opsional</span> untuk memberimu kendali penuh atas atensimu.
          </p>
        </div>

        {/* Group 1: PENGINGAT BELAJAR */}
        <SettingsGroup title="PENGINGAT BELAJAR" delay={0.1}>
          <SettingItem
            type="toggle"
            icon={CalendarClock}
            label="Deadline Tugas"
            description="Dapatkan pengingat saat tugas mendekati batas waktu."
            isActive={preferences.deadline}
            onToggle={() => handleToggle("deadline")}
            iconBgClass="bg-neutral-50"
            iconColorClass="text-neutral-600"
          />
          <SettingItem
            type="toggle"
            icon={Zap}
            label="Smart Study Reminder"
            description="Pengingat belajar di waktu paling produktifmu."
            isActive={preferences.smartReminder}
            onToggle={() => handleToggle("smartReminder")}
            iconBgClass="bg-neutral-50"
            iconColorClass="text-neutral-600"
          />
          <SettingItem
            type="toggle"
            icon={Users}
            label="Social Presence"
            description="Kabar jika teman-temanmu sedang aktif belajar sekarang."
            isActive={preferences.socialPresence}
            onToggle={() => handleToggle("socialPresence")}
            iconBgClass="bg-neutral-50"
            iconColorClass="text-neutral-600"
          />
        </SettingsGroup>

        {/* Group 2: JADWAL HENING */}
        <motion.section 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="text-xs font-bold text-neutral-400 tracking-wider mb-3 px-2">JADWAL HENING</h3>
          <div className="bg-white rounded-[24px] border border-neutral-100 shadow-sm overflow-hidden">
            
            {/* Header Info with Toggle */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-50 bg-neutral-50/30">
              <div className="flex items-start gap-3.5 pr-4">
                <div className="mt-0.5 w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  <MoonStar className="w-5 h-5 text-neutral-600" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-base font-bold text-neutral-900 leading-tight">Jadwal Hening</h4>
                  <p className="text-xs text-neutral-500 leading-snug">Matikan semua notifikasi selama jam istirahat.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("quietSchedule")}
                className={cn(
                  "w-11 h-6 rounded-full relative transition-colors focus:outline-none shrink-0",
                  preferences.quietSchedule ? "bg-primary" : "bg-neutral-200"
                )}
              >
                <div className={cn(
                  "absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                  preferences.quietSchedule ? "translate-x-5" : "translate-x-0"
                )}></div>
              </button>
            </div>
            
            {/* Time Pickers Section */}
            <div 
              className={cn(
                "px-4 py-6 bg-white transition-all duration-300",
                !preferences.quietSchedule && "opacity-40 grayscale pointer-events-none"
              )}
            >
              <div className="flex flex-row items-center gap-3">
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
                    Mulai
                  </label>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input 
                      type="time" 
                      value={quietTime.start}
                      onChange={(e) => setQuietTime(prev => ({ ...prev, start: e.target.value }))}
                      disabled={!preferences.quietSchedule}
                      className="w-full pl-8 pr-2 py-2.5 text-xs bg-neutral-50 border border-neutral-100 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-neutral-800"
                    />
                  </div>
                </div>
                
                <div className="w-4 h-[2px] bg-neutral-100 mt-5 rounded-full shrink-0" />
                
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pl-1">
                    Berakhir
                  </label>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                    <input 
                      type="time" 
                      value={quietTime.end}
                      onChange={(e) => setQuietTime(prev => ({ ...prev, end: e.target.value }))}
                      disabled={!preferences.quietSchedule}
                      className="w-full pl-8 pr-2 py-2.5 text-xs bg-neutral-50 border border-neutral-100 rounded-xl focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-neutral-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
