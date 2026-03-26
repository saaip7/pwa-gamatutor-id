"use client";

import React, { useMemo } from "react";

interface Particle {
  id: number;
  left: number;
  fallDuration: number;
  fallDelay: number;
  swayDuration: number;
  swayAmount: number;
  size: number;
  isIcon: boolean;
}

interface SnowfallParticlesProps {
  colorTheme?: "blue" | "amber";
}

export function SnowfallParticles({ colorTheme = "blue" }: SnowfallParticlesProps) {
  const particles = useMemo<Particle[]>(() => {
    const result: Particle[] = [];
    for (let i = 0; i < 18; i++) {
      result.push({
        id: i,
        left: Math.random() * 100,
        fallDuration: 4 + Math.random() * 6,
        fallDelay: -(Math.random() * 10),
        swayDuration: 2 + Math.random() * 4,
        swayAmount: -40 + Math.random() * 80,
        size: 3 + Math.random() * 5,
        isIcon: Math.random() > 0.35,
      });
    }
    return result;
  }, []);

  const themeVars = colorTheme === "amber"
    ? {
        "--particle-color": "rgba(252, 211, 77, 0.7)",
        "--particle-shadow": "rgba(245, 158, 11, 0.4)",
        "--particle-blur-inner": "rgba(245, 158, 11, 0.6)",
      }
    : {};

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={themeVars as React.CSSProperties}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute particle-container"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.fallDuration}s`,
            animationDelay: `${p.fallDelay}s`,
          }}
        >
          <div
            className="particle-inner"
            style={{
              animationDuration: `${p.swayDuration}s`,
              "--sway-amt": `${p.swayAmount}px`,
              "--rot-amt": `${-180 + Math.random() * 360}deg`,
            } as React.CSSProperties}
          >
            {p.isIcon ? (
              <svg
                className="particle-icon"
                width={10 + Math.random() * 14}
                height={10 + Math.random() * 14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" />
                <line x1="19.5" y1="4.5" x2="4.5" y2="19.5" />
              </svg>
            ) : (
              <div
                className="particle-blur"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
