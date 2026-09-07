"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Home, Search, PackageSearch, User } from "lucide-react";
import { watchAuthState } from "@/lib/firebase";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = watchAuthState(setUser);
    return unsub;
  }, []);

  // Admin panel has its own desktop-style layout — never show this there.
  if (pathname?.startsWith("/admin-x7k9-panel")) return null;

  const isHome = pathname === "/";
  const accountHref = user ? "/orders" : "/login";
  const accountLabel = user ? "Account" : "Log in";

  const tabs = [
    { key: "home", label: "Home", icon: Home, href: "/", active: isHome },
    { key: "search", label: "Search", icon: Search, href: "/#services", active: false },
    { key: "track", label: "Track", icon: PackageSearch, href: "/track", active: pathname === "/track" },
    { key: "account", label: accountLabel, icon: User, href: accountHref, active: pathname === "/orders" || pathname === "/login" },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-base-950/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch">
        <button
          onClick={() => (isHome ? null : router.back())}
          disabled={isHome}
          aria-label="Back"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-white/40 disabled:opacity-30"
        >
          <ChevronLeft size={20} />
          <span className="text-[10px]">Back</span>
        </button>

        {tabs.map((tab) => (
          <a
            key={tab.key}
            href={tab.href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 ${
              tab.active ? "text-accent-soft" : "text-white/50"
            }`}
          >
            <tab.icon size={20} />
            <span className="text-[10px]">{tab.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
