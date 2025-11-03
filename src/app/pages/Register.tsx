'use client';

import { useState } from "react";

export default function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = (form.get("username") as string)?.trim();
    const email = (form.get("email") as string)?.trim();
    const password = (form.get("password") as string)?.trim();

    if (!username || !email || !password) {
      setError("Vennligst fyll ut alle felt");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Kunne ikke registrere bruker");
      }
      // Cookie settes av server; gå til forsiden
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">ChatApp</h1>
        <p className="text-gray-600 mb-6">Opprett en ny konto</p>

        {error && (
          <aside className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm" role="alert">
            {error}
          </aside>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Brukernavn</label>
            <input
              id="username"
              name="username"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </section>
          <section>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-post</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </section>
          <section>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Passord</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </section>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Registrerer…' : 'Registrer'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Har du allerede konto?{' '}
          <a href="/login" className="text-blue-600 hover:underline">Logg inn</a>
        </div>
      </div>
    </div>
  );
}