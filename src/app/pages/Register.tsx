'use client';

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke registrere bruker");

      navigate("/messages", { state: { flash: "Registrering vellykket!" } });
    } catch (err: any) {
      setError(err.message || "Noe gikk galt under registrering");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors">
      <article className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RealTime ChatApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Opprett en ny konto</p>
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
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Velg et brukernavn"
            />
          </fieldset>

          <fieldset>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="din@epost.no"
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
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </fieldset>

          <footer className="pt-4">
            <Button type="submit" disabled={loading} fullWidth>
              {loading ? "Registrerer…" : "Registrer"}
            </Button>
          </footer>
        </form>

        <nav className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Har du allerede konto?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            Logg inn
          </Link>
        </nav>
      </article>
    </main>
  );
}