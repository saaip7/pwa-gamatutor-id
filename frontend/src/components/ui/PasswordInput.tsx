"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input, InputProps } from "./Input";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<InputProps, "type" | "iconWrapper"> {
  forgotPasswordHref?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, forgotPasswordHref, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    const eyeIcon = (
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-500 transition-colors focus:outline-none rounded-lg active:bg-neutral-100"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    );

    const labelContent = (
      <div className="flex justify-between items-center w-full">
        {label && <span className="block text-sm font-medium text-neutral-800">{label}</span>}
        {forgotPasswordHref && (
          <Link
            href={forgotPasswordHref}
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
          >
            Forgot?
          </Link>
        )}
      </div>
    );

    return (
      <div className="space-y-1.5 w-full">
        {labelContent}
        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            ref={ref}
            className={cn(
              "w-full pl-4 pr-12 py-3.5 bg-neutral-50 border rounded-xl text-neutral-800 placeholder-neutral-400 text-base transition-all duration-200 outline-none focus:bg-white focus:ring-4",
              props.error
                ? "border-error focus:border-error focus:ring-error/10"
                : "border-neutral-200 focus:border-primary focus:ring-primary/10",
              className
            )}
            {...props}
          />
          {eyeIcon}
        </div>
        {props.error && <p className="text-xs text-error mt-1">{props.error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
