"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState({});
  const [form, setForm] = useState({ code: "", discountPercent: "", expiresAt: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function load() {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data.coupons || {});
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setStatus({ loading: false, error: data.error });
      return;
    }
    setForm({ code: "", discountPercent: "", expiresAt: "" });
    setStatus({ loading: false, error: "" });
    load();
  }

  async function toggleActive(id, active) {
    await fetch(`/api/admin/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-2xl font-700 text-white">Coupons</h1>
        <p className="mt-1 text-sm text-white/50">
          Percentage-off codes users can redeem at checkout. Coupon code is case-insensitive.
        </p>

        <div className="mt-6 space-y-2">
          {Object.entries(coupons).length === 0 && (
            <p className="text-sm text-white/40">No coupons yet.</p>
          )}
          {Object.entries(coupons).map(([id, c]) => (
            <div key={id} className="glass-panel flex items-center justify-between rounded-xl p-3 shadow-glass">
              <div className="text-sm text-white/80">
                <span className="font-mono text-accent-soft">{c.code}</span> — {c.discountPercent}% off
                {c.expiresAt && (
                  <span className="text-white/40"> · expires {new Date(c.expiresAt).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(id, c.active)} className="text-white/50 hover:text-white">
                  {c.active !== false ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => handleDelete(id)} className="text-red-400/70 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="glass-panel mt-6 grid gap-3 rounded-2xl p-5 shadow-glass sm:grid-cols-3">
          <input
            required
            placeholder="Code (e.g. NOVA10)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
          />
          <input
            required
            type="number"
            placeholder="Discount %"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
          />
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
          />

          {status.error && <p className="text-xs text-red-400 sm:col-span-3">{status.error}</p>}

          <button
            type="submit"
            disabled={status.loading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60 sm:col-span-3"
          >
            <Plus size={14} /> {status.loading ? "Adding..." : "Add coupon"}
          </button>
        </form>
      </div>
    </main>
  );
}
