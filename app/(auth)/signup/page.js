"use client";

import { useState } from "react";
import {
  signUpWithEmail,
  signInWithGoogle,
  continueAsGuest,
  saveUserProfile,
} from "@/lib/firebase";
import { Mail, Lock, Chrome, UserRound, User } from "lucide-react";

export default function SignupPage() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleRequestOtp(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: form.email, purpose: "signup" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ loading: false, error: data.error });
      return;
    }
    setStatus({ loading: false, error: "" });
    setStep("otp");
  }

  async function handleVerifyAndCreate(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    const verifyRes = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: form.email, code: otp, purpose: "signup" }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) {
      setStatus({ loading: false, error: verifyData.error });
      return;
    }

    try {
      const cred = await signUpWithEmail(form.email, form.password);
      await saveUserProfile(cred.user.uid, {
        username: form.username,
        email: form.email,
        createdAt: Date.now(),
      });
      window.location.href = "/";
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle();
      window.location.href = "/";
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  async function handleGuest() {
    try {
      await continueAsGuest();
      window.location.href = "/";
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-8 shadow-glass">
        {step === "form" && (
          <>
            <h1 className="font-display text-2xl font-700 text-white">Create your account</h1>
            <p className="mt-1 text-sm text-white/50">We'll email you a 6-digit code to verify.</p>

            <form onSubmit={handleRequestOtp} className="mt-6 space-y-3">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
                <User size={16} className="text-white/40" />
                <input
                  required
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
                <Mail size={16} className="text-white/40" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 focus-within:border-accent-soft">
                <Lock size={16} className="text-white/40" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </label>

              {status.error && <p className="text-xs text-red-400">{status.error}</p>}

              <button
                type="submit"
                disabled={status.loading}
                className="focus-ring w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
              >
                {status.loading ? "Sending code..." : "Send verification code"}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              or continue with
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleGoogle}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/80 transition hover:border-white/25"
              >
                <Chrome size={16} /> Continue with Google
              </button>
              <button
                onClick={handleGuest}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/80 transition hover:border-white/25"
              >
                <UserRound size={16} /> Continue as guest
              </button>
            </div>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="font-display text-2xl font-700 text-white">Check your email</h1>
            <p className="mt-1 text-sm text-white/50">
              Enter the 6-digit code sent to <span className="text-white/80">{form.email}</span>.
            </p>

            <form onSubmit={handleVerifyAndCreate} className="mt-6 space-y-3">
              <input
                required
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center text-lg tracking-[0.5em] text-white outline-none focus:border-accent-soft"
              />

              {status.error && <p className="text-xs text-red-400">{status.error}</p>}

              <button
                type="submit"
                disabled={status.loading}
                className="w-full rounded-xl bg-accent py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
              >
                {status.loading ? "Verifying..." : "Verify & create account"}
              </button>

              <button
                type="button"
                onClick={() => setStep("form")}
                className="w-full text-xs text-white/40 hover:text-white/70"
              >
                ← Change email
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <a href="/login" className="text-accent-soft hover:underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
