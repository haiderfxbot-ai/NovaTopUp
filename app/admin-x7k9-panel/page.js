"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setStatus({ loading: false, error: data.error || "Login failed." });
      return;
    }

    window.location.href = "/admin-x7k9-panel/dashboard";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-950 px-6">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-8 shadow-glass">
        <div className="mb-4 flex items-center gap-2 text-white/70">
          <ShieldCheck size={18} />
          <span className="text-xs uppercase tracking-wide">Restricted area</span>
        </div>
        <h1 className="font-display text-xl font-700 text-white">Admin access</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Admin username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent-soft"
          />
          <input
            required
            type="password"
            placeholder="Admin password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent-soft"
          />

          {status.error && <p className="text-xs text-red-400">{status.error}</p>}

          <button
            type="submit"
            disabled={status.loading}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
          >
            {status.loading ? "Checking..." : "Enter admin panel"}
          </button>
        </form>
      </div>
    </main>
  );
}
