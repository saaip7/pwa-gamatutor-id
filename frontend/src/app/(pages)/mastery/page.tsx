"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Layers, 
  Zap, 
  Brain, 
  Crown, 
  Sprout, 
  Square, 
  Target, 
  Timer, 
  Flame, 
  BookOpen, 
  Compass, 
  Mountain, 
  TrendingUp, 
  Award 
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { MasterySVGDefs } from "@/components/feature/mastery/MasterySVGDefs";
import { MasterySection } from "@/components/feature/mastery/MasterySection";
import { MasteryBadgeCard } from "@/components/feature/mastery/MasteryBadgeCard";

export default function MasteryPage() {
  const router = useRouter();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col mx-auto overflow-hidden relative max-w-md">
      <MasterySVGDefs />

      {/* Header */}
      <header className="shrink-0 pt-14 pb-4 px-5 flex items-center justify-between bg-white z-50 sticky top-0 border-b border-neutral-100">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 -ml-2 flex items-center justify-center text-neutral-500 hover:text-neutral-900 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Mastery Gallery</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar bg-neutral-50/30">
        <motion.div 
          className="px-5 py-6 flex flex-col gap-10 pb-32"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          
          {/* 1. FOUNDATION */}
          <motion.div variants={itemVariants}>
            <MasterySection title="Foundation" icon={Layers} iconColor="text-emerald-500">
              <MasteryBadgeCard 
                title="Initiator" 
                description="Memulai langkah pertama dengan percaya diri." 
                shape="diamond" 
                icon={Sprout} 
                isUnlocked={true} 
              />
              <MasteryBadgeCard 
                title="Architect" 
                description="Membangun struktur belajar yang solid." 
                shape="diamond" 
                icon={Square} 
                isUnlocked={true} 
              />
            </MasterySection>
          </motion.div>

          {/* 2. PERFORMANCE */}
          <motion.div variants={itemVariants}>
            <MasterySection title="Performance" icon={Zap} iconColor="text-amber-500">
              <MasteryBadgeCard 
                title="Deep Diver" 
                description="Fokus mendalam tanpa distraksi." 
                shape="hexagon" 
                icon={Target} 
                isUnlocked={true} 
              />
              <MasteryBadgeCard 
                title="Marathoner" 
                description="Konsistensi belajar jangka panjang." 
                shape="hexagon" 
                icon={Timer} 
                isUnlocked={true} 
              />
              <MasteryBadgeCard 
                title="Ritualist" 
                description="Selesaikan 7 hari streak belajar." 
                shape="hexagon" 
                icon={Flame} 
                isUnlocked={true} 
              />
            </MasterySection>
          </motion.div>

          {/* 3. MINDSET */}
          <motion.div variants={itemVariants}>
            <MasterySection title="Mindset" icon={Brain} iconColor="text-indigo-500">
              <MasteryBadgeCard 
                title="Reflector" 
                description="Evaluasi diri pasca pembelajaran." 
                shape="circle" 
                icon={BookOpen} 
                isUnlocked={true} 
              />
              <MasteryBadgeCard 
                title="Strategist" 
                description="Buat 5 rencana belajar detail." 
                shape="circle" 
                icon={Compass} 
                isUnlocked={true} 
              />
              <MasteryBadgeCard 
                title="Explorer" 
                description="Selesaikan topik di luar zona nyaman." 
                shape="circle" 
                icon={Mountain} 
                isUnlocked={true} 
              />
            </MasterySection>
          </motion.div>

          {/* 4. MASTERY */}
          <motion.div variants={itemVariants}>
            <MasterySection title="Mastery" icon={Crown} iconColor="text-blue-500">
              <MasteryBadgeCard 
                title="Improver" 
                description="Tingkatkan skor di 3 kuis berturut." 
                shape="shield" 
                icon={TrendingUp} 
                isUnlocked={true} 
              />
              <MasteryBadgeCard 
                title="Zenith" 
                description="Capaian tertinggi. Master 3 kategori." 
                shape="shield" 
                icon={Award} 
                isUnlocked={true} 
              />
            </MasterySection>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
