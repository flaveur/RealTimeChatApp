"use client";
import React from 'react';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function useAuth() {
  const [user, setUser] = React.useState<any>(() => getStoredUser());

  React.useEffect(() => {
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    } catch {}
  }, [user]);

  async function login(username: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user || null);
    return data.user;
  }

  function logout(redirect = '/') {
    try { localStorage.removeItem('user'); } catch {}
    setUser(null);
    if (redirect) window.location.href = redirect;
  }

  return { user, setUser, login, logout };
}
