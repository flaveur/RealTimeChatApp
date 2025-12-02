/**
 * useAuth Hook - Autentisering for klientside
 * 
 * Denne hooken håndterer autentisering på klientsiden:
 * - Lagrer brukerdata i localStorage for persistens
 * - Tilbyr login/logout funksjoner
 * - Synkroniserer state med localStorage
 * 
 * MERK: Dette er en enkel implementasjon. For produksjon bør man
 * vurdere mer robuste løsninger som:
 * - Token-refresh mekanismer
 * - HttpOnly cookies (som vi bruker for session)
 * - Context/Provider pattern for global tilgang
 * 
 * Kode skrevet med assistanse fra AI (GitHub Copilot / Claude).
 */

"use client";
import React from 'react';

/**
 * Henter lagret brukerdata fra localStorage
 * Returnerer null hvis ingen bruker er lagret eller ved parse-feil
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null; // Returnerer null ved JSON parse-feil
  }
}

/**
 * Custom hook for autentisering
 * 
 * Brukes i komponenter som trenger tilgang til innlogget bruker:
 * const { user, login, logout } = useAuth();
 * 
 * @returns Objekt med user state og login/logout funksjoner
 */
export default function useAuth() {
  // Initialiserer state med eventuell lagret bruker
  const [user, setUser] = React.useState<any>(() => getStoredUser());

  // Synkroniser localStorage når user endres
  React.useEffect(() => {
    try {
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    } catch {} // Ignorer localStorage-feil (f.eks. i privat modus)
  }, [user]);

  /**
   * Logger inn bruker via API
   * 
   * @param username - Brukernavn
   * @param password - Passord (klartekst, sendes over HTTPS)
   * @returns Brukerobjekt ved suksess
   * @throws Error ved feil (feil brukernavn/passord, nettverksfeil)
   */
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

  /**
   * Logger ut bruker
   * 
   * @param redirect - URL å omdirigere til etter utlogging (default: '/')
   */
  function logout(redirect = '/') {
    try { localStorage.removeItem('user'); } catch {}
    setUser(null);
    if (redirect) window.location.href = redirect;
  }

  return { user, setUser, login, logout };
}
