import React from "react";
import { BottomNavigation } from "@/components/shared/BottomNavigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex flex-col font-sans text-neutral-800 relative overflow-hidden bg-neutral-50">
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-[90px]">
        <div className="max-w-md md:max-w-lg mx-auto w-full min-h-full bg-neutral-50 relative">
          {children}
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
