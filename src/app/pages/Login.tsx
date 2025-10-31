'use client';

import { useState } from "react";

export default function Login() {
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // TODO: Implementer faktisk autentisering i neste oblig
    // For nå: bare sett en mock auth cookie og naviger
    if (email && password) {
      // Setter en enkel auth cookie for nå
      document.cookie = `authToken=mock-token-${Date.now()}; path=/; max-age=86400`;
      document.cookie = `userEmail=${email}; path=/; max-age=86400`;
      
      // Naviger til messages
      window.location.href = "/messages";
    } else {
      setError("Vennligst fyll ut alle felt");
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <article className="bg-white w-full max-w-md rounded-lg shadow p-6">
        <header>
          <h1 className="text-2xl font-bold mb-2">ChatApp</h1>
          <p className="text-gray-600 mb-6">Logg inn for å fortsette</p>
        </header>

        {error && (
          <aside className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm" role="alert">
            {error}
          </aside>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
          >
            Logg inn
          </button>
        </form>

        <footer className="mt-4 text-center text-sm text-gray-600">
          Har du ikke konto?{' '}
          <a href="/register" className="text-blue-600 hover:underline">Registrer deg</a>
        </footer>
      </article>
    </main>
  );
}