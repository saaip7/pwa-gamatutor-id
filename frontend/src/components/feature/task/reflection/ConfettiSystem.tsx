"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: string;
  startX: number;
  startY: number;
  tx: number;
  ty: number;
  color: string;
  width: number;
  height: number;
  duration: number;
  rotation: number;
  delay: number;
  borderRadius: string;
}

export function ConfettiSystem() {
  const colors = [
    "#3B82F6",
    "#10b981",
    "#f59e0b",
    "#FB7185",
    "#a78bfa",
    "#22D3EE",
    "#FDE047",
    "#8CD2FF",
  ];

  const particles = useMemo(() => {
    const p: Particle[] = [];

    for (let i = 0; i < 50; i++) {
      const side = Math.floor(Math.random() * 3);
      const startX = side === 0 ? -20 : side === 1 ? 102 : 50 + (Math.random() - 0.5) * 60;
      const startY = side === 2 ? -10 : 40 + Math.random() * 20;
      const tx = (Math.random() - 0.5) * 80;
      const ty = 20 + Math.random() * 70;
      const size = 6 + Math.random() * 10;
      const isCircle = Math.random() < 0.35;
      const isLong = !isCircle && Math.random() < 0.4;

      p.push({
        id: `p-${i}`,
        startX,
        startY,
        tx,
        ty,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: isCircle ? size : isLong ? size * 0.5 : size * 0.8,
        height: isCircle ? size : isLong ? size * 2.2 : size,
        duration: 1.8 + Math.random() * 1.5,
        rotation: (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.4,
        borderRadius: isCircle ? "50%" : "2px",
      });
    }

    return p;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[150]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            opacity: 0,
            scale: 0.3,
            rotate: 0,
          }}
          animate={{
            left: `${p.startX + p.tx}%`,
            top: `${p.startY + p.ty}%`,
            opacity: [0, 1, 1, 1, 0],
            scale: [0.3, 1.2, 1, 1, 0.6],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.22, 0.61, 0.36, 1],
          }}
          className="absolute"
          style={{
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
          }}
        />
      ))}
    </div>
  );
}
