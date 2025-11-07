'use client';

import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();

    if (!username || !password) {
      setError("Vennligst fyll ut alle felt");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Kunne ikke logge inn");
      }

      // Cookie settes av server, naviger videre
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Noe gikk galt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <article className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 ring-1 ring-gray-200">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">RealTime ChatApp</h1>
          <p className="text-gray-600 mt-1">Logg inn for å fortsette</p>
        </header>

        {error && (
          <aside
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            role="alert"
          >
            {error}
          </aside>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Brukernavn
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </section>

          <section>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Passord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </section>

          <footer className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium 
                         hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition 
                         disabled:opacity-60"
            >
              {loading ? "Logger inn…" : "Logg inn"}
            </button>
          </footer>
        </form>

        <nav className="mt-6 text-center text-sm text-gray-600">
          Har du ikke konto?{" "}
          <a
            href="/register"
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-sm"
          >
            Registrer deg
          </a>
        </nav>
      </article>
    </main>
  );
}
