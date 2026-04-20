import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";

export function GoalsHeader() {
  return (
    <PageHeader
      title="Goals"
      subtitle="Pantau progres menuju target belajarmu"
      rightAction={
        <button
          type="button"
          className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors active:scale-95"
          aria-label="Filter goals"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      }
    />
  );
}
