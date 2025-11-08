'use client';

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
      if (!res.ok) {
        const msg =
          data?.error ||
          (typeof data === "string" ? data : null) ||
          "Kunne ikke registrere bruker";
        throw new Error(msg);
      }

  // Registrering vellykket - bytt side uten å laste om og vis suksessmelding
  navigate("/messages", { state: { flash: "Registrering vellykket" } });
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
          <p className="text-gray-600 mt-1">Opprett en ny konto</p>
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
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </section>

          <section>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
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
              {loading ? "Registrerer…" : "Registrer"}
            </button>
          </footer>
        </form>

        <nav className="mt-6 text-center text-sm text-gray-600">
          Har du allerede konto?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-sm"
          >
            Logg inn
          </Link>
        </nav>
      </article>
    </main>
  );
}
