'use client';

import React from 'react';

export default function AppLayout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      <header className="p-4 border-b bg-white/50 dark:bg-gray-900/50 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          {title && <h1 className="text-lg font-semibold">{title}</h1>}
        </div>
      </header>
      <div className="max-w-6xl mx-auto p-4 flex-1 overflow-y-auto w-full">{children}</div>
    </div>
  );
}
