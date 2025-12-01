import { listMessages, createMessage } from './messagesController';
import { getEnv } from '../../lib/env';

export async function messagesHandler(context: any): Promise<Response> {
  const request = context.request;
  const env = getEnv(); // Henter miljø

  // GET-forespørsler for å hente meldinger
  if (request.method === 'GET') {
    try {
      const rows = await listMessages(env);
      return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // POST for å opprette en ny melding
  if (request.method === 'POST') {
    try {
      const payload = await request.json() as { userId?: number; body?: string };
      
      // Validerer input
      if (!payload?.userId || !payload?.body) {
        return new Response(JSON.stringify({ error: 'userId and body required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Oppretter ny melding
      const res = await createMessage(env, {
        userId: Number(payload.userId),
        body: String(payload.body),
      });

      return new Response(JSON.stringify({ ok: true, result: res }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Metoder ikke tillatt
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}