"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
  title: string;
  onSave?: () => Promise<void> | void;
}

export function SettingsHeader({ title, onSave }: SettingsHeaderProps) {
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSave = async () => {
    if (!onSave || saveStatus !== "idle") return;
    
    setSaveStatus("loading");
    try {
      await onSave();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("idle");
    }
  };

  return (
    <header className="shrink-0 pt-14 pb-4 px-6 bg-white sticky top-0 z-20 border-b border-neutral-100 flex items-center justify-between">
      <button 
        onClick={() => router.back()}
        className="w-10 h-10 -ml-2 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors rounded-full active:bg-neutral-50"
      >
        <ArrowLeft className="w-5.5 h-5.5" />
      </button>
      
      <h1 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">{title}</h1>
      
      {onSave ? (
        <button 
          type="button" 
          onClick={handleSave}
          disabled={saveStatus !== "idle"}
          className={cn(
            "px-2 py-1.5 -mr-2 flex items-center gap-1.5 font-bold text-sm transition-all rounded-lg active:scale-95",
            saveStatus === "idle" && "text-primary hover:bg-primary/5",
            saveStatus === "loading" && "text-neutral-400 cursor-not-allowed",
            saveStatus === "success" && "text-emerald-500 bg-emerald-50"
          )}
        >
          {saveStatus === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : saveStatus === "success" ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Simpan</span>
            </>
          )}
        </button>
      ) : (
        <div className="w-10 h-10 -mr-2" /> // Spacer
      )}
    </header>
  );
}
