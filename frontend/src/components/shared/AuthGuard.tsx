"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";
import { useBadgesStore } from "@/stores/badges";
import { registerFcm, listenForegroundMessages } from "@/lib/fcm";
import { BadgeCelebrationManager } from "@/components/shared/BadgeCelebrationManager";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const fetchPreferences = usePreferencesStore((s) => s.fetchPreferences);
  const fetchBadges = useBadgesStore((s) => s.fetchBadges);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile()
        .then(() => fetchPreferences())
        .then(() => fetchBadges())
        .then(() => {
          registerFcm().catch((e) => console.error("[FCM] registerFcm failed:", e));
          listenForegroundMessages().catch((e) => console.error("[FCM] listenForegroundMessages failed:", e));
        })
        .catch(() => {
          router.replace("/login");
        })
        .finally(() => setChecking(false));
    } else {
      router.replace("/login");
      setChecking(false);
    }
  }, [token, fetchProfile, fetchPreferences, fetchBadges, router]);

  if (checking) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
      <BadgeCelebrationManager />
    </>
  );
}
