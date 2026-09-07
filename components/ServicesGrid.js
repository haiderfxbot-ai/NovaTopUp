"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { fetchServices } from "@/lib/firebase";
import OrderSpinner from "./OrderSpinner";

export default function ServicesGrid() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").toLowerCase();

  const [services, setServices] = useState(null);
  const [error, setError] = useState("");
  const gridRef = useRef(null);

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch((err) => setError(err.message));
  }, []);

  const entries = services
    ? Object.entries(services).filter(([, s]) => {
        if (s.active === false) return false;
        if (!query) return true;
        return s.name?.toLowerCase().includes(query) || s.category?.toLowerCase().includes(query);
      })
    : [];

  useEffect(() => {
    if (!gridRef.current || entries.length === 0) return;
    const cards = gridRef.current.querySelectorAll(".service-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, query]);

  if (error) {
    return (
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
        {error}
      </p>
    );
  }

  if (services === null) {
    return (
      <div className="flex justify-center py-10">
        <OrderSpinner label="Loading services..." />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-white/40">
        {query ? `No services match "${query}".` : "No services available yet — check back soon."}
      </p>
    );
  }

  return (
    <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(([id, s]) => (
        <a
          key={id}
          href={`/checkout/${id}`}
          className="service-card glass-panel rounded-2xl p-5 shadow-glass transition hover:-translate-y-1 hover:border-white/20"
        >
          <span className="text-xs uppercase tracking-wide text-accent-soft">{s.category}</span>
          <h3 className="mt-1 font-display text-lg font-600 text-white">{s.name}</h3>
          <p className="mt-1 text-sm text-white/50">
            {s.packages?.length || 0} package{s.packages?.length === 1 ? "" : "s"} available
          </p>
          <p className="mt-3 text-sm text-accent-soft">
            From PKR {Math.min(...(s.packages || []).map((p) => p.price))}
          </p>
        </a>
      ))}
    </div>
  );
}
