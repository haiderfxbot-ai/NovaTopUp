"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const FIELDS = [
  { key: "apiKey", label: "API Key" },
  { key: "authDomain", label: "Auth Domain" },
  { key: "projectId", label: "Project ID" },
  { key: "storageBucket", label: "Storage Bucket" },
  { key: "messagingSenderId", label: "Messaging Sender ID" },
  { key: "appId", label: "App ID" },
  { key: "databaseURL", label: "Realtime Database URL" },
];

export default function FirebaseSettings() {
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, ""])));
  const [source, setSource] = useState("none");
  const [status, setStatus] = useState({ loading: false, error: "", saved: false });

  useEffect(() => {
    fetch("/api/admin/firebase-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setForm((prev) => ({ ...prev, ...data.config }));
        if (data.source) setSource(data.source);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", saved: false });

    const res = await fetch("/api/admin/firebase-config", {
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
  }

  return (
    <div>
      <h2 className="font-display text-lg font-600 text-white">Firebase connection (Web SDK)</h2>
      <p className="mt-1 text-sm text-white/50">
        Paste your Firebase Web App config here (Firebase Console → Project Settings →
        Your apps → SDK setup and configuration). Nothing here is written into the source
        code.
      </p>

        {source === "env" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-cyan-signal/30 bg-cyan-signal/10 px-4 py-3 text-sm text-cyan-signal">
            <CheckCircle2 size={16} />
            Currently connected using Vercel Environment Variables. Saving below will switch
            to file-based config instead (useful for self-hosted deployments).
          </div>
        )}
        {source === "none" && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            <AlertTriangle size={16} />
            Firebase is not connected yet. Auth and the database will not work until this is
            saved.
          </div>
        )}

        <form onSubmit={handleSave} className="glass-panel mt-6 space-y-3 rounded-3xl p-6 shadow-glass">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="text-xs text-white/50">{f.label}</span>
              <input
                required
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
              />
            </label>
          ))}

          {status.error && <p className="text-xs text-red-400">{status.error}</p>}
          {status.saved && (
            <p className="text-xs text-cyan-signal">
              Saved. Firebase Auth and Realtime Database tables will be created automatically
              on the next page load that uses them.
            </p>
          )}

          <button
            type="submit"
            disabled={status.loading}
            className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
          >
            {status.loading ? "Saving..." : "Save & connect"}
          </button>
        </form>
    </div>
  );
}
