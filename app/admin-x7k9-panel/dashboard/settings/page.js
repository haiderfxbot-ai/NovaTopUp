"use client";

import { useState } from "react";
import FirebaseSettings from "@/components/admin/FirebaseSettings";
import AdminSdkSettings from "@/components/admin/AdminSdkSettings";
import PaymentAccountsSettings from "@/components/admin/PaymentAccountsSettings";
import CredentialsSettings from "@/components/admin/CredentialsSettings";
import EmailSettings from "@/components/admin/EmailSettings";

const TABS = [
  { key: "firebase", label: "Firebase (Web)", Component: FirebaseSettings },
  { key: "admin-sdk", label: "Firebase (Admin SDK)", Component: AdminSdkSettings },
  { key: "email", label: "Email OTP", Component: EmailSettings },
  { key: "payments", label: "Payment Accounts", Component: PaymentAccountsSettings },
  { key: "login", label: "Admin Login", Component: CredentialsSettings },
];

export default function SettingsPage() {
  const [active, setActive] = useState("firebase");
  const ActiveComponent = TABS.find((t) => t.key === active).Component;

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-700 text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/50">
          Everything here is configured through this panel — nothing needs to be edited in
          the source code.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active === t.key
                  ? "border-accent-soft text-white"
                  : "border-white/10 text-white/50 hover:text-white/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="glass-panel mt-6 rounded-3xl p-6 shadow-glass">
          <ActiveComponent />
        </div>
      </div>
    </main>
  );
}
