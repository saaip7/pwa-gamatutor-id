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
  scale: number;
}

export function ConfettiSystem() {
  const colors = ["#FDE047", "#60A5FA", "#FB7185", "#34D399", "#A78BFA", "#22D3EE"];
  
  // Reduced count for better mobile performance (30 particles total)
  const particles = useMemo(() => {
    const p: Particle[] = [];
    
    // Emitters using viewport-based calculations
    // Left
    for (let i = 0; i < 10; i++) {
      p.push({
        id: `l-${i}`,
        startX: -50, startY: 300,
        tx: Math.random() * 300 + 100, ty: Math.random() * 400 + 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 8, height: 4,
        duration: 2, rotation: Math.random() * 360,
        delay: Math.random() * 0.1, scale: 1
      });
    }
    // Right
    for (let i = 0; i < 10; i++) {
      p.push({
        id: `r-${i}`,
        startX: 400, startY: 300,
        tx: -(Math.random() * 300 + 100), ty: Math.random() * 400 + 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 8, height: 4,
        duration: 2, rotation: Math.random() * 360,
        delay: Math.random() * 0.1, scale: 1
      });
    }
    // Top
    for (let i = 0; i < 10; i++) {
      p.push({
        id: `t-${i}`,
        startX: 180, startY: -50,
        tx: (Math.random() - 0.5) * 200, ty: 600,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 8, height: 4,
        duration: 2.5, rotation: Math.random() * 360,
        delay: Math.random() * 0.2, scale: 1
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
            x: p.startX, 
            y: p.startY, 
            opacity: 1, 
            scale: 0.2, 
            rotate: 0 
          }}
          animate={{ 
            x: p.startX + p.tx,
            y: p.startY + p.ty, 
            opacity: [1, 1, 0], 
            scale: p.scale, 
            rotate: p.rotation 
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className="absolute rounded-sm"
          style={{ 
            width: p.width, 
            height: p.height, 
            backgroundColor: p.color 
          }}
        />
      ))}
    </div>
  );
}
