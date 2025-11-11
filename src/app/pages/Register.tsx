/**
 * Register.tsx - Registreringsside
 * 
 * Implementert med GitHub Copilot
 * 
 * Lar nye brukere opprette en konto i systemet. Etter vellykket registrering
 * vises en suksessmelding, og bruker må eksplisitt logge inn (ikke automatisk innlogging).
 * Dette forhindrer at gamle sesjoner blir gjenbrukt.
 * 
 * Funksjoner:
 * - Validering av brukernavn, e-post og passord
 * - API-kall til /api/register
 * - Viser suksessskjerm med grønt hake-ikon
 * - Navigerer til /login etter registrering
 */

'use client';

import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [error, setError] = useState("");          // Feilmelding ved validering/registrering
  const [loading, setLoading] = useState(false);   // Loading-state mens API-kall kjører
  const [success, setSuccess] = useState(false);   // True når registrering er vellykket
  const navigate = useNavigate();                  // React Router navigasjon

  /**
   * Håndterer form submit for registrering
   * Copilot: Validerer input og sender POST til /api/register
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Hent form-data og trim whitespace
    const form = new FormData(e.currentTarget);
    const username = (form.get("username") as string)?.trim();
    const email = (form.get("email") as string)?.trim();
    const password = (form.get("password") as string)?.trim();

    // Frontend-validering
    if (!username || !email || !password) {
      setError("Vennligst fyll ut alle felt");
      setLoading(false);
      return;
    }

    try {
      // Send registrerings-request til backend
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = (await res.json()) as any;
      if (!res.ok) throw new Error(data?.error ?? "Kunne ikke registrere bruker");

      // Vis suksessmelding i stedet for å logge inn automatisk
      // Copilot: Dette forhindrer at gamle sesjoner gjenbrukes
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Noe gikk galt under registrering");
    } finally {
      setLoading(false);
    }
  }

  // Suksessskjerm: Vises etter vellykket registrering
  // Copilot: Bruker må eksplisitt navigere til login-siden
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors">
        <article className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
          <div className="mb-6">
            {/* Grønt hake-ikon */}
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Registrering vellykket!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Din konto er opprettet. Du kan nå logge inn.
            </p>
          </div>
          
          <Button onClick={() => navigate("/login")} fullWidth>
            Gå til innlogging
          </Button>
        </article>
      </main>
    );
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