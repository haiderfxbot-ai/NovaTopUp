"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Search } from "lucide-react";

const STATUS_STYLES = {
  pending: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  approved: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  rejected: "text-red-300 border-red-400/30 bg-red-400/10",
};

function TrackForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") || "");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch(`/api/track/${orderId.trim()}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not find that order.");
      return;
    }
    setResult(data);
  }

  useEffect(() => {
    if (searchParams.get("id")) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-2xl font-700 text-white">Track your order</h1>
      <p className="mt-1 text-sm text-white/50">Paste the order ID you were given after checkout.</p>

      <form onSubmit={handleSearch} className="mt-5 flex gap-2">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
        />
        <button type="submit" className="rounded-xl bg-accent px-4 text-white shadow-glow hover:bg-accent-soft">
          <Search size={16} />
        </button>
      </form>

      {loading && <p className="mt-4 text-sm text-white/40">Searching...</p>}
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="glass-panel mt-5 rounded-2xl p-5 shadow-glass">
          <h3 className="font-display text-lg font-600 text-white">
            {result.serviceName} — {result.packageLabel}
          </h3>
          <p className="mt-1 text-sm text-white/50">PKR {result.price}</p>
          <span className={`mt-3 inline-block rounded-full border px-3 py-1 text-xs capitalize ${STATUS_STYLES[result.status]}`}>
            {result.status}
          </span>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<p className="px-6 py-16 text-sm text-white/40">Loading...</p>}>
        <TrackForm />
      </Suspense>
    </main>
  );
}
