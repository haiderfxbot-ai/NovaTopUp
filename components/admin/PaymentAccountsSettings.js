"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const METHODS = ["easypaisa", "jazzcash", "binance"];

export default function PaymentAccountsSettings() {
  const [accounts, setAccounts] = useState({});
  const [form, setForm] = useState({ method: "easypaisa", label: "", accountTitle: "", accountNumber: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function load() {
    const res = await fetch("/api/admin/payment-accounts");
    const data = await res.json();
    setAccounts(data.accounts || {});
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    const res = await fetch("/api/admin/payment-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setStatus({ loading: false, error: data.error });
      return;
    }
    setForm({ method: "easypaisa", label: "", accountTitle: "", accountNumber: "" });
    setStatus({ loading: false, error: "" });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Remove this payment account?")) return;
    await fetch(`/api/admin/payment-accounts/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h2 className="font-display text-lg font-600 text-white">Payment accounts</h2>
      <p className="mt-1 text-sm text-white/50">
        These account numbers are shown to users at checkout so they know where to send
        payment for a manually-approved order.
      </p>

      <div className="mt-4 space-y-2">
        {Object.entries(accounts).length === 0 && (
          <p className="text-sm text-white/40">No payment accounts added yet.</p>
        )}
        {Object.entries(accounts).map(([id, a]) => (
          <div key={id} className="glass-panel flex items-center justify-between rounded-xl p-3 shadow-glass">
            <div className="text-sm text-white/80">
              <span className="uppercase text-xs text-accent-soft">{a.method}</span>{" "}
              — {a.accountTitle} · <span className="font-mono">{a.accountNumber}</span>
            </div>
            <button onClick={() => handleDelete(id)} className="text-red-400/70 hover:text-red-400">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="mt-5 grid gap-3 sm:grid-cols-2">
        <select
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        >
          {METHODS.map((m) => (
            <option key={m} value={m} className="bg-base-900">
              {m}
            </option>
          ))}
        </select>
        <input
          required
          placeholder="Account title (name on account)"
          value={form.accountTitle}
          onChange={(e) => setForm({ ...form, accountTitle: e.target.value })}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        />
        <input
          required
          placeholder="Account number / wallet address"
          value={form.accountNumber}
          onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        />
        <input
          placeholder="Optional label (e.g. Primary)"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        />

        {status.error && <p className="text-xs text-red-400 sm:col-span-2">{status.error}</p>}

        <button
          type="submit"
          disabled={status.loading}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60 sm:col-span-2"
        >
          <Plus size={14} /> {status.loading ? "Adding..." : "Add account"}
        </button>
      </form>
    </div>
  );
}
