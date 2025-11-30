"use client";
import React from 'react';

export default function useTheme() {
  const [theme, setTheme] = React.useState<'dark'|'light'>(() => {
    try {
      return (typeof window !== 'undefined' && (localStorage.getItem('theme') as 'dark'|'light')) || 'dark';
    } catch {
      return 'dark';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.style.backgroundColor = theme === 'dark' ? '#0f172a' : '#ffffff';
    } catch {}
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  return { theme, toggle, setTheme };
}
