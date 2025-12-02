/**
 * Auth Handlers - Håndterer HTTP requests for autentisering
 * 
 * Disse handlerne er mellomleddet mellom HTTP-forespørsler og
 * forretningslogikken i authController. De håndterer:
 * - HTTP-metode validering
 * - Request parsing og validering
 * - Feilhåndtering og HTTP-statuskoder
 * - Cookie-setting for sessions
 * 
 * Kode skrevet med assistanse fra AI (GitHub Copilot / Claude).
 */

import { registerUser, loginUser } from './authController';
import { getEnv } from '../../lib/env';

/**
 * Handler for brukerregistrering (POST /api/auth/register)
 * 
 * Forventet request body:
 * {
 *   username: string (påkrevd),
 *   password: string (påkrevd),
 *   displayName?: string (valgfritt)
 * }
 * 
 * Mulige responser:
 * - 201: Bruker opprettet
 * - 400: Mangler username/password
 * - 405: Feil HTTP-metode
 * - 409: Brukernavn allerede i bruk
 * - 500: Serverfeil
 */
export async function registerHandler(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv(); // Hent miljøvariabler

  // Bare tillat POST
  if (request?.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Hent og valider nytt brukerpayload
    const payload = await request.json() as { username?: string; password?: string; displayName?: string };
    
    // Validerer input
    if (!payload?.username || !payload?.password) {
      return new Response(JSON.stringify({ error: 'username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Sjekker at databasen er konfigurert
    if (!env?.chat_appd1) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    try {
      // Lager en ny bruker via controller
      const res = await registerUser(env, {
        username: String(payload.username),
        password: String(payload.password),
        displayName: payload.displayName,
      });
      
      return new Response(JSON.stringify({ ok: true, result: res }), {
        status: 201, // 201 Created for ny ressurs
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      // Håndterer feil hvis brukernavnet finnes allerede (409 Conflict)
      if (String(err) === 'Error: username_taken') {
        return new Response(JSON.stringify({ error: 'username_taken' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw err;
    }
  } catch (err) {
    // General feil
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * Handler for innlogging (POST /api/auth/login)
 * 
 * Forventet request body:
 * {
 *   username: string (påkrevd),
 *   password: string (påkrevd)
 * }
 * 
 * Ved suksess settes en HttpOnly session cookie som varer i 7 dager.
 * 
 * Mulige responser:
 * - 200: Innlogging vellykket (med Set-Cookie header)
 * - 400: Mangler username/password
 * - 401: Feil brukernavn eller passord
 * - 405: Feil HTTP-metode
 * - 500: Serverfeil
 */
export async function loginHandler(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv(); // Henter miljø

  // POST tillatt
  if (request?.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Hent og valider innloggingspayload
    const payload = await request.json() as { username?: string; password?: string };
    
    // Validerer input
    if (!payload?.username || !payload?.password) {
      return new Response(JSON.stringify({ error: 'username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!env?.chat_appd1) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Logger inn bruker via controller
    const user = await loginUser(env, {
      username: String(payload.username),
      password: String(payload.password),
    });

    if (!user) {
      // Feil brukernavn/passord (401 Unauthorized)
      return new Response(JSON.stringify({ error: 'Feil brukernavn eller passord' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Login akseptert - sett session cookie
    // HttpOnly: Kan ikke leses av JavaScript (XSS-beskyttelse)
    // SameSite=Lax: Sendes kun fra samme site (CSRF-beskyttelse)
    // Max-Age: 7 dager i sekunder
    return new Response(JSON.stringify({ ok: true, user: { id: user.id, username: user.username, displayName: user.displayName } }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${user.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
      },
    });
  } catch (err) {
    // General feil
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}