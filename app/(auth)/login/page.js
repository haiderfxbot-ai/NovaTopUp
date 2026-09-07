"use client";

import { useState } from "react";
import { signInWithEmail, signInWithGoogle, continueAsGuest } from "@/lib/firebase";
import { Mail, Lock, Chrome, UserRound } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleLogin(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      await signInWithEmail(email, password);
      window.location.href = "/";
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle();
      window.location.href = "/";
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  async function handleGuest() {
    try {
      await continueAsGuest();
      window.location.href = "/";
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-8 shadow-glass">
        <h1 className="font-display text-2xl font-700 text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-white/50">Log in to continue your orders.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
            <Mail size={16} className="text-white/40" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
            <Lock size={16} className="text-white/40" />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
            />
          </label>

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-xs text-white/40 hover:text-white/70">
              Forgot password?
            </a>
          </div>

          {status.error && <p className="text-xs text-red-400">{status.error}</p>}

          <button
            type="submit"
            disabled={status.loading}
            className="focus-ring w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
          >
            {status.loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-white/30">
          <span className="h-px flex-1 bg-white/10" />
          or continue with
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleGoogle}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/80 transition hover:border-white/25"
          >
            <Chrome size={16} /> Continue with Google
          </button>
          <button
            onClick={handleGuest}
            className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/80 transition hover:border-white/25"
          >
            <UserRound size={16} /> Continue as guest
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-white/50">
          New here?{" "}
          <a href="/signup" className="text-accent-soft hover:underline">
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
