"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import AnimatedCharacter from "@/components/AnimatedCharacter";
import { fetchMyOrders, watchAuthState } from "@/lib/firebase";

const STATUS_STYLES = {
  pending: "text-amber-300 border-amber-400/30 bg-amber-400/10",
  approved: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  rejected: "text-red-300 border-red-400/30 bg-red-400/10",
};

export default function MyOrdersPage() {
  const [user, setUser] = useState(undefined);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = watchAuthState((u) => {
      setUser(u);
      if (u) {
        fetchMyOrders().then(setOrders).catch((err) => setError(err.message));
      }
    });
    return unsub;
  }, []);

  const totalSpent = orders
    ? Object.values(orders)
        .filter((o) => o.status === "approved")
        .reduce((sum, o) => sum + (o.price || 0), 0)
    : 0;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-2xl font-700 text-white">My orders</h1>

        {user === undefined && <p className="mt-4 text-sm text-white/40">Checking login...</p>}
        {user === null && (
          <p className="mt-4 text-sm text-white/50">
            <a href="/login" className="text-accent-soft hover:underline">
              Log in
            </a>{" "}
            to see your purchase history.
          </p>
        )}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        {user && orders && (
          <>
            <p className="mt-1 text-sm text-white/50">
              Total spent (approved orders): <span className="text-white">PKR {totalSpent}</span>
            </p>

            <div className="mt-6 space-y-3">
              {Object.entries(orders).length === 0 && (
                <div className="py-6 text-center">
                  <AnimatedCharacter className="mx-auto h-28 w-28" />
                  <p className="mt-2 text-sm text-white/40">No orders yet — go top up something!</p>
                </div>
              )}
              {Object.entries(orders)
                .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
                .map(([id, o]) => (
                  <div key={id} className="glass-panel flex items-center justify-between rounded-2xl p-4 shadow-glass">
                    <div>
                      <h3 className="font-display text-base font-600 text-white">
                        {o.serviceName} — {o.packageLabel}
                      </h3>
                      <p className="mt-1 text-xs text-white/50">
                        Order #{id.slice(-8)} · PKR {o.price} · {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs capitalize ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
