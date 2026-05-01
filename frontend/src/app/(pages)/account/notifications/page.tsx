"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Users,
  MoonStar,
  Clock,
  BellOff,
  BellRing,
  Loader2,
  ShieldCheck,
  Timer,
  Flame,
  BookOpen,
  Mail,
  Smartphone,
  Info,
} from "lucide-react";
import { SettingsHeader } from "@/components/feature/settings/SettingsHeader";
import { usePreferencesStore } from "@/stores/preferences";
import { registerFcm } from "@/lib/fcm";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PushToggles {
  deadline: boolean;
  smartReminder: boolean;
  socialPresence: boolean;
  streakNudge: boolean;
  studySession: boolean;
}

interface EmailToggles {
  deadline: boolean;
  smartReminder: boolean;
  socialPresence: boolean;
  streakNudge: boolean;
  studySession: boolean;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Toggle({
  active,
  onToggle,
  disabled,
}: {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      className={cn(
        "w-[44px] h-6 rounded-full relative transition-colors duration-200 shrink-0 focus:outline-none",
        disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
        active ? "bg-primary" : "bg-neutral-200"
      )}
      disabled={disabled}
    >
      <div
        className={cn(
          "absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-in-out",
          active ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function NotificationRow({
  icon: Icon,
  label,
  description,
  pushActive,
  emailActive,
  onPushToggle,
  onEmailToggle,
  pushDisabled,
  delay = 0,
  isLast = false,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  pushActive: boolean;
  emailActive: boolean;
  onPushToggle: () => void;
  onEmailToggle: () => void;
  pushDisabled?: boolean;
  delay?: number;
  isLast?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "px-4 py-4 transition-colors",
        !isLast && "border-b border-neutral-100/80"
      )}
    >
      {/* Top: icon + label + description */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
          <Icon className="w-[18px] h-[18px] text-neutral-600" />
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[15px] font-semibold text-neutral-800 leading-tight">
            {label}
          </span>
          <p className="text-xs text-neutral-500 leading-snug">{description}</p>
        </div>
      </div>

      {/* Bottom: two toggle rows */}
      <div className="mt-3 pl-[52px] flex flex-col gap-2.5">
        {/* Notifikasi HP */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[13px] text-neutral-600">Notifikasi HP</span>
            {pushDisabled && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-500 px-1.5 py-0.5 rounded-full">
                Nonaktif
              </span>
            )}
          </div>
          <Toggle active={pushActive} onToggle={onPushToggle} disabled={pushDisabled} />
        </div>

        {/* Email */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[13px] text-neutral-600">Notifikasi Email</span>
          </div>
          <Toggle active={emailActive} onToggle={onEmailToggle} />
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function NotificationSettingsPage() {
  const fetchPrefs = usePreferencesStore((s) => s.fetchPreferences);
  const prefs = usePreferencesStore((s) => s.preferences);
  const updateNotifications = usePreferencesStore((s) => s.updateNotifications);

  // Push toggles
  const [push, setPush] = useState<PushToggles>({
    deadline: true,
    smartReminder: true,
    socialPresence: true,
    streakNudge: true,
    studySession: true,
  });

  // Email toggles
  const [email, setEmail] = useState<EmailToggles>({
    deadline: true,
    smartReminder: false,
    socialPresence: false,
    streakNudge: false,
    studySession: false,
  });

  // Quiet schedule
  const [quietSchedule, setQuietSchedule] = useState(false);
  const [quietTime, setQuietTime] = useState({ start: "22:00", end: "07:00" });

  // Browser permission
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | "unsupported">("default");
  const [requesting, setRequesting] = useState(false);

  const fcmGranted = browserPermission === "granted";

  useEffect(() => {
    if (!("Notification" in window)) {
      setBrowserPermission("unsupported");
    } else {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    setRequesting(true);
    try {
      const token = await registerFcm();
      if (token) {
        setBrowserPermission("granted");
        toast.success("Notifikasi diaktifkan");
      } else {
        if ("Notification" in window) setBrowserPermission(Notification.permission);
        toast.error("Izin notifikasi ditolak");
      }
    } catch {
      toast.error("Gagal mengaktifkan notifikasi");
    } finally {
      setRequesting(false);
    }
  };

  // Fetch preferences on mount if not loaded
  useEffect(() => {
    if (!prefs) {
      fetchPrefs();
    }
  }, []);

  // Sync local state from DB when preferences load
  useEffect(() => {
    if (prefs?.notifications) {
      const n = prefs.notifications;
      setPush({
        deadline: n.push_enabled ?? true,
        smartReminder: n.smart_reminder_enabled ?? true,
        socialPresence: n.social_presence_enabled ?? false,
        streakNudge: n.push_enabled ?? true,
        studySession: n.push_enabled ?? true,
      });
      const e = n.email ?? {};
      setEmail({
        deadline: e.deadline ?? true,
        smartReminder: e.smart_reminder ?? false,
        socialPresence: e.social_presence ?? false,
        streakNudge: e.streak_nudge ?? false,
        studySession: e.study_session ?? false,
      });
      setQuietSchedule(n.quiet_hours?.enabled ?? false);
      setQuietTime({
        start: n.quiet_hours?.start || "22:00",
        end: n.quiet_hours?.end || "07:00",
      });
    }
  }, [prefs]);

  const handlePushToggle = (key: keyof PushToggles) => {
    setPush((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmailToggle = (key: keyof EmailToggles) => {
    setEmail((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    const data: Record<string, unknown> = {
      deadline: push.deadline,
      smartReminder: push.smartReminder,
      socialPresence: push.socialPresence,
      quietSchedule,
      quietTime: { start: quietTime.start, end: quietTime.end },
      email: {
        deadline: email.deadline,
        smart_reminder: email.smartReminder,
        streak_nudge: email.streakNudge,
        social_presence: email.socialPresence,
        study_session: email.studySession,
      },
    };
    await updateNotifications(data);
  };

  return (
    <div className="w-full h-screen bg-neutral-50 flex flex-col mx-auto overflow-hidden relative max-w-md">
      <SettingsHeader title="Notifikasi Belajar" onSave={handleSave} />

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-28 space-y-8">
        {/* Intro text */}
        <div className="rounded-xl bg-blue-50/50 border border-blue-100/60 px-4 py-3.5 flex gap-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-neutral-600 leading-relaxed">
            Notifikasi HP kadang terlewat atau terlambat sampai, jadi kami sediakan opsi{" "}
            <span className="font-semibold text-neutral-700">notifikasi email</span> juga.{" "}
            Semua pengaturan di bawah opsional — silakan atur sesuai kebutuhanmu.
          </p>
        </div>

        {/* ── Browser Permission Status ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "rounded-2xl border overflow-hidden",
            fcmGranted
              ? "bg-emerald-50/50 border-emerald-200/60"
              : browserPermission === "denied"
                ? "bg-amber-50/50 border-amber-200/60"
                : "bg-white border-neutral-200"
          )}
        >
          <div className="flex items-center gap-3.5 px-4 py-4">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                fcmGranted
                  ? "bg-emerald-100"
                  : browserPermission === "denied"
                    ? "bg-amber-100"
                    : "bg-neutral-100"
              )}
            >
              {fcmGranted ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : browserPermission === "denied" ? (
                <BellOff className="w-5 h-5 text-amber-600" />
              ) : (
                <BellRing className="w-5 h-5 text-neutral-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900">
                {fcmGranted
                  ? "Notifikasi diizinkan"
                  : browserPermission === "denied"
                    ? "Notifikasi diblokir"
                    : "Notifikasi belum diaktifkan"}
              </p>
              <p className="text-xs text-neutral-500 leading-snug mt-0.5">
                {fcmGranted
                  ? "Browser sudah mengizinkan notifikasi."
                  : browserPermission === "denied"
                    ? "Buka pengaturan browser untuk mengizinkan notifikasi."
                    : "Aktifkan untuk mendapat pengingat belajar."}
              </p>
            </div>
            {browserPermission === "default" && (
              <button
                onClick={handleRequestPermission}
                disabled={requesting}
                className="shrink-0 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-50 shadow-sm"
              >
                {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aktifkan"}
              </button>
            )}
          </div>
        </motion.div>

        {/* ── FCM Limitation Info ── */}
        {!fcmGranted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-blue-100 bg-blue-50/40 px-4 py-3.5 flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-blue-900 leading-snug">
                Belum bisa aktifkan notifikasi HP?
              </p>
              <p className="text-[11px] text-blue-700/80 leading-snug mt-0.5">
                Tidak masalah. Kamu bisa tetap dapat pengingat lewat email — cukup aktifkan toggle
                &quot;Kirim lewat email&quot; di bawah sesuai kebutuhanmu.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── PENGINGAT BELAJAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="text-xs font-bold text-neutral-400 tracking-wider mb-2 px-2">
            PENGINGAT BELAJAR
          </h3>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <NotificationRow
              icon={Timer}
              label="Deadline"
              description="Peringatan jika tugas mendekati batas waktu"
              pushActive={push.deadline}
              emailActive={email.deadline}
              onPushToggle={() => handlePushToggle("deadline")}
              onEmailToggle={() => handleEmailToggle("deadline")}
              pushDisabled={!fcmGranted}
              delay={0.12}
            />
            <NotificationRow
              icon={Zap}
              label="Smart Reminder"
              description="Pengingat belajar di waktu paling produktifmu"
              pushActive={push.smartReminder}
              emailActive={email.smartReminder}
              onPushToggle={() => handlePushToggle("smartReminder")}
              onEmailToggle={() => handleEmailToggle("smartReminder")}
              pushDisabled={!fcmGranted}
              delay={0.14}
            />
            <NotificationRow
              icon={Flame}
              label="Streak Nudge"
              description="Dorongan biar streak belajarmu tetap terjaga"
              pushActive={push.streakNudge}
              emailActive={email.streakNudge}
              onPushToggle={() => handlePushToggle("streakNudge")}
              onEmailToggle={() => handleEmailToggle("streakNudge")}
              pushDisabled={!fcmGranted}
              delay={0.16}
            />
            <NotificationRow
              icon={Users}
              label="Social Presence"
              description="Kabar jika teman-temanmu sedang aktif belajar"
              pushActive={push.socialPresence}
              emailActive={email.socialPresence}
              onPushToggle={() => handlePushToggle("socialPresence")}
              onEmailToggle={() => handleEmailToggle("socialPresence")}
              pushDisabled={!fcmGranted}
              delay={0.18}
            />
            <NotificationRow
              icon={BookOpen}
              label="Sesi Belajar"
              description="Status sesi belajar seperti peringatan idle"
              pushActive={push.studySession}
              emailActive={email.studySession}
              onPushToggle={() => handlePushToggle("studySession")}
              onEmailToggle={() => handleEmailToggle("studySession")}
              pushDisabled={!fcmGranted}
              delay={0.2}
              isLast
            />
          </div>
        </motion.div>

        {/* ── JADWAL HENING ── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3 className="text-xs font-bold text-neutral-400 tracking-wider mb-2 px-2">
            JADWAL HENING
          </h3>
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3.5 px-4 py-4 border-b border-neutral-100/80">
              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
                <MoonStar className="w-[18px] h-[18px] text-neutral-600" />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-[15px] font-semibold text-neutral-800 leading-tight">
                  Jadwal Hening
                </span>
                <p className="text-xs text-neutral-500 leading-snug">
                  Matikan semua notifikasi selama jam istirahat.
                </p>
              </div>
              <Toggle
                active={quietSchedule}
                onToggle={() => setQuietSchedule((v) => !v)}
              />
            </div>

            {/* Time Pickers */}
            <div
              className={cn(
                "px-4 py-5 bg-white transition-all duration-300",
                !quietSchedule && "opacity-40 grayscale pointer-events-none"
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
                      onChange={(e) => setQuietTime((p) => ({ ...p, start: e.target.value }))}
                      disabled={!quietSchedule}
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
                      onChange={(e) => setQuietTime((p) => ({ ...p, end: e.target.value }))}
                      disabled={!quietSchedule}
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
