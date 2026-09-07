"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const FIELDS = [
  { key: "serviceId", label: "EmailJS Service ID" },
  { key: "otpTemplateId", label: "Sign-up OTP Template ID" },
  { key: "resetTemplateId", label: "Password Reset Template ID" },
  { key: "publicKey", label: "EmailJS Public Key" },
  { key: "privateKey", label: "EmailJS Private Key" },
];

export default function EmailSettings() {
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f.key, ""])));
  const [status, setStatus] = useState({ loading: false, error: "", saved: false });

  useEffect(() => {
    fetch("/api/admin/email-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setForm((prev) => ({ ...prev, ...data.config }));
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", saved: false });
    const res = await fetch("/api/admin/email-config", {
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
      <h2 className="font-display text-lg font-600 text-white">Email OTP (EmailJS)</h2>
      <p className="mt-1 text-sm text-white/50">
        Create a free account at emailjs.com, connect your email, and make <strong>two</strong>{" "}
        templates (sign-up verification + password reset), each with two variables:{" "}
        <code className="text-white/70">{"{{to_email}}"}</code> and{" "}
        <code className="text-white/70">{"{{otp_code}}"}</code>. Paste the five values below.
      </p>

      <form onSubmit={handleSave} className="mt-4 space-y-3">
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
          <p className="flex items-center gap-1.5 text-xs text-cyan-signal">
            <CheckCircle2 size={14} /> Saved. OTP emails will now send through EmailJS.
          </p>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
        >
          {status.loading ? "Saving..." : "Save email settings"}
        </button>
      </form>
    </div>
  );
}
