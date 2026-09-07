"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AdminSdkSettings() {
  const [json, setJson] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", saved: false });

  async function handleSave(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", saved: false });

    const res = await fetch("/api/admin/firebase-service-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceAccountJson: json }),
    });

    if (!res.ok) {
      const data = await res.json();
      setStatus({ loading: false, error: data.error, saved: false });
      return;
    }

    setJson("");
    setStatus({ loading: false, error: "", saved: true });
  }

  return (
    <div>
      <h2 className="font-display text-lg font-600 text-white">Firebase Admin SDK</h2>
      <p className="mt-1 text-sm text-white/50">
        This is what lets the admin panel (Services, Transactions, Payment Accounts) write to
        the database securely from the server, without opening those tables up to every
        visitor. Get this from Firebase Console → Project Settings → Service Accounts →
        Generate new private key, then paste the full downloaded JSON file below.
      </p>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        Keep this key private — it has full read/write access to your database. It is stored
        on the server only and is never sent to the browser.
      </div>

      <form onSubmit={handleSave} className="mt-4 space-y-3">
        <textarea
          required
          placeholder='Paste the full service account JSON here, e.g. { "type": "service_account", "project_id": ... }'
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-accent-soft"
        />

        {status.error && <p className="text-xs text-red-400">{status.error}</p>}
        {status.saved && (
          <p className="flex items-center gap-1.5 text-xs text-cyan-signal">
            <CheckCircle2 size={14} /> Saved. The admin panel can now write to the database.
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
        >
          {status.loading ? "Saving..." : "Save Admin SDK key"}
        </button>
      </form>
    </div>
  );
}
