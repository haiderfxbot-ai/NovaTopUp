"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_STYLES = {
  pending: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  approved: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  rejected: "text-red-300 border-red-400/30 bg-red-400/10",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState({});
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);

  async function load() {
    const res = await fetch("/api/admin/transactions");
    const data = await res.json();
    setTransactions(data.transactions || {});
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    setBusyId(id);
    await fetch(`/api/admin/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setBusyId(null);
  }

  const entries = Object.entries(transactions)
    .filter(([, t]) => filter === "all" || t.status === filter)
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-700 text-white">Transactions</h1>
        <p className="mt-1 text-sm text-white/50">
          Match the reference ID or card details against what the user sent, then approve or reject.
        </p>

        <div className="mt-4 flex gap-2">
          {["pending", "approved", "rejected", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                filter === f ? "border-accent-soft text-white" : "border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {entries.length === 0 && <p className="text-sm text-white/40">Nothing here yet.</p>}

          {entries.map(([id, t]) => (
            <div key={id} className="glass-panel rounded-2xl p-5 shadow-glass">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-600 text-white">
                    {t.serviceName || t.serviceId} — {t.packageLabel}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">
                    Order #{id.slice(-8)} · {t.userEmail} · PKR {t.price} · via {t.paymentMethod}
                  </p>
                  {t.referenceId && (
                    <p className="mt-1 text-xs text-white/70">
                      Reference / Transaction ID: <span className="font-mono">{t.referenceId}</span>
                    </p>
                  )}
                  {t.cardDetails && (
                    <div className="mt-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                      Card holder: {t.cardDetails.cardHolderName || "—"} · Card number:{" "}
                      <span className="font-mono">{t.cardDetails.cardNumber || "—"}</span>
                    </div>
                  )}
                </div>

                <span className={`rounded-full border px-3 py-1 text-xs capitalize ${STATUS_STYLES[t.status] || ""}`}>
                  {t.status}
                </span>
              </div>

              {t.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setStatus(id, "approved")}
                    disabled={busyId === id}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-500/30 disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    onClick={() => setStatus(id, "rejected")}
                    disabled={busyId === id}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
