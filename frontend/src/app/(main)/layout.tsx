import React from "react";
import { BottomNavigation } from "@/components/shared/BottomNavigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex flex-col font-sans text-neutral-800 relative overflow-hidden bg-neutral-50">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-0 pb-[90px]">
        <div className="max-w-md mx-auto w-full min-h-full bg-neutral-50 relative">
          {children}
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
