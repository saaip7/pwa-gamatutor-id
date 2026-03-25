"use client";

import React from "react";

export function MasterySVGDefs() {
  return (
    <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none">
      <defs>
        {/* Emerald Gradients */}
        <linearGradient id="em-dark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#047857"/><stop offset="1" stopColor="#10B981"/></linearGradient>
        <linearGradient id="em-light" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#10B981"/><stop offset="1" stopColor="#34D399"/></linearGradient>
        
        {/* Amber Gradients */}
        <linearGradient id="am-dark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#B45309"/><stop offset="1" stopColor="#F59E0B"/></linearGradient>
        <linearGradient id="am-light" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#F59E0B"/><stop offset="1" stopColor="#FCD34D"/></linearGradient>

        {/* Indigo Gradients */}
        <linearGradient id="in-dark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#4338CA"/><stop offset="1" stopColor="#6366F1"/></linearGradient>
        <linearGradient id="in-light" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#6366F1"/><stop offset="1" stopColor="#A5B4FC"/></linearGradient>

        {/* Blue Gradients */}
        <linearGradient id="bl-dark" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#1D4ED8"/><stop offset="1" stopColor="#3B82F6"/></linearGradient>
        <linearGradient id="bl-light" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#3B82F6"/><stop offset="1" stopColor="#93C5FD"/></linearGradient>
        <linearGradient id="bl-gold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#F59E0B"/><stop offset="1" stopColor="#FDE047"/></linearGradient>

        {/* SHAPES */}
        <g id="badge-diamond">
          <polygon points="50,5 95,50 50,95 5,50" fill="url(#em-dark)"/>
          <polygon points="50,14 86,50 50,86 14,50" fill="url(#em-light)"/>
          <polygon points="50,14 86,50 50,50 14,50" fill="white" opacity="0.2"/>
          <path d="M20,50 L50,20 L80,50" fill="none" stroke="#047857" strokeWidth="1.5" opacity="0.4"/>
        </g>

        <g id="badge-hexagon">
          <polygon points="50,5 90,28 90,72 50,95 10,72 10,28" fill="url(#am-dark)"/>
          <polygon points="50,15 82,34 82,66 50,85 18,66 18,34" fill="url(#am-light)"/>
          <polygon points="50,15 82,34 18,34" fill="white" opacity="0.25"/>
          <circle cx="50" cy="50" r="26" fill="none" stroke="#B45309" strokeWidth="2" opacity="0.3"/>
        </g>

        <g id="badge-circle">
          <circle cx="50" cy="50" r="45" fill="url(#in-dark)"/>
          <circle cx="50" cy="50" r="37" fill="url(#in-light)"/>
          <circle cx="50" cy="50" r="33" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6"/>
          <path d="M13,50 A37,37 0 0,1 87,50" fill="white" opacity="0.15"/>
          <circle cx="50" cy="50" r="41" fill="none" stroke="#4338CA" strokeWidth="1" opacity="0.5"/>
        </g>

        <g id="badge-shield">
          <path d="M50,45 Q85,20 95,35 Q80,55 60,65 Z" fill="url(#bl-gold)" opacity="0.9"/>
          <path d="M50,45 Q15,20 5,35 Q20,55 40,65 Z" fill="url(#bl-gold)" opacity="0.9"/>
          <path d="M15,20 L50,5 L85,20 C85,65 65,85 50,95 C35,85 15,65 15,20 Z" fill="url(#bl-dark)"/>
          <path d="M23,26 L50,14 L77,26 C77,60 61,78 50,86 C39,78 23,60 23,26 Z" fill="url(#bl-light)"/>
          <path d="M23,26 L50,14 L77,26 C77,45 50,45 23,26 Z" fill="white" opacity="0.2"/>
          <path d="M30,30 L50,20 L70,30 C70,55 58,70 50,78 C42,70 30,55 30,30 Z" fill="none" stroke="#1E3A8A" strokeWidth="1.5" opacity="0.4"/>
        </g>
      </defs>
    </svg>
  );
}
