"use client";

import { useEffect, useState, useRef } from "react";
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

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const fetchPreferences = usePreferencesStore((s) => s.fetchPreferences);
  const preferences = usePreferencesStore((s) => s.preferences);
  const fetchBadges = useBadgesStore((s) => s.fetchBadges);
  const [checking, setChecking] = useState(true);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const lsToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!lsToken) {
      router.replace("/login");
      setChecking(false);
      return;
    }

    if (isAuthenticated && user && preferences) {
      setChecking(false);
      return;
    }

    setChecking(true);
    const profileP = fetchProfile();
    const prefP = fetchPreferences();
    const badgesP = fetchBadges();

    Promise.allSettled([profileP, prefP, badgesP])
      .then(([profileResult]) => {
        if (profileResult.status === "rejected") {
          const err = profileResult.reason;
          const isNetErr =
            err instanceof TypeError ||
            (err instanceof Error && err.message === "Failed to fetch");
          if (isNetErr && user) {
            return;
          }
          router.replace("/login");
          return;
        }
        registerFcm().catch((e) => console.error("[FCM] registerFcm failed:", e));
        listenForegroundMessages().catch((e) => console.error("[FCM] listenForegroundMessages failed:", e));
      })
      .finally(() => setChecking(false));
  }, [token, isAuthenticated, user, preferences, fetchProfile, fetchPreferences, fetchBadges, router]);

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
