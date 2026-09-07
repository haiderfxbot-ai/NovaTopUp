"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function CredentialsSettings() {
  const [currentUsername, setCurrentUsername] = useState("");
  const [form, setForm] = useState({ currentPassword: "", newUsername: "", newPassword: "" });
  const [status, setStatus] = useState({ loading: false, error: "", saved: false });

  useEffect(() => {
    fetch("/api/admin/credentials")
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setCurrentUsername(data.username);
          setForm((f) => ({ ...f, newUsername: data.username }));
        }
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", saved: false });

    const res = await fetch("/api/admin/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setStatus({ loading: false, error: data.error, saved: false });
      return;
    }

    setStatus({ loading: false, error: "", saved: true });
    setForm({ ...form, currentPassword: "", newPassword: "" });
  }

  return (
    <div>
      <h2 className="font-display text-lg font-600 text-white">Admin login</h2>
      <p className="mt-1 text-sm text-white/50">
        Current admin username: <span className="text-white/80">{currentUsername || "—"}</span>
      </p>

      <form onSubmit={handleSave} className="mt-4 space-y-3">
        <input
          required
          type="password"
          placeholder="Current password (to confirm it's you)"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        />
        <input
          required
          placeholder="New admin username"
          value={form.newUsername}
          onChange={(e) => setForm({ ...form, newUsername: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        />
        <input
          required
          type="password"
          minLength={8}
          placeholder="New password (min 8 characters)"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        />

        {status.error && <p className="text-xs text-red-400">{status.error}</p>}
        {status.saved && (
          <p className="flex items-center gap-1.5 text-xs text-cyan-signal">
            <CheckCircle2 size={14} /> Updated. Use the new username and password next time you
            log in.
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
        >
          {status.loading ? "Saving..." : "Update admin login"}
        </button>
      </form>
    </div>
  );
}
