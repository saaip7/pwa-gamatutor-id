"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Bell, BellRing, BellOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { registerFcm } from "@/lib/fcm";
import { cn } from "@/lib/utils";

interface Step4NotificationProps {
  onComplete: () => void;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

type NotifState = "idle" | "loading" | "granted" | "denied" | "unsupported";

export function Step4Notification({ onComplete }: Step4NotificationProps) {
  const [state, setState] = useState<NotifState>("idle");

  const handleEnable = async () => {
    setState("loading");
    try {
      const token = await registerFcm();
      setState(token ? "granted" : "denied");
    } catch {
      setState("denied");
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <>
      <div className="flex-1 flex flex-col justify-start text-left max-w-sm mx-auto w-full pt-6 pb-32">
        <motion.div
          className="mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            {state === "granted" ? (
              <BellRing className="w-7 h-7 text-primary" />
            ) : (
              <Bell className="w-7 h-7 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 tracking-tight mb-3">
            {state === "granted"
              ? "Notifikasi aktif!"
              : "Jangan sampai lupa belajar"}
          </h1>
          <p className="text-neutral-500 text-base leading-relaxed">
            {state === "granted"
              ? "Kamu akan mendapat reminder saat deadline mendekat dan streak mulai putus."
              : "Aktifkan notifikasi untuk reminder deadline, streak nudge, dan update progress belajarmu."}
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          {[
            { icon: Bell, title: "Reminder Deadline", desc: "Notifikasi 24 jam sebelum deadline tugas", color: "bg-amber-50 text-amber-600" },
            { icon: ShieldCheck, title: "Streak Nudge", desc: "Pengingat supaya streak belajarmu tidak putus", color: "bg-blue-50 text-primary" },
            { icon: BellRing, title: "Update Progress", desc: "Notifikasi milestone dan pencapaian baru", color: "bg-emerald-50 text-emerald-600" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-neutral-100 rounded-xl p-4 flex items-start gap-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]"
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="font-bold text-neutral-800 text-sm">{item.title}</h3>
                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.footer
        className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-100 px-6 pb-[34px] pt-4 z-40"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-sm mx-auto w-full flex flex-col gap-2.5">
          {state === "idle" && (
            <Button
              onClick={handleEnable}
              className="py-4 text-lg shadow-[0_4px_14px_rgba(59,130,246,0.25)] rounded-xl"
              leftIcon={<Bell className="w-5 h-5" />}
            >
              Aktifkan Notifikasi
            </Button>
          )}

          {state === "loading" && (
            <Button
              isLoading
              className="py-4 text-lg rounded-xl"
            >
              Mengaktifkan...
            </Button>
          )}

          {state === "granted" && (
            <Button
              onClick={onComplete}
              className="py-4 text-lg shadow-[0_8px_16px_-4px_rgba(59,130,246,0.3)] rounded-xl"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Lanjut
            </Button>
          )}

          {state === "denied" && (
            <>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl mb-1">
                <BellOff className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-medium">
                  Notifikasi ditolak. Kamu bisa mengaktifkannya nanti di Pengaturan browser.
                </p>
              </div>
              <Button
                onClick={onComplete}
                className="py-4 text-lg shadow-[0_4px_14px_rgba(59,130,246,0.25)] rounded-xl"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Lanjut
              </Button>
            </>
          )}

          {state === "unsupported" && (
            <>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl mb-1">
                <BellOff className="w-4 h-4 text-neutral-400 shrink-0" />
                <p className="text-xs text-neutral-500 font-medium">
                  Browser ini belum mendukung notifikasi push.
                </p>
              </div>
              <Button
                onClick={onComplete}
                className="py-4 text-lg shadow-[0_4px_14px_rgba(59,130,246,0.25)] rounded-xl"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Lanjut
              </Button>
            </>
          )}

          {(state === "idle" || state === "loading") && (
            <button
              onClick={handleSkip}
              disabled={state === "loading"}
              className="text-sm font-medium text-neutral-400 py-2 active:text-neutral-600 transition-colors disabled:opacity-50"
            >
              Lewati untuk sekarang
            </button>
          )}
        </div>
      </motion.footer>
    </>
  );
}
