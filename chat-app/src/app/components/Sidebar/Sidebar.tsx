'use client';

import { useEffect, useState } from 'react';
import UserStatus from "../shared/UserStatus";


export default function Sidebar() {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const handleNavigationStart = () => {
      setCurrentPath(window.location.pathname);
    };

    const interval = setInterval(() => {
      setCurrentPath(window.location.pathname);
    }, 100);

    window.addEventListener('popstate', handleNavigationStart);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handleNavigationStart);
    };
  }, []);

  const isActive = (path: string) => currentPath.startsWith(path);

  const getLinkClass = (path: string) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition";
    const isCurrentPage = isActive(path);
    return isCurrentPage
      ? `${baseClass} bg-blue-600 text-white hover:bg-blue-700`
      : `${baseClass} text-gray-300 hover:bg-gray-800/50`;
  };

  return (
    <aside className="w-56 border-r border-gray-800 flex flex-col bg-gray-950 py-4 flex-shrink-0">
      <div className="px-4 mb-4">
        <UserStatus />
      </div>

      <nav className="px-4 space-y-2">
        <a
          href="/messages"
          className={getLinkClass("/messages")}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Meldinger
        </a>
        <a
          href="/friends"
          className={getLinkClass("/friends")}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6 1h-2.5a3.5 3.5 0 0 0-3 1.6 3.5 3.5 0 0 0-3-1.6H6c-2.2 0-4 1.8-4 4v2h2v-2c0-1.1.9-2 2-2h2.5c.83 0 1.54.4 2 1 .46-.6 1.17-1 2-1H18c1.1 0 2 .9 2 2v2h2v-2c0-2.2-1.8-4-4-4z" />
          </svg>
          Venneliste
        </a>
        <a
          href="/notes"
          className={getLinkClass("/notes")}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Mine notater
        </a>
        <a
          href="/settings"
          className={getLinkClass("/settings")}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
          Innstillinger
        </a>
      </nav>
    </aside>
  );
}