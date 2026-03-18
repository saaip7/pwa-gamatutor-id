"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Star, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Step1WelcomeProps {
  onNext: () => void;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto w-full my-8">
      {/* App Icon / Illustration Graphic */}
      <motion.div
        className="relative w-56 h-56 mb-8 flex items-center justify-center"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        {/* Depth Layers / Background Glows */}
        <div className="absolute w-44 h-44 bg-primary/10 rounded-full blur-xl animate-glow-pulse"></div>
        <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-md animate-glow-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute w-24 h-24 bg-blue-300/30 rounded-full blur-sm animate-glow-pulse" style={{ animationDelay: "2s" }}></div>

        {/* Rotating Rings */}
        <div className="absolute w-48 h-48 rounded-full border border-primary/20 border-dashed animate-rotate-ring"></div>
        <div className="absolute w-40 h-40 rounded-full border-[1.5px] border-primary/10 animate-rotate-ring-ccw"></div>
        <div className="absolute w-56 h-56 rounded-full border border-blue-400/20 border-dotted opacity-50 animate-rotate-ring" style={{ animationDuration: "16s" }}></div>

        {/* Orbiting Micro-Elements on Rings */}
        <div className="absolute w-48 h-48 animate-rotate-ring">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-primary/60 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-blue-400/80 rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_6px_rgba(96,165,250,0.8)]"></div>
        </div>
        <div className="absolute w-40 h-40 animate-rotate-ring-ccw">
          <div className="absolute top-1/2 -left-[1px] w-2.5 h-2.5 bg-cyan-400/60 rounded-full -translate-y-1/2 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute w-full h-full pointer-events-none">
          <div className="absolute top-[15%] left-[25%] w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3B82F6] animate-twinkle"></div>
          <div className="absolute top-[85%] right-[20%] w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_6px_#93C5FD] animate-twinkle" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-[35%] right-[8%] w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_4px_#22D3EE] animate-twinkle" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute bottom-[15%] left-[35%] w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_5px_#818CF8] animate-twinkle" style={{ animationDelay: "2s" }}></div>
          <div className="absolute top-[20%] right-[30%] w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_#60A5FA] animate-twinkle" style={{ animationDelay: "1.5s" }}></div>
          <div className="absolute bottom-[25%] right-[45%] w-1 h-1 bg-white rounded-full shadow-[0_0_4px_#ffffff] animate-twinkle" style={{ animationDelay: "0.8s" }}></div>
        </div>

        {/* Main Icon Container */}
        <div className="relative z-10 w-24 h-24 bg-white rounded-[28px] shadow-[0_12px_40px_rgba(59,130,246,0.15)] border border-white flex items-center justify-center text-primary animate-pulse-scale overflow-hidden">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white to-blue-50/50"></div>
          <svg viewBox="0 0 268 315" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 relative z-10 drop-shadow-sm">
            <path d="M168.536 81.0709C186.147 84.0782 202.534 91.1063 216.72 101.144C205.616 102.972 196.165 112.96 196.165 124.33C196.165 136.918 204.989 140.908 217.578 140.908C227.692 138.246 233.701 129.429 238.139 120.467C256.663 141.624 268 169.204 268 198.928C266.111 234.059 250.77 266.504 226.648 288.694L209.979 275.598C205.835 279.282 197.41 286.787 196.856 287.34C196.304 287.893 179.127 293.097 170.608 295.629C154.264 298.392 121.442 304.053 120.877 304.608C120.407 305.078 116.904 309.248 114.451 312.183C85.6494 302.207 61.3541 281.036 46.7039 254.292L72.5251 231.392L111.206 196.166L127.093 181.66L156.794 206.526L157.345 207.001C163.027 211.801 167.998 213.433 176.134 213.433C194.826 213.433 209.979 197.971 209.979 178.897C209.979 159.823 194.826 144.361 176.134 144.361C173.521 144.361 170.978 144.663 168.536 145.235V125.021H179.588V125.004C179.817 125.014 180.048 125.021 180.279 125.021C189.053 125.021 196.165 117.908 196.165 109.134C196.165 100.361 189.053 93.2479 180.279 93.2476C180.048 93.2476 179.817 93.2534 179.588 93.2632V93.2476H168.536V81.0709Z" fill="#83B2FF"/>
            <mask id="mask0_42_54" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="46" y="81" width="222" height="232">
              <path opacity="0.5" d="M168.536 81.0709C186.147 84.0781 202.533 91.1062 216.719 101.144C205.615 102.972 196.165 112.961 196.165 124.33C196.165 136.919 204.989 140.907 217.577 140.907C227.692 138.246 233.701 129.429 238.14 120.466C256.664 141.623 268 169.203 268 198.928C266.111 234.059 250.771 266.505 226.648 288.695L209.979 275.598C205.835 279.282 197.408 286.788 196.856 287.34C196.303 287.893 179.127 293.096 170.608 295.629C154.261 298.392 121.429 304.056 120.876 304.608C120.406 305.079 116.906 309.248 114.453 312.183C85.6512 302.208 61.3553 281.037 46.7046 254.292L72.5257 231.392L111.206 196.165L127.093 181.66L156.794 206.526C162.71 211.693 167.736 213.433 176.134 213.433C194.826 213.433 209.979 197.971 209.979 178.897C209.979 172.762 208.41 167.003 205.661 162.009L208.705 158.557L202.558 157.32C196.356 149.421 186.825 144.361 176.134 144.361C173.522 144.361 170.979 144.663 168.536 145.235V125.021H179.588V125.003C179.817 125.013 180.047 125.021 180.278 125.021C189.052 125.021 196.165 117.908 196.165 109.134C196.165 100.36 189.052 93.2475 180.278 93.2475C180.047 93.2475 179.817 93.2539 179.588 93.2637V93.2475H168.536V81.0709Z" fill="#D9D9D9"/>
            </mask>
            <g mask="url(#mask0_42_54)">
              <path d="M169.226 250.041V209.289L158.175 200.309L127.092 178.206L104.989 197.547L169.226 250.041Z" fill="#3B82F6"/>
            </g>
            <path d="M84.2681 69.7629L169.918 0V201L127.093 163.701L84.2681 201V69.7629Z" fill="#3B82F6"/>
            <mask id="mask1_42_54" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="84" y="0" width="86" height="202">
              <path d="M84.2681 69.7629L169.918 0V201L127.093 163.701L84.2681 201V69.7629Z" fill="#D9D9D9"/>
            </mask>
            <g mask="url(#mask1_42_54)">
              <path d="M180.279 77.3608L84.2684 149.887L80.1241 152.65L79.4333 208.598H175.444L180.279 77.3608Z" fill="#2C71E2"/>
            </g>
            <path d="M71.835 231.392L111.206 196.165L212.504 277.6C189.984 300.253 158.796 314.279 124.33 314.279C55.6646 314.279 0.000135073 258.614 0 189.949C0 140.042 29.4052 97.0034 71.835 77.2125V231.392Z" fill="#3B82F6"/>
          </svg>
        </div>

        {/* Floating accent elements */}
        <div className="absolute top-6 right-8 text-yellow-400 z-20">
          <div className="animate-float" style={{ animationDelay: "1s" }}>
            <Star className="w-6 h-6 fill-current drop-shadow-md" />
          </div>
        </div>
        <div className="absolute bottom-8 left-6 text-green-500 z-20">
          <div className="animate-float" style={{ animationDelay: "0.5s" }}>
            <div className="bg-white rounded-full p-1.5 shadow-md border border-neutral-50">
              <TrendingUp className="w-[18px] h-[18px]" />
            </div>
          </div>
        </div>
        <div className="absolute top-1/2 -right-2 text-primary/60 z-20">
          <div className="animate-float" style={{ animationDuration: "4.5s", animationDelay: "2s" }}>
            <Sparkles className="w-6 h-6 drop-shadow-sm" />
          </div>
        </div>
      </motion.div>

      {/* Typography */}
      <motion.div
        className="space-y-4 w-full"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-3xl font-extrabold text-neutral-800 tracking-tight leading-tight">
          Welcome to <br />
          <span className="text-primary">Gamatutor</span>
        </h1>
        <p className="text-neutral-500 text-[15px] leading-relaxed px-2">
          Level up your learning experience. Manage your study tasks, track your progress, and earn rewards along the way.
        </p>
      </motion.div>

      {/* Bottom Call to Action */}
      <motion.div
        className="w-full mt-auto shrink-0 pt-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ delay: 0.2 }}
      >
        <Button onClick={onNext} className="py-4 text-[17px] shadow-[0_4px_14px_rgba(59,130,246,0.25)] rounded-xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}
