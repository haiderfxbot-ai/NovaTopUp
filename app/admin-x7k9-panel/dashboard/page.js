import { redirect } from "next/navigation";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { Settings, Package, Receipt, Ticket } from "lucide-react";

export default function AdminDashboardPage() {
  if (!getIsAdminLoggedIn()) {
    redirect("/admin-x7k9-panel");
  }

  const cards = [
    { title: "Services", desc: "Add or edit Free Fire, PUBG, TikTok packages, control allowed payment methods per service", icon: Package, href: "/admin-x7k9-panel/dashboard/services", ready: true },
    { title: "Transactions", desc: "Match transaction IDs or card details, approve or reject orders", icon: Receipt, href: "/admin-x7k9-panel/dashboard/transactions", ready: true },
    { title: "Coupons", desc: "Create daily redeem discount codes", icon: Ticket, href: "/admin-x7k9-panel/dashboard/coupons", ready: true },
    { title: "Settings", desc: "Firebase connection, Admin SDK, payment accounts, admin login", icon: Settings, href: "/admin-x7k9-panel/dashboard/settings", ready: true },
  ];

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-700 text-white">Admin dashboard</h1>
        <p className="mt-1 text-sm text-white/50">
          Services and Transactions are now fully wired up. Coupons arrive in Phase 3.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <a
              key={c.title}
              href={c.ready ? c.href : "#"}
              className={`glass-panel rounded-2xl p-5 shadow-glass transition ${
                c.ready ? "hover:border-white/25" : "cursor-not-allowed opacity-50"
              }`}
            >
              <c.icon size={22} className="text-accent-soft" />
              <h3 className="mt-3 font-display text-lg font-600 text-white">{c.title}</h3>
              <p className="mt-1 text-sm text-white/50">{c.desc}</p>
              {!c.ready && <span className="mt-2 inline-block text-xs text-white/30">Coming in Phase 2</span>}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
