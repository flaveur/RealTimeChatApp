import { registerUser, loginUser } from './authController';

export const registerHandler = {
  async post({ request, env }: { request: Request; env: any }) {
    try {
      const payload = await request.json();
      if (!payload?.username || !payload?.password) {
        return new Response(JSON.stringify({ error: 'username and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      try {
        const res = await registerUser(env, { username: String(payload.username), password: String(payload.password), displayName: payload.displayName });
        return new Response(JSON.stringify({ ok: true, result: res }), { status: 201, headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        if (String(err) === 'Error: username_taken') {
          return new Response(JSON.stringify({ error: 'username_taken' }), { status: 409, headers: { 'Content-Type': 'application/json' } });
        }
        throw err;
      }
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  },
};

export const loginHandler = {
  async post({ request, env }: { request: Request; env: any }) {
    try {
      const payload = await request.json();
      if (!payload?.username || !payload?.password) {
        return new Response(JSON.stringify({ error: 'username and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      const user = await loginUser(env, { username: String(payload.username), password: String(payload.password) });
      if (!user) {
        return new Response(JSON.stringify({ error: 'invalid_credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
      }
      // For demo: return user object. In production set a secure cookie or session.
      return new Response(JSON.stringify({ ok: true, user }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  },
};

export default { registerHandler, loginHandler };
