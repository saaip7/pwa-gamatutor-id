import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export function PageHeader({ title, subtitle, rightAction }: PageHeaderProps) {
  return (
    <header className="shrink-0 pt-14 pb-4 px-6 bg-white sticky top-0 z-20 border-b border-neutral-100 flex items-center justify-between">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-neutral-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {rightAction && (
        <div className="flex items-center gap-3">
          {rightAction}
        </div>
      )}
    </header>
  );
}
