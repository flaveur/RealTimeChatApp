import { registerUser, loginUser } from './authController';
import { getEnv } from '../../lib/env';

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
      // Lager en ny bruker
      const res = await registerUser(env, {
        username: String(payload.username),
        password: String(payload.password),
        displayName: payload.displayName,
      });
      
      return new Response(JSON.stringify({ ok: true, result: res }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      // Håndterer feil hvis brukernavnet finnes allerede
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

    // Logger inn bruker
    const user = await loginUser(env, {
      username: String(payload.username),
      password: String(payload.password),
    });

    if (!user) {
      // Feil brukernavn/passord
      return new Response(JSON.stringify({ error: 'invalid_credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Login akseptert - sett session cookie
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