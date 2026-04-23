"use client";

import React, { useState, useEffect, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";

interface HelpModalProps {
  title: string;
  children: ReactNode;
}

export function HelpButton({ title, children }: HelpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors active:scale-95"
        aria-label={title}
      >
        <Info className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[85dvh] flex flex-col overflow-hidden z-[81]"
            >
              <div className="shrink-0 flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
                <h2 className="text-lg font-bold text-neutral-800 tracking-tight">{title}</h2>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 rounded-full text-neutral-500 transition-colors shrink-0"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

interface HelpItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function HelpItem({ icon, title, description }: HelpItemProps) {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-primary-600">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
        <p className="text-sm text-neutral-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
