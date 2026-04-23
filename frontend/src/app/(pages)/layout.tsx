import React from "react";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-screen flex flex-col font-sans text-neutral-800 relative overflow-hidden bg-neutral-50">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
