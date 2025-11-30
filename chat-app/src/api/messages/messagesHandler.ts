import { listMessages, createMessage } from './messagesController';

export const messagesHandler = {
  async get({ env }: { env: any }) {
    try {
      const rows = await listMessages(env);
      return new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  },

  async post({ request, env }: { request: Request; env: any }) {
    try {
      const payload = await request.json();
      if (!payload?.userId || !payload?.body) {
        return new Response(JSON.stringify({ error: 'userId and body required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const res = await createMessage(env, { userId: Number(payload.userId), body: String(payload.body) });
      return new Response(JSON.stringify({ ok: true, result: res }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  },
};

export default messagesHandler;
