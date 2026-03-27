"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewTaskHeaderProps {
  isValid: boolean;
  onSave: () => void;
}

export function NewTaskHeader({ isValid, onSave }: NewTaskHeaderProps) {
  const router = useRouter();

  return (
    <header className="shrink-0 pt-10 pb-3 px-4 flex items-center justify-between bg-neutral-50/90 backdrop-blur-md z-20 sticky top-0 border-b border-neutral-200/60">
      <button 
        onClick={() => router.back()}
        className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full active:bg-neutral-200 transition-colors text-neutral-700"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <h1 className="text-lg md:text-xl font-bold tracking-tight text-neutral-900">Tugas Baru</h1>
      
      <button 
        onClick={onSave}
        disabled={!isValid} 
        className={cn(
          "px-2 transition-colors",
          isValid ? "text-primary font-semibold" : "text-neutral-400 font-medium"
        )}
      >
        Simpan
      </button>
    </header>
  );
}
