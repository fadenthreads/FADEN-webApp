"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import {
  addBoutiqueService,
  removeBoutiqueService,
  updateBoutiqueListingSettings,
} from "@/actions/boutique-listings";
import type { OwnerListingSettings } from "@/lib/dashboard/boutique-listings";
import {
  BOUTIQUE_SERVICE_SUGGESTIONS,
  filterServiceSuggestions,
} from "@/lib/boutique/service-suggestions";

const LISTING_FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-gold/25 bg-black px-3 py-2 text-sm text-white placeholder:text-white/45 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30";

const LISTING_INLINE_FIELD_CLASS =
  "min-w-0 flex-1 rounded-lg border border-gold/25 bg-black px-3 py-2 text-sm text-white placeholder:text-white/45 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30";

interface ListingsPanelProps {
  listing: OwnerListingSettings;
}

export function ListingsPanel({ listing }: ListingsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [pricingInfo, setPricingInfo] = useState(listing.pricingInfo ?? "");
  const [avgDeliveryTime, setAvgDeliveryTime] = useState(listing.avgDeliveryTime ?? "");
  const [workingHours, setWorkingHours] = useState(listing.workingHours ?? "");
  const [availability, setAvailability] = useState<"open" | "closed">(listing.availability);
  const [pauseReason, setPauseReason] = useState(listing.pauseReason ?? "");
  const [newService, setNewService] = useState("");

  const existingServiceLabels = useMemo(
    () => listing.services.map((service) => service.label),
    [listing.services],
  );

  const serviceSuggestions = useMemo(
    () => filterServiceSuggestions(BOUTIQUE_SERVICE_SUGGESTIONS, existingServiceLabels, newService),
    [existingServiceLabels, newService],
  );

  const quickServiceSuggestions = useMemo(
    () => filterServiceSuggestions(BOUTIQUE_SERVICE_SUGGESTIONS, existingServiceLabels).slice(0, 10),
    [existingServiceLabels],
  );

  function handleSaveSettings() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateBoutiqueListingSettings({
        boutiqueId: listing.boutiqueId,
        pricingInfo,
        avgDeliveryTime,
        workingHours,
        availability,
        pauseReason: availability === "closed" ? pauseReason : undefined,
      });
      if (!result.ok) {
        setError(result.error ?? "Update failed");
        return;
      }
      setMessage("Listing settings saved.");
      router.refresh();
    });
  }

  function handleAddService() {
    const label = newService.trim();
    if (!label) return;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await addBoutiqueService({ boutiqueId: listing.boutiqueId, label });
      if (!result.ok) {
        setError(result.error ?? "Could not add service");
        return;
      }
      setNewService("");
      setMessage(`Added "${label}".`);
      router.refresh();
    });
  }

  function handleRemoveService(serviceId: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await removeBoutiqueService({ boutiqueId: listing.boutiqueId, serviceId });
      if (!result.ok) {
        setError(result.error ?? "Could not remove service");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <PremiumCard hover={false}>
        <h3 className="font-display text-lg font-semibold text-gold">Products & Service Listings</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Update pricing, delivery expectations, availability, and services shown on your public profile.
        </p>
      </PremiumCard>

      <PremiumCard hover={false}>
        <h4 className="font-semibold text-gold">Pricing & delivery</h4>
        <div className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="text-foreground-muted">Pricing overview</span>
            <textarea
              value={pricingInfo}
              onChange={(event) => setPricingInfo(event.target.value)}
              rows={3}
              placeholder="e.g. Blouses from ₹2,500 · Lehengas from ₹18,000"
              className={LISTING_FIELD_CLASS}
            />
          </label>
          <label className="block text-sm">
            <span className="text-foreground-muted">Average delivery time</span>
            <input
              type="text"
              value={avgDeliveryTime}
              onChange={(event) => setAvgDeliveryTime(event.target.value)}
              placeholder="e.g. 10–14 days"
              className={LISTING_FIELD_CLASS}
            />
          </label>
          <label className="block text-sm">
            <span className="text-foreground-muted">Working hours</span>
            <input
              type="text"
              value={workingHours}
              onChange={(event) => setWorkingHours(event.target.value)}
              placeholder="e.g. Mon–Sat 10am–7pm"
              className={LISTING_FIELD_CLASS}
            />
          </label>
        </div>
      </PremiumCard>

      <PremiumCard hover={false}>
        <h4 className="font-semibold text-gold">Availability for customers</h4>
        <p className="mt-2 text-sm text-foreground-muted">
          Customers see this status on your boutique profile and discovery cards.
        </p>
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="availability"
                checked={availability === "open"}
                onChange={() => setAvailability("open")}
              />
              Available — accepting new orders
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="availability"
                checked={availability === "closed"}
                onChange={() => setAvailability("closed")}
              />
              Not available — paused
            </label>
          </div>
          {availability === "closed" && (
            <label className="block text-sm">
              <span className="text-foreground-muted">Optional note for customers</span>
              <textarea
                value={pauseReason}
                onChange={(event) => setPauseReason(event.target.value)}
                rows={2}
                placeholder="e.g. Fully booked until next month"
                className={LISTING_FIELD_CLASS}
              />
            </label>
          )}
        </div>
      </PremiumCard>

      <PremiumCard hover={false}>
        <h4 className="font-semibold text-gold">Services offered</h4>
        {listing.outfitTypes.length > 0 && (
          <p className="mt-2 text-sm text-foreground-muted">
            Outfit types: {listing.outfitTypes.map((item) => item.label).join(", ")}
          </p>
        )}
        <ul className="mt-4 space-y-2">
          {listing.services.map((service) => (
            <li
              key={service.id}
              className="flex items-center justify-between rounded-lg border border-gold/10 px-3 py-2 text-sm"
            >
              <span>{service.label}</span>
              <button
                type="button"
                onClick={() => handleRemoveService(service.id)}
                disabled={pending}
                className="text-xs text-foreground-muted hover:text-gold"
              >
                Remove
              </button>
            </li>
          ))}
          {!listing.services.length && (
            <li className="text-sm text-foreground-muted">No services listed yet.</li>
          )}
        </ul>
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={newService}
              onChange={(event) => setNewService(event.target.value)}
              list="boutique-service-suggestions"
              placeholder="Type a service — suggestions appear as you type"
              className={LISTING_INLINE_FIELD_CLASS}
            />
            <datalist id="boutique-service-suggestions">
              {serviceSuggestions.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
            <Button type="button" onClick={handleAddService} disabled={pending || !newService.trim()}>
              Add service
            </Button>
          </div>
          {quickServiceSuggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-foreground-muted">Suggestions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickServiceSuggestions.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setNewService(label)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      newService.toLowerCase() === label.toLowerCase()
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-border text-foreground-muted hover:border-gold/40 hover:text-gold"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-foreground-muted/70">
          Outfit types are managed during boutique registration or profile modification requests.
        </p>
      </PremiumCard>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-gold">{message}</p>}

      <Button type="button" onClick={handleSaveSettings} disabled={pending}>
        {pending ? "Saving…" : "Save listing settings"}
      </Button>
    </div>
  );
}
