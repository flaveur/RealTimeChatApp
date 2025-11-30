"use client";

import React from 'react';
import useTheme from '@/app/hooks/useTheme';
import useAuth from '@/app/hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full md:w-64 h-full p-4 md:border-r border-b md:border-b-0 border-gray-800">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">ChatApp</h2>
      </div>

      <nav className="flex flex-row md:flex-col gap-2">
        <a className="px-3 py-2 rounded hover:bg-gray-800 block" href="/">Home</a>
        {user ? (
          <>
            <a className="px-3 py-2 rounded hover:bg-gray-800 block" href="/messages">Messages</a>
            <a className="px-3 py-2 rounded hover:bg-gray-800 block" href="/friends">Friends</a>
            <button className="px-3 py-2 rounded bg-gray-800 text-left w-full text-left" onClick={() => logout('/')}>Logout</button>
          </>
        ) : (
          <>
            <a className="px-3 py-2 rounded hover:bg-gray-800 block" href="/login">Login</a>
            <a className="px-3 py-2 rounded hover:bg-gray-800 block" href="/register">Register</a>
          </>
        )}
      </nav>

      <div className="mt-6">
        <button
          aria-label="Toggle theme"
          className="px-3 py-2 rounded bg-gray-800"
          onClick={toggle}
        >
          Toggle Theme
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
