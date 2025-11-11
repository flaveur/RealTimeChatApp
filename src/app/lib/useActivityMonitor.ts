/**
 * useActivityMonitor.ts
 * 
 * Implementert med GitHub Copilot
 * 
 * React hook som automatisk overvåker brukeraktivitet og håndterer status-endringer:
 * - Setter status til "away" etter 5 minutter uten aktivitet
 * - Setter status tilbake til "online" når bruker blir aktiv igjen
 * - Kun aktiv for brukere med status "online" (respekterer manuell "busy"-status)
 * 
 * Funksjonalitet:
 * - Lytter til mus-, tastatur-, touch- og scroll-events
 * - Resetter timer ved enhver aktivitet
 * - Automatisk cleanup ved unmount
 */

import { useEffect, useRef } from "react";
import { rwsdk } from "./rwsdk";

/**
 * Hook som overvåker brukeraktivitet og setter status til "away" etter 5 minutter inaktivitet.
 * Kun aktiv hvis brukerens nåværende status er "online".
 * 
 * Copilot: Denne hooken brukes i AppLayout.tsx for å automatisk
 * håndtere brukerens tilgjengelighetsstatus basert på aktivitet.
 */
export function useActivityMonitor() {
  // Refs for å holde timer-ID og om bruker ble satt til "away" automatisk
  const timeoutRef = useRef<number | null>(null);
  const wasAwayRef = useRef(false);

  useEffect(() => {
    // Sjekk om vi kjører i nettleser (for SSR-kompatibilitet)
    if (typeof window === "undefined") return;

    const INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutter i millisekunder

    /**
     * Resetter inaktivitets-timeren ved brukeraktivitet
     * Copilot: Denne funksjonen kalles hver gang brukeren interagerer med siden
     */
    function resetTimer() {
      // Clear eksisterende timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const user = rwsdk.auth.useCurrentUser();
      
      // Hvis bruker var "away" automatisk og nå er aktiv igjen, sett tilbake til "online"
      // Copilot: Dette sikrer at automatisk "away" reverseres ved aktivitet
      if (wasAwayRef.current && user?.status === "away") {
        rwsdk.auth.setStatus("online");
        wasAwayRef.current = false;
      }

      // Kun sett timer hvis bruker er "online"
      // Copilot: Respekterer manuell "busy"-status, endrer ikke den automatisk
      if (user?.status === "online") {
        timeoutRef.current = setTimeout(() => {
          const currentUser = rwsdk.auth.useCurrentUser();
          // Dobbeltsjekk at bruker fortsatt er "online" før vi setter "away"
          if (currentUser?.status === "online") {
            rwsdk.auth.setStatus("away");
            wasAwayRef.current = true;  // Marker at vi satt "away" automatisk
          }
        }, INACTIVITY_TIME);
      }
    }

    // Events som indikerer brukeraktivitet
    // Copilot: Dekker de vanligste interaksjonsformene (mus, tastatur, touch)
    const events = [
      "mousedown",   // Museklikk
      "mousemove",   // Musebevegelse
      "keypress",    // Tastetrykk
      "scroll",      // Scrolling
      "touchstart",  // Touch-interaksjon (mobil)
      "click",       // Klikk
    ];

    // Legg til event listeners for alle aktivitets-events
    // Copilot: `true` som tredje argument aktiverer capture phase for raskere deteksjon
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, true);
    });

    // Start initial timer når hook mountes
    resetTimer();

    // Cleanup-funksjon som kjører ved unmount
    // Copilot: Viktig for å unngå memory leaks
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, []); // Tom dependency array - kjører kun ved mount/unmount
}
