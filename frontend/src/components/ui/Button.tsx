import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", isLoading = false, leftIcon, rightIcon, children, disabled, ...props },
    ref
  ) => {
    // Base styles from the design
    const baseStyles = "w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100";

    // Variant-specific styles
    const variants = {
      primary: "bg-primary text-white shadow-[0_2px_10px_rgba(59,130,246,0.15)] hover:bg-primary-hover hover:shadow-[0_4px_12px_rgba(59,130,246,0.25)]",
      outline: "bg-white border border-neutral-200 text-neutral-800 hover:bg-neutral-50",
      ghost: "bg-transparent text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {!isLoading && leftIcon && <span className="flex items-center justify-center">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex items-center justify-center">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
