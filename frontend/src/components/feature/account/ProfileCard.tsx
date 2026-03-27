"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProfileCardProps {
  name: string;
  title: string;
}

export function ProfileCard({ name, title }: ProfileCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 flex flex-row items-center gap-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Left Column: Avatar Frame */}
      <div className="w-[96px] h-[96px] shrink-0 rounded-[24px] bg-blue-50 border border-blue-100 flex items-end justify-center overflow-hidden relative shadow-[inset_0_2px_8px_rgba(59,130,246,0.05)]">
        {/* Character Bust-up Graphic */}
        <div className="w-[86px] h-[98px] translate-y-1">
          <svg width="100%" height="100%" viewBox="0 0 96 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
            {/* Neck */}
            <rect x="42" y="40" width="12" height="15" fill="#FFCDB2"/>
            {/* Head */}
            <rect x="30" y="10" width="36" height="36" rx="14" fill="#FFD2B8"/>
            {/* Hair */}
            <path d="M28 20C28 10 38 6 48 6C58 6 68 10 68 20H28Z" fill="#1F2937"/>
            <path d="M68 16C72 20 72 26 68 30V16Z" fill="#1F2937"/>
            {/* Torso */}
            <path d="M26 110C26 75 32 55 48 55C64 55 70 75 70 110" fill="var(--color-primary)"/>
            {/* Tie / Collar */}
            <path d="M42 55L48 65L54 55Z" fill="#E5E7EB"/>
            <path d="M46 65L48 85L50 65Z" fill="var(--color-primary-hover)"/>
            {/* Glasses */}
            <rect x="34" y="24" width="12" height="8" rx="2" fill="#1F2937" fillOpacity="0.1" stroke="#1F2937" strokeWidth="2"/>
            <rect x="50" y="24" width="12" height="8" rx="2" fill="#1F2937" fillOpacity="0.1" stroke="#1F2937" strokeWidth="2"/>
            <path d="M46 28H50" stroke="#1F2937" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {/* Right Column: User Details */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight leading-tight">{name}</h2>
        <p className="text-sm font-medium text-primary mt-0.5 mb-3">{title}</p>
        
        {/* CTA Button */}
        <Link 
          href="/account/wardrobe" 
          className="inline-flex w-fit px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-700 text-xs font-semibold items-center justify-center hover:bg-neutral-50 active:bg-neutral-100 transition-all shadow-sm"
        >
          Sesuaikan Karakter
        </Link>
      </div>
    </motion.div>
  );
}
