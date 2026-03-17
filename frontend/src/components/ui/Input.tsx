import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconWrapper?: React.ReactNode; // For things like the eye icon in password
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, iconWrapper, id, ...props }, ref) => {
    // Generate a stable ID if none is provided, useful for linking label to input
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-800">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full px-4 py-3.5 bg-neutral-50 border rounded-xl text-neutral-800 placeholder-neutral-400 text-base transition-all duration-200 outline-none focus:bg-white focus:ring-4",
              error
                ? "border-error focus:border-error focus:ring-error/10"
                : "border-neutral-200 focus:border-primary focus:ring-primary/10",
              className
            )}
            {...props}
          />
          {iconWrapper}
        </div>
        {error && <p className="text-xs text-error mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
