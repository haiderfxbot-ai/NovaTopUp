import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ServicesGrid from "@/components/ServicesGrid";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />

      <section id="services" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="font-display text-2xl font-700 text-white">Browse services</h2>
        <p className="mt-1 text-sm text-white/50">
          Pick a service to see its packages and payment options.
        </p>

        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-white/40">Loading services...</p>}>
            <ServicesGrid />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
