"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";

const METHOD_LABELS = {
  easypaisa: "Easypaisa",
  jazzcash: "JazzCash",
  binance: "Binance",
  debitcard: "Debit Card",
};

const EMPTY_FORM = {
  name: "",
  category: "",
  description: "",
  packages: [{ label: "", price: "" }],
  allowAllPaymentMethods: true,
  allowedPaymentMethods: [],
  active: true,
};

export default function ServicesPage() {
  const [services, setServices] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function loadServices() {
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services || {});
  }

  useEffect(() => {
    loadServices();
  }, []);

  function updatePackage(index, field, value) {
    const packages = [...form.packages];
    packages[index] = { ...packages[index], [field]: value };
    setForm({ ...form, packages });
  }

  function addPackageRow() {
    setForm({ ...form, packages: [...form.packages, { label: "", price: "" }] });
  }

  function removePackageRow(index) {
    setForm({ ...form, packages: form.packages.filter((_, i) => i !== index) });
  }

  function toggleMethod(method) {
    const set = new Set(form.allowedPaymentMethods);
    set.has(method) ? set.delete(method) : set.add(method);
    setForm({ ...form, allowedPaymentMethods: Array.from(set) });
  }

  function startEdit(id, service) {
    setEditingId(id);
    setForm({
      name: service.name,
      category: service.category,
      description: service.description || "",
      packages: service.packages,
      allowAllPaymentMethods: service.allowedPaymentMethods?.length === 4,
      allowedPaymentMethods: service.allowedPaymentMethods || [],
      active: service.active !== false,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });

    const payload = {
      ...form,
      packages: form.packages
        .filter((p) => p.label && p.price !== "")
        .map((p) => ({ label: p.label, price: Number(p.price) })),
    };

    const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setStatus({ loading: false, error: data.error });
      return;
    }

    setStatus({ loading: false, error: "" });
    resetForm();
    loadServices();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this service?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    loadServices();
  }

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-700 text-white">Services</h1>
        <p className="mt-1 text-sm text-white/50">
          Each service can restrict which payment methods are allowed for it.
        </p>

        {/* Existing services */}
        <div className="mt-6 space-y-3">
          {Object.entries(services).length === 0 && (
            <p className="text-sm text-white/40">No services yet — add your first one below.</p>
          )}
          {Object.entries(services).map(([id, s]) => (
            <div key={id} className="glass-panel flex items-start justify-between rounded-2xl p-4 shadow-glass">
              <div>
                <h3 className="font-display text-base font-600 text-white">
                  {s.name} <span className="text-xs font-normal text-white/40">— {s.category}</span>
                </h3>
                <p className="mt-1 text-xs text-white/50">
                  {s.packages?.length || 0} package(s) ·{" "}
                  {(s.allowedPaymentMethods || []).map((m) => METHOD_LABELS[m]).join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(id, s)} className="rounded-lg border border-white/10 p-2 text-white/60 hover:border-white/25 hover:text-white">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(id)} className="rounded-lg border border-white/10 p-2 text-red-400/70 hover:border-red-400/40 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add / edit form */}
        <form onSubmit={handleSubmit} className="glass-panel mt-8 space-y-4 rounded-3xl p-6 shadow-glass">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-600 text-white">
              {editingId ? "Edit service" : "Add new service"}
            </h2>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-white/40 hover:text-white/70">
                Cancel edit
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Service name (e.g. Free Fire Diamonds)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
            />
            <input
              required
              placeholder="Category (e.g. Gaming, Social)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
            />
          </div>

          <textarea
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-accent-soft"
            rows={2}
          />

          <div>
            <span className="text-xs text-white/50">Packages (label + price)</span>
            <div className="mt-2 space-y-2">
              {form.packages.map((pkg, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="e.g. 100 Diamonds"
                    value={pkg.label}
                    onChange={(e) => updatePackage(i, "label", e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent-soft"
                  />
                  <input
                    type="number"
                    placeholder="Price (PKR)"
                    value={pkg.price}
                    onChange={(e) => updatePackage(i, "price", e.target.value)}
                    className="w-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-accent-soft"
                  />
                  {form.packages.length > 1 && (
                    <button type="button" onClick={() => removePackageRow(i)} className="text-white/30 hover:text-red-400">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addPackageRow}
              className="mt-2 flex items-center gap-1 text-xs text-accent-soft hover:underline"
            >
              <Plus size={14} /> Add another package
            </button>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={form.allowAllPaymentMethods}
                onChange={(e) => setForm({ ...form, allowAllPaymentMethods: e.target.checked })}
              />
              Allow all payment methods for this service
            </label>

            {!form.allowAllPaymentMethods && (
              <div className="mt-2 flex flex-wrap gap-3">
                {Object.entries(METHOD_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-1.5 text-xs text-white/60">
                    <input
                      type="checkbox"
                      checked={form.allowedPaymentMethods.includes(key)}
                      onChange={() => toggleMethod(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {status.error && <p className="text-xs text-red-400">{status.error}</p>}

          <button
            type="submit"
            disabled={status.loading}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-glow transition hover:bg-accent-soft disabled:opacity-60"
          >
            {status.loading ? "Saving..." : editingId ? "Save changes" : "Add service"}
          </button>
        </form>
      </div>
    </main>
  );
}
