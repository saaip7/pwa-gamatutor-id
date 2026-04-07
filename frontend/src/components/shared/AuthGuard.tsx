"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { usePreferencesStore } from "@/stores/preferences";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const fetchPreferences = usePreferencesStore((s) => s.fetchPreferences);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile()
        .then(() => fetchPreferences())
        .catch(() => {
          router.replace("/login");
        })
        .finally(() => setChecking(false));
    } else {
      router.replace("/login");
      setChecking(false);
    }
  }, [token, fetchProfile, fetchPreferences, router]);

  if (checking) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
