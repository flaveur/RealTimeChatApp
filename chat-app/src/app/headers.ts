/**
 * headers.ts - Sikkerhets-headers Middleware
 * 
 * RedwoodSDK middleware som setter HTTP sikkerhets-headers på alle responses.
 * Beskytter mot vanlige web-angrep som XSS, clickjacking og MITM.
 * 
 * Sikkerhetstiltak:
 * - HSTS: Tvinger HTTPS-bruk
 * - X-Content-Type-Options: Forhindrer MIME-sniffing
 * - Referrer-Policy: Skjuler referrer-informasjon
 * - Permissions-Policy: Begrenser API-tilgang
 * - CSP: Definerer tillatte kilder for innhold
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */
import { RouteMiddleware } from "rwsdk/router";

/**
 * Middleware factory for sikkerhets-headers
 * 
 * Returnerer en middleware-funksjon som setter HTTP-headers
 * på alle utgående responses.
 * 
 * @returns RouteMiddleware funksjon
 */
export const setCommonHeaders =
  (): RouteMiddleware =>
  ({ response, rw: { nonce } }) => {
    if (!import.meta.env.VITE_IS_DEV_SERVER) {
      // HSTS: Tvinger HTTPS for 2 år, inkluderer subdomener
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
    }

    // Forhindrer nettleseren fra å gjette content-type
    response.headers.set("X-Content-Type-Options", "nosniff");

    // Skjuler referrer-URL i HTTP-headers
    response.headers.set("Referrer-Policy", "no-referrer");

    // Deaktiverer tilgang til sensitive nettleser-APIer
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    );

    // Content Security Policy (CSP):
    // - default-src 'self': Kun tillat innhold fra egen origin
    // - script-src: Tillat scripts fra egen origin + Cloudflare challenges
    // - style-src: Tillat stiler + Google Fonts
    // - nonce: Dynamisk nonce for inline scripts (XSS-beskyttelse)
    response.headers.set(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self' 'unsafe-eval' 'nonce-${nonce}' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'self'; frame-src 'self' https://challenges.cloudflare.com; object-src 'none';`,
    );
  };
