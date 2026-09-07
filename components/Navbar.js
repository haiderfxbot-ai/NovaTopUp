"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Wallet, LogOut, User } from "lucide-react";
import { watchAuthState, signOutUser } from "@/lib/firebase";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(undefined); // undefined = still checking
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = watchAuthState(setUser);
    return unsub;
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
  }

  async function handleLogout() {
    await signOutUser();
    setMenuOpen(false);
    window.location.href = "/";
  }

  const displayName = user?.isAnonymous ? "Guest" : user?.email || "";

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-base-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="font-display text-lg font-700 tracking-tight text-white">
          Nova<span className="text-gradient">TopUp</span>
        </a>

        <form onSubmit={handleSearch} className="hidden flex-1 items-center gap-2 px-8 md:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Free Fire, PUBG, TikTok..."
              className="w-full bg-transparent outline-none placeholder:text-white/40"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <a
            href="/track"
            className="hidden text-sm text-white/60 transition hover:text-white sm:block"
          >
            Track order
          </a>
          <a
            href="/orders"
            className="hidden text-sm text-white/60 transition hover:text-white sm:block"
          >
            My orders
          </a>

          {user === undefined && <div className="h-9 w-24" />}

          {user === null && (
            <>
              <a
                href="/login"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
              >
                Log in
              </a>
              <a
                href="/signup"
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft"
              >
                <Wallet size={16} />
                Sign up
              </a>
            </>
          )}

          {user && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
              >
                <User size={15} />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </button>

              {menuOpen && (
                <div className="glass-panel absolute right-0 mt-2 w-44 rounded-xl p-2 shadow-glass">
                  <a
                    href="/orders"
                    className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                  >
                    My orders
                  </a>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-white/5"
                  >
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
