"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Gamepad2, Zap } from "lucide-react";
import ThreeOrb from "./ThreeOrb";

export default function Hero() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-badge", { opacity: 0, y: 12, duration: 0.6, ease: "power2.out" });
      gsap.from(".hero-title", { opacity: 0, y: 20, duration: 0.7, delay: 0.1, ease: "power2.out" });
      gsap.from(".hero-copy", { opacity: 0, y: 20, duration: 0.7, delay: 0.2, ease: "power2.out" });
      gsap.from(".hero-cta", { opacity: 0, y: 16, duration: 0.6, delay: 0.35, stagger: 0.1, ease: "power2.out" });
      gsap.from(".hero-orb", { opacity: 0, scale: 0.85, duration: 0.9, delay: 0.2, ease: "power3.out" });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative mx-auto max-w-6xl overflow-hidden px-6 pb-24 pt-20">
      <div className="pointer-events-none absolute -top-32 right-0 h-72 w-72 rounded-full bg-accent/30 blur-[100px]" />
      <div className="pointer-events-none absolute top-40 left-0 h-56 w-56 rounded-full bg-cyan-signal/20 blur-[100px]" />

      <div className="relative grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <span className="hero-badge inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <Zap size={14} className="text-cyan-signal" />
            Orders delivered in minutes, tracked live
          </span>

          <h1 className="hero-title mt-6 font-display text-4xl font-700 leading-tight text-white md:text-5xl">
            Top up your games <span className="text-gradient">without leaving the match.</span>
          </h1>

          <p className="hero-copy mt-5 max-w-md text-white/60">
            Free Fire Diamonds, PUBG UC, TikTok Coins and more — pay with Easypaisa,
            JazzCash, Binance or a debit card, then track every order with a single ID.
          </p>

          <div className="mt-8 flex gap-3">
            <a
              href="#services"
              className="hero-cta rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft"
            >
              Browse services
            </a>
            <a
              href="/signup"
              className="hero-cta rounded-full border border-white/15 px-6 py-3 text-sm text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Create free account
            </a>
          </div>
        </div>

        <div className="hero-orb relative mx-auto h-72 w-72">
          <ThreeOrb className="h-full w-full" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="glass-panel flex h-16 w-16 items-center justify-center rounded-full shadow-glass">
              <Gamepad2 size={26} className="text-accent-soft" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
