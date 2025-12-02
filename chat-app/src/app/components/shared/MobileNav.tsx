'use client';

import { useEffect, useState } from 'react';

export default function MobileNav() {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const interval = setInterval(() => {
      setCurrentPath(window.location.pathname);
    }, 100);

    window.addEventListener('popstate', () => setCurrentPath(window.location.pathname));
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const isActive = (path: string) => currentPath.startsWith(path);

  const getLinkClass = (path: string) => {
    const baseClass = "flex flex-col items-center justify-center gap-1 py-2 px-3 text-xs font-medium transition-colors";
    return isActive(path)
      ? `${baseClass} text-blue-600 dark:text-blue-400`
      : `${baseClass} text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white`;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        <a href="/messages" className={getLinkClass("/messages")}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Meldinger</span>
        </a>
        
        <a href="/friends" className={getLinkClass("/friends")}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4"/>
            <path d="M12 14c-4 0-6 2-6 4v4h12v-4c0-2-2-4-6-4z"/>
          </svg>
          <span>Venner</span>
        </a>
        
        <a href="/notes" className={getLinkClass("/notes")}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Notater</span>
        </a>
        
        <a href="/settings" className={getLinkClass("/settings")}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
          <span>Instillinger</span>
        </a>
      </div>
    </nav>
  );
}
