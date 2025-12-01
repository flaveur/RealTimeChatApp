"use client";
import "./auth.css";
import React, { useState } from "react";
import useAuth from '@/app/hooks/useAuth';

export default function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const username = (form.get("username") as string)?.trim();
    const password = (form.get("password") as string)?.trim();

    if (!username || !password) {
      setError("Vennligst fyll ut alle felt");
      setLoading(false);
      return;
    }

    try {
      await auth.login(username, password);
      // store minimal username (for legacy compatibility)
      try { localStorage.setItem('username', username); } catch {}
      window.location.href = "/messages";
    } catch (err: any) {
      setError(err.message || "Noe gikk galt under innlogging");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors">
      <article className="auth-card">
        <header className="auth-header">
          <h1>RealTime ChatApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Logg inn for å fortsette</p>
        </header>

        {error && (
          <aside className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </aside>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Brukernavn
            </label>
            <input
              id="username"
              name="username"
              required
              className="auth-input"
              placeholder="Ditt brukernavn"
            />
          </fieldset>

          <fieldset>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Passord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="auth-input"
              placeholder="••••••••"
            />
          </fieldset>

          <footer className="pt-4">
            <button
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logger inn…" : "Logg inn"}
            </button>
          </footer>
        </form>

        <nav className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Har du ikke konto?{' '}
          <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none">Registrer deg</a>
        </nav>
      </article>
    </main>
  );
}
