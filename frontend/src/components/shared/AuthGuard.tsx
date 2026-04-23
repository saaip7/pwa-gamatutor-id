"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";
import { useBadgesStore } from "@/stores/badges";
import { registerFcm, listenForegroundMessages } from "@/lib/fcm";
import { BadgeCelebrationManager } from "@/components/shared/BadgeCelebrationManager";

const ONBOARDING_PATHS = ["/onboarding", "/onboarding/guide"];
const ONBOARDING_GUIDE_PREFIX = "/onboarding/guide";

function isOnboardingPath(pathname: string) {
  return ONBOARDING_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isGuidePath(pathname: string) {
  return pathname === ONBOARDING_GUIDE_PREFIX || pathname.startsWith(ONBOARDING_GUIDE_PREFIX + "/");
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const fetchPreferences = usePreferencesStore((s) => s.fetchPreferences);
  const preferences = usePreferencesStore((s) => s.preferences);
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

  useEffect(() => {
    if (checking || !user) return;
    if (user.role === "admin") {
      router.replace("/admin/users");
    }
  }, [checking, user, router]);

  useEffect(() => {
    if (checking || !preferences) return;
    if (isOnboardingPath(pathname)) return;

    const onboardingDone = preferences.onboarding?.completed;
    if (onboardingDone === false) {
      router.replace("/onboarding");
    }
  }, [checking, preferences, pathname, router]);

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
