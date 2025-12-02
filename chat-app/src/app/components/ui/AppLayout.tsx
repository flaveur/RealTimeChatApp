'use client';

import React from 'react';

export default function AppLayout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-transparent overflow-hidden">
      <header className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/50 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          {title && <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>}
        </div>
      </header>
      <div className="max-w-6xl mx-auto p-4 flex-1 overflow-y-auto w-full">{children}</div>
    </div>
  );
}
