import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes efficiently.
 * Resolves conflicts (e.g., px-4 and px-6) by keeping the last provided class.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
