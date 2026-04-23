"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingItemBase {
  icon: React.ElementType;
  label: string;
  description?: string;
  iconBgClass?: string;
  iconColorClass?: string;
  disabled?: boolean;
}

interface SettingLinkProps extends SettingItemBase {
  type: "link";
  href: string;
}

interface SettingToggleProps extends SettingItemBase {
  type: "toggle";
  isActive: boolean;
  onToggle: () => void;
}

interface SettingSelectProps extends SettingItemBase {
  type: "select";
  value: string;
  options: { label: string; value: string; flag?: string }[];
  onChange: (value: string) => void;
}

type SettingItemProps = SettingLinkProps | SettingToggleProps | SettingSelectProps;

export function SettingItem(props: SettingItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = props.icon;
  const { label, iconBgClass = "bg-neutral-100", iconColorClass = "text-neutral-600", disabled } = props;

  const baseContainerClasses = cn(
    "flex items-center justify-between px-4 py-4 border-b border-neutral-50 transition-colors last:border-b-0",
    disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-neutral-50/50 cursor-pointer"
  );

  const renderIconAndLabel = () => (
    <div className={cn("flex gap-3.5", props.description ? "items-start" : "items-center")}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBgClass, iconColorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-base font-semibold text-neutral-800 leading-tight flex items-center gap-2">
          {label}
          {disabled && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded-full">
              Segera hadir
            </span>
          )}
        </span>
        {props.description && (
          <p className="text-xs text-neutral-500 leading-snug pr-4">{props.description}</p>
        )}
      </div>
    </div>
  );

  if (props.type === "link") {
    return (
      <Link href={props.href} className={baseContainerClasses}>
        {renderIconAndLabel()}
        <ChevronRight className="text-neutral-400 w-5 h-5" />
      </Link>
    );
  }

  if (props.type === "toggle") {
    return (
      <div 
        className={cn(baseContainerClasses, !disabled && "active:bg-neutral-50/80")} 
        onClick={disabled ? undefined : props.onToggle}
      >
        {renderIconAndLabel()}
        <div
          className={cn(
            "w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 ml-4",
            props.isActive ? "bg-primary" : "bg-neutral-200"
          )}
        >
          <div className={cn(
            "absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out",
            props.isActive ? "translate-x-5" : "translate-x-0"
          )}></div>
        </div>
      </div>
    );
  }

  if (props.type === "select") {
    const selectedLabel = props.options.find(o => o.value === props.value)?.label;
    
    return (
      <div className="flex flex-col border-b border-neutral-50 last:border-b-0">
        <div 
          className="flex items-center justify-between px-4 py-4 transition-colors"
          style={disabled ? { cursor: "not-allowed", opacity: 0.4 } : { cursor: "pointer" }}
          onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
        >
          {renderIconAndLabel()}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-500">{selectedLabel}</span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ChevronDown className="text-neutral-400 w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* Custom Animated Accordion Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden bg-neutral-50/30"
            >
              <div className="px-4 pb-3 pt-1 space-y-1">
                {props.options.map((opt, i) => {
                  const isSelected = opt.value === props.value;
                  return (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        props.onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-[14px] transition-all active:scale-[0.98]",
                        isSelected 
                          ? "bg-primary/10 text-primary font-bold shadow-[inset_0_2px_4px_rgba(59,130,246,0.05)]" 
                          : "text-neutral-600 hover:bg-neutral-100 font-medium"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {opt.flag && <span className="text-base">{opt.flag}</span>}
                        <span>{opt.label}</span>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-4 h-4 text-primary" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
