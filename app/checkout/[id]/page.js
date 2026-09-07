"use client";

import { useEffect, useState } from "react";
import {
  fetchServiceById,
  fetchPaymentAccounts,
  fetchActiveCoupons,
  submitOrder,
  watchAuthState,
} from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import OrderSpinner from "@/components/OrderSpinner";
import AnimatedCharacter from "@/components/AnimatedCharacter";
import { CheckCircle2, Copy } from "lucide-react";

const METHOD_LABELS = {
  easypaisa: "Easypaisa",
  jazzcash: "JazzCash",
  binance: "Binance",
  debitcard: "Debit Card",
};

export default function CheckoutPage({ params }) {
  const { id } = params;
  const [service, setService] = useState(null);
  const [accounts, setAccounts] = useState({});
  const [user, setUser] = useState(undefined); // undefined = not checked yet

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [method, setMethod] = useState(null);
  const [referenceId, setReferenceId] = useState("");
  const [card, setCard] = useState({ cardHolderName: "", cardNumber: "" });

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null); // { discountPercent } | { error }

  const [status, setStatus] = useState({ loading: false, error: "", orderId: "" });

  useEffect(() => {
    fetchServiceById(id).then(setService);
    fetchPaymentAccounts().then(setAccounts);
    const unsub = watchAuthState(setUser);
    return unsub;
  }, [id]);

  async function applyCoupon() {
    if (!couponCode) return;
    const active = await fetchActiveCoupons();
    const match = active[couponCode.trim().toUpperCase()];
    setCouponResult(match ? { discountPercent: match.discountPercent } : { error: "Invalid or expired coupon." });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!selectedPackage || !method) {
      setStatus({ loading: false, error: "Pick a package and a payment method first.", orderId: "" });
      return;
    }
    if (method === "debitcard" && (!card.cardHolderName || !card.cardNumber)) {
      setStatus({ loading: false, error: "Enter card holder name and card number.", orderId: "" });
      return;
    }
    if (method !== "debitcard" && !referenceId) {
      setStatus({ loading: false, error: "Enter the transaction ID you received after paying.", orderId: "" });
      return;
    }

    setStatus({ loading: true, error: "", orderId: "" });

    const discount = couponResult?.discountPercent || 0;
    const finalPrice = Math.round(selectedPackage.price * (1 - discount / 100));

    try {
      const result = await submitOrder({
        serviceId: id,
        serviceName: service.name,
        packageLabel: selectedPackage.label,
        price: finalPrice,
        paymentMethod: method,
        referenceId: method !== "debitcard" ? referenceId : "",
        cardDetails: method === "debitcard" ? card : null,
      });
      setStatus({ loading: false, error: "", orderId: result.orderId });
    } catch (err) {
      setStatus({ loading: false, error: err.message, orderId: "" });
    }
  }

  if (service === null) {
    return (
      <main>
        <Navbar />
        <div className="flex justify-center px-6 py-24">
          <OrderSpinner label="Loading service..." />
        </div>
      </main>
    );
  }

  if (service === false || !service) {
    return (
      <main>
        <Navbar />
        <p className="mx-auto max-w-2xl px-6 py-16 text-sm text-white/40">Service not found.</p>
      </main>
    );
  }

  if (status.orderId) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <AnimatedCharacter className="mx-auto h-40 w-40" />
          <CheckCircle2 size={32} className="mx-auto -mt-4 text-emerald-400" />
          <h1 className="mt-2 font-display text-xl font-700 text-white">Order submitted</h1>
          <p className="mt-2 text-sm text-white/50">
            An admin will confirm your payment shortly. Save this order ID to track it:
          </p>
          <div className="glass-panel mt-4 flex items-center justify-between rounded-xl px-4 py-3">
            <span className="font-mono text-sm text-white">{status.orderId}</span>
            <button
              onClick={() => navigator.clipboard.writeText(status.orderId)}
              className="text-white/50 hover:text-white"
            >
              <Copy size={16} />
            </button>
          </div>
          <a href={`/track?id=${status.orderId}`} className="mt-5 inline-block text-sm text-accent-soft hover:underline">
            Track this order →
          </a>
        </div>
      </main>
    );
  }

  const allowed = service.allowedPaymentMethods || [];
  const matchingAccounts = Object.values(accounts).filter((a) => a.method === method && a.active !== false);

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <span className="text-xs uppercase tracking-wide text-accent-soft">{service.category}</span>
        <h1 className="mt-1 font-display text-2xl font-700 text-white">{service.name}</h1>
        {service.description && <p className="mt-1 text-sm text-white/50">{service.description}</p>}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Package selection */}
          <div>
            <h2 className="text-sm font-medium text-white/70">Choose a package</h2>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(service.packages || []).map((pkg, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`glass-panel rounded-xl p-3 text-left text-sm transition ${
                    selectedPackage?.label === pkg.label ? "border-accent-soft" : "hover:border-white/20"
                  }`}
                >
                  <div className="text-white">{pkg.label}</div>
                  <div className="text-white/50">PKR {pkg.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div>
            <h2 className="text-sm font-medium text-white/70">Payment method</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {allowed.map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-full border px-4 py-2 text-xs transition ${
                    method === m ? "border-accent-soft text-white" : "border-white/10 text-white/50 hover:text-white/80"
                  }`}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Manual payment details */}
          {method && method !== "debitcard" && (
            <div className="glass-panel rounded-xl p-4">
              <p className="text-xs text-white/50">Send payment to:</p>
              {matchingAccounts.length === 0 && (
                <p className="mt-1 text-sm text-amber-300">No {METHOD_LABELS[method]} account configured yet.</p>
              )}
              {matchingAccounts.map((a, i) => (
                <p key={i} className="mt-1 text-sm text-white">
                  {a.accountTitle} — <span className="font-mono">{a.accountNumber}</span>
                </p>
              ))}
              <input
                placeholder="Transaction ID after you've paid"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
              />
            </div>
          )}

          {method === "debitcard" && (
            <div className="glass-panel space-y-2 rounded-xl p-4">
              <input
                placeholder="Card holder name"
                value={card.cardHolderName}
                onChange={(e) => setCard({ ...card, cardHolderName: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
              />
              <input
                placeholder="Card number"
                value={card.cardNumber}
                onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
              />
            </div>
          )}

          {/* Coupon */}
          <div className="flex gap-2">
            <input
              placeholder="Coupon code (optional)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
            />
            <button type="button" onClick={applyCoupon} className="rounded-xl border border-white/15 px-4 text-sm text-white/80 hover:border-white/30">
              Apply
            </button>
          </div>
          {couponResult?.discountPercent && (
            <p className="text-xs text-cyan-signal">{couponResult.discountPercent}% discount applied.</p>
          )}
          {couponResult?.error && <p className="text-xs text-red-400">{couponResult.error}</p>}

          {selectedPackage && (
            <p className="text-sm text-white/70">
              Total:{" "}
              <span className="font-medium text-white">
                PKR {Math.round(selectedPackage.price * (1 - (couponResult?.discountPercent || 0) / 100))}
              </span>
            </p>
          )}

          {status.error && <p className="text-xs text-red-400">{status.error}</p>}

          <button
            type="submit"
            disabled={status.loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
          >
            {status.loading && <OrderSpinner size={18} />}
            {status.loading ? "Submitting..." : user === undefined ? "Checking login..." : !user ? "Log in to submit order" : "Submit order for approval"}
          </button>
        </form>
      </div>
    </main>
  );
}
