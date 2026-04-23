"use client";

import React, { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 drawer-backdrop-enter"
        onClick={handleBackdropClick}
      />
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-md bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.2)] flex flex-col max-h-[92dvh] drawer-sheet-enter">
        <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />
        <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-50 shrink-0">
          <h2 className="text-lg font-bold text-neutral-800 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-[calc(32px+env(safe-area-inset-bottom,24px))]">
          {children}
        </div>
      </div>
    </div>
  );
}
