"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token is still valid by fetching profile
      fetchProfile()
        .catch(() => {
          // Token invalid — will be cleared in store
          router.replace("/login");
        })
        .finally(() => setChecking(false));
    } else {
      router.replace("/login");
      setChecking(false);
    }
  }, [token, fetchProfile, router]);

  if (checking) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-50">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
