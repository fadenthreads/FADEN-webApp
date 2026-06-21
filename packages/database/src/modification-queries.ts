import type { SupabaseClient } from "@supabase/supabase-js";
import type { BoutiqueRegistrationInput } from "@faden/validators";
import type { VerificationStatus } from "@faden/types";
import { getBoutiqueFormById } from "./boutique-form-queries";

export interface AdminModificationRequest {
  id: string;
  status: VerificationStatus;
  owner_notes: string | null;
  submitted_at: string;
  payload: BoutiqueRegistrationInput;
  currentDetails: BoutiqueRegistrationInput;
  boutique: {
    id: string;
    name: string;
    slug: string;
    owner_name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
}

export async function listPendingModificationRequests(
  supabase: SupabaseClient,
): Promise<AdminModificationRequest[]> {
  const { data, error } = await supabase
    .from("boutique_modification_requests")
    .select(
      `
      id,
      status,
      owner_notes,
      submitted_at,
      payload,
      boutique_id,
      boutiques ( id, name, slug, owner_name, phone, email, address )
    `,
    )
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(error.message);

  const requests = await Promise.all(
    (data ?? []).map(async (row) => {
      const boutiqueRaw = row.boutiques;
      const boutique = Array.isArray(boutiqueRaw) ? boutiqueRaw[0] : boutiqueRaw;
      const boutiqueId = (boutique as { id: string } | null)?.id ?? (row.boutique_id as string);

      let currentDetails: BoutiqueRegistrationInput = row.payload as BoutiqueRegistrationInput;
      try {
        const live = await getBoutiqueFormById(supabase, boutiqueId);
        if (live) currentDetails = live.form;
      } catch {
        // Fall back to payload if live read fails.
      }

      return {
        id: row.id,
        status: row.status as VerificationStatus,
        owner_notes: row.owner_notes,
        submitted_at: row.submitted_at,
        payload: row.payload as BoutiqueRegistrationInput,
        currentDetails,
        boutique: boutique as AdminModificationRequest["boutique"],
      };
    }),
  );

  return requests;
}
