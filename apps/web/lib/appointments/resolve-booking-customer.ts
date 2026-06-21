import type { SupabaseClient } from "@supabase/supabase-js";

function readBoutiqueOwnerId(value: unknown): string | null {
  if (Array.isArray(value)) {
    return (value[0] as { owner_id?: string } | undefined)?.owner_id ?? null;
  }
  return (value as { owner_id?: string } | null)?.owner_id ?? null;
}

/**
 * When a boutique owner books from a customization request, persist the
 * customer's id — not the owner's. Customers booking for themselves unchanged.
 */
export async function resolveBookingCustomerId(
  supabase: SupabaseClient,
  actorUserId: string,
  input: { boutiqueId: string; customizationRequestId?: string },
): Promise<{ customerId: string } | { error: string }> {
  if (!input.customizationRequestId) {
    return { customerId: actorUserId };
  }

  const { data: request, error } = await supabase
    .from("customization_requests")
    .select("customer_id, boutique_id, boutiques ( owner_id )")
    .eq("id", input.customizationRequestId)
    .maybeSingle();

  if (error || !request) {
    return { error: "Customization request not found" };
  }

  if (request.boutique_id !== input.boutiqueId) {
    return { error: "Request does not belong to this boutique" };
  }

  const ownerId = readBoutiqueOwnerId(request.boutiques);
  if (ownerId === actorUserId) {
    return { customerId: request.customer_id as string };
  }

  if (request.customer_id === actorUserId) {
    return { customerId: actorUserId };
  }

  return { error: "Not authorized to book for this request" };
}
