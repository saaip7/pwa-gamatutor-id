"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Target } from "lucide-react";

const SPLASH_KEY = "splash_done";

export default function SplashPage() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // If already logged in, go straight to dashboard
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
      return;
    }

    // Check sessionStorage — if "splash_done" exists, this is a warm start
    const alreadyShown = sessionStorage.getItem(SPLASH_KEY);
    if (alreadyShown) {
      router.replace("/login");
      return;
    }

    // Cold start: show splash
    setShowSplash(true);

    const exitTimer = setTimeout(() => setIsExiting(true), 2500);
    const redirectTimer = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, "1");
      router.replace("/login");
    }, 3100);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  // Don't render anything while deciding (prevents flash)
  if (showSplash === null) {
    return null;
  }

  return (
    <div
      className={`w-full h-screen bg-white flex flex-col font-sans relative overflow-hidden ${
        isExiting ? "page-exit" : ""
      }`}
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[60px] pointer-events-none z-0 bg-glow-layer animate-bg-glow-sec" />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0 bg-glow-layer animate-bg-glow-main" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-14 pb-[34px] px-6 z-10 main-content-layer">
        {/* Logo Icon */}
        <div className="animate-fade-in-up flex flex-col items-center mb-6">
          <div className="relative w-20 h-20 animate-float-pulse">
            {/* Background glow */}
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-lg animate-icon-bg-glow -z-10" />
            {/* Icon Box */}
            <div className="w-full h-full rounded-2xl bg-neutral-50 border border-neutral-200 text-primary flex items-center justify-center shadow-[0_4px_20px_rgba(59,130,246,0.08)] animate-glow-pulse z-10 relative">
              <Target className="w-10 h-10" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* App Name — letter stagger */}
        <h1 className="text-3xl font-bold text-neutral-800 tracking-tight flex items-center justify-center">
          {"Gamatutor".split("").map((char, i) => (
            <span
              key={i}
              className="inline-block animate-text-stagger"
              style={{ animationDelay: `${100 + i * 30}ms` }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Tagline */}
        <p
          className="text-neutral-500 mt-2 text-base font-medium animate-tagline tracking-wide"
          style={{ animationDelay: "200ms" }}
        >
          Master Your Study
        </p>

        {/* Loading Dots */}
        <div
          className="flex items-center justify-center gap-1.5 mt-8 h-4 animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/40 animate-dot"
              style={{ animationDelay: `${i * 150}ms`, opacity: 0.4 + i * 0.2 }}
            />
          ))}
        </div>
      </main>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        @keyframes floatPulse {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        .animate-float-pulse {
          animation: floatPulse 3s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.08); }
          50% { box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2); }
        }
        .animate-glow-pulse {
          animation: glowPulse 3s ease-in-out infinite;
        }

        @keyframes iconBgGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        .animate-icon-bg-glow {
          animation: iconBgGlow 4s ease-in-out infinite;
        }

        @keyframes textScaleUp {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-text-stagger {
          opacity: 0;
          animation: textScaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes letterSpacingAnim {
          from { opacity: 0; transform: translateY(12px); letter-spacing: -0.05em; }
          to { opacity: 1; transform: translateY(0); letter-spacing: 0.025em; }
        }
        .animate-tagline {
          opacity: 0;
          animation: letterSpacingAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes bgGlowMain {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        .animate-bg-glow-main {
          transform: translate(-50%, -50%);
          animation: bgGlowMain 4s ease-in-out infinite;
        }

        @keyframes bgGlowSec {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
        }
        .animate-bg-glow-sec {
          opacity: 0.3;
          transform: translate(-50%, -50%);
          animation: bgGlowSec 5s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-dot {
          opacity: 0.3;
          animation: dotPulse 1.2s ease-in-out infinite;
        }

        /* Exit animations */
        @keyframes pageExitBg {
          to { opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes pageExitContent {
          to { opacity: 0; transform: translateY(8px); }
        }

        .page-exit .bg-glow-layer {
          animation: pageExitBg 0.6s ease-out forwards !important;
        }
        .page-exit .main-content-layer {
          animation: pageExitContent 0.6s ease-out forwards !important;
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, ::before, ::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
