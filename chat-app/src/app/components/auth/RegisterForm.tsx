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

      // Optionally attempt to login immediately; if it fails, redirect to login page
      try {
        await auth.login(username, password);
        window.location.href = "/messages";
      } catch {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Register error");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <article className="w-full max-w-md card text-center">
          <h2 className="text-2xl font-bold mb-2">Registrering vellykket</h2>
          <p className="text-sm text-muted mb-4">Din konto er opprettet. Gå til innlogging for å logge inn.</p>
          <div className="flex justify-center">
            <a href="/login">
              <Button>Gå til innlogging</Button>
            </a>
          </div>
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
