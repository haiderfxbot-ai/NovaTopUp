"use client";

import { useState } from "react";
import { Mail, Lock, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState("identify"); // "identify" | "reset"
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", info: "" });

  async function handleRequestOtp(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", info: "" });
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, purpose: "reset" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ loading: false, error: data.error, info: "" });
      return;
    }
    setStatus({
      loading: false,
      error: "",
      info: "If an account exists for that email/username, a code has been sent.",
    });
    setStep("reset");
  }

  async function handleReset(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", info: "" });

    const verifyRes = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, code: otp, purpose: "reset" }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      setStatus({ loading: false, error: verifyData.error, info: "" });
      return;
    }

    const resetRes = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, newPassword }),
    });
    const resetData = await resetRes.json();
    if (!resetRes.ok) {
      setStatus({ loading: false, error: resetData.error, info: "" });
      return;
    }

    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-8 shadow-glass">
        <h1 className="font-display text-2xl font-700 text-white">Reset your password</h1>

        {step === "identify" && (
          <form onSubmit={handleRequestOtp} className="mt-6 space-y-3">
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
              <Mail size={16} className="text-white/40" />
              <input
                required
                placeholder="Email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </label>

            {status.error && <p className="text-xs text-red-400">{status.error}</p>}

            <button
              type="submit"
              disabled={status.loading}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
            >
              {status.loading ? "Sending..." : "Send reset code"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="mt-6 space-y-3">
            {status.info && <p className="text-xs text-cyan-signal">{status.info}</p>}

            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
              <KeyRound size={16} className="text-white/40" />
              <input
                required
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-transparent text-center text-lg tracking-[0.5em] text-white outline-none placeholder:text-white/40"
              />
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
              <Lock size={16} className="text-white/40" />
              <input
                required
                type="password"
                minLength={6}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              />
            </label>

            {status.error && <p className="text-xs text-red-400">{status.error}</p>}

            <button
              type="submit"
              disabled={status.loading}
              className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
            >
              {status.loading ? "Resetting..." : "Reset password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("identify")}
              className="w-full text-xs text-white/40 hover:text-white/70"
            >
              ← Start over
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white/50">
          <a href="/login" className="text-accent-soft hover:underline">
            Back to log in
          </a>
        </p>
      </div>
    </main>
  );
}
