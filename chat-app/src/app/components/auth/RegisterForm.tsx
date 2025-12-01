"use client";
import "./auth.css";
import React, { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import useAuth from "@/app/hooks/useAuth";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!username || !email || !password) {
      setError("Vennligst fyll ut alle felt");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Kunne ikke registrere bruker");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Register error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors">
        <article className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-800 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registrering vellykket!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Din konto er opprettet. Du kan nå logge inn.</p>
          <a href="/login" className="inline-block w-full">
            <Button className="w-full">Gå til innlogging</Button>
          </a>
        </article>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <article className="auth-card">
        <h1 className="text-3xl font-bold mb-4">Opprett konto</h1>
        {error && <div className="text-red-500 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-sm font-medium mb-1">Brukernavn</label>
              <input className="auth-input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-post</label>
            <input className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passord</label>
            <input className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Registrerer…" : "Registrer"}
            </Button>
          </div>
        </form>
      </article>
    </main>
  );
}
