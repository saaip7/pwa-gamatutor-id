"use client";

import React from "react";

interface CharacterAvatarProps {
  skinColor?: string;
  hoodieColor?: string;
  pantsColor?: string;
  hairColor?: string;
  className?: string;
}

export function CharacterAvatar({ 
  skinColor = "#ffe4e1", 
  hoodieColor = "#3b82f6", 
  pantsColor = "#334155",
  hairColor = "#1e293b",
  className 
}: CharacterAvatarProps) {
  return (
    <div className={className}>
      <svg viewBox="0 0 200 300" className="w-full h-full">
        <defs>
          <linearGradient id="skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={skinColor} />
            <stop offset="100%" stopColor="#f5c5c0" />
          </linearGradient>
          <linearGradient id="hoodie-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={hoodieColor} />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="pants-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={pantsColor} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Legs/Pants */}
        <rect x="75" y="190" width="22" height="75" rx="11" fill="url(#pants-grad)"/>
        <rect x="103" y="190" width="22" height="75" rx="11" fill="url(#pants-grad)"/>
        
        {/* Shoes */}
        <path d="M68 255 h30 v12 a8 8 0 0 1 -8 8 h-14 a8 8 0 0 1 -8 -8 z" fill="#ffffff" />
        <path d="M102 255 h30 v12 a8 8 0 0 1 -8 8 h-14 a8 8 0 0 1 -8 -8 z" fill="#ffffff" />

        {/* Body/Hoodie */}
        <rect x="65" y="110" width="70" height="95" rx="24" fill="url(#hoodie-grad)"/>
        
        {/* Arms */}
        <rect x="45" y="120" width="24" height="75" rx="12" transform="rotate(12 57 120)" fill="url(#hoodie-grad)"/>
        <rect x="131" y="120" width="24" height="75" rx="12" transform="rotate(-12 143 120)" fill="url(#hoodie-grad)"/>

        {/* Hands */}
        <circle cx="42" cy="188" r="12" fill="url(#skin-grad)"/>
        <circle cx="158" cy="188" r="12" fill="url(#skin-grad)"/>

        {/* Head */}
        <rect x="65" y="35" width="70" height="65" rx="28" fill="url(#skin-grad)"/>
        
        {/* Face */}
        <circle cx="85" cy="75" r="4.5" fill="#1e293b"/>
        <circle cx="115" cy="75" r="4.5" fill="#1e293b"/>
        <path d="M92 88 q 8 6 16 0" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

        {/* Hair */}
        <path d="M60 45 c0 -35 80 -35 80 0 c0 -5 5 15 0 25 c -5 -15 -10 -20 -20 -20 c -20 -5 -30 10 -40 25 c -5 -10 -15 -20 -20 -30 z" fill={hairColor}/>
      </svg>
    </div>
  );
}
