"use client";

import { useMemo, useState } from "react";
import type { BoutiqueFormRecord } from "@faden/database";
import { BoutiqueDetailsView } from "@/components/boutique-details-view";

interface AllBoutiquesDirectoryProps {
  boutiques: BoutiqueFormRecord[];
}

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "verified", label: "Verified" },
  { id: "pending_verification", label: "Pending" },
  { id: "rejected", label: "Rejected" },
  { id: "suspended", label: "Suspended" },
  { id: "draft", label: "Draft" },
] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "verified":
      return "border-gold/40 bg-gold/10 text-gold-light";
    case "pending_verification":
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
    case "rejected":
      return "border-red-accent/40 bg-red-accent/10 text-red-accent";
    case "suspended":
      return "border-foreground-muted/40 bg-foreground-muted/10 text-foreground-muted";
    default:
      return "border-border bg-background text-foreground-muted";
  }
}

export function AllBoutiquesDirectory({ boutiques }: AllBoutiquesDirectoryProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return boutiques.filter((boutique) => {
      if (statusFilter !== "all" && boutique.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [
        boutique.name,
        boutique.slug,
        boutique.form.ownerName,
        boutique.form.email,
        boutique.form.phone,
        boutique.form.address,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [boutiques, query, statusFilter]);

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = { all: boutiques.length };
    for (const b of boutiques) {
      byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
    }
    return byStatus;
  }, [boutiques]);

  if (!boutiques.length) {
    return (
      <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
        No boutiques registered yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-foreground-muted">
            {filtered.length} of {boutiques.length} boutique{boutiques.length === 1 ? "" : "s"}
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, slug, owner, email…"
          className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const count =
            filter.id === "all" ? counts.all : (counts[filter.id] ?? 0);
          if (filter.id !== "all" && count === 0) return null;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                statusFilter === filter.id
                  ? "border-gold bg-gold/15 text-gold-light"
                  : "border-border text-foreground-muted hover:border-gold/30 hover:text-gold"
              }`}
            >
              {filter.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {filtered.map((boutique) => (
          <article
            key={boutique.boutiqueId}
            className="rounded-xl border border-border bg-background-elevated p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-gold">{boutique.name}</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  {boutique.form.ownerName} · {boutique.form.phone || "—"} ·{" "}
                  {boutique.form.email || "—"}
                </p>
                <p className="mt-1 text-sm text-foreground-muted">
                  Slug: {boutique.slug} · Registered {formatDate(boutique.createdAt)}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs capitalize ${statusBadgeClass(boutique.status)}`}
              >
                {boutique.status.replace(/_/g, " ")}
              </span>
            </div>

            <p className="mt-3 text-sm text-foreground-muted">{boutique.form.address || "No address"}</p>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted/80">Outfit types</dt>
                <dd className="mt-1 line-clamp-2">{boutique.form.outfitTypes || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted/80">Services</dt>
                <dd className="mt-1 line-clamp-2">{boutique.form.servicesOffered || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted/80">Delivery</dt>
                <dd className="mt-1">{boutique.form.avgDeliveryTime || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-foreground-muted/80">Availability</dt>
                <dd className="mt-1 capitalize">{boutique.form.availabilityStatus}</dd>
              </div>
            </dl>

            <BoutiqueDetailsView details={boutique.form} summaryLabel="View full boutique details" />
          </article>
        ))}

        {!filtered.length && (
          <div className="rounded-xl border border-border bg-background-elevated p-8 text-center text-foreground-muted">
            No boutiques match your search or filter.
          </div>
        )}
      </div>
    </div>
  );
}
