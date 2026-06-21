import { isSupabaseConfigured, listPendingModificationRequests } from "@faden/database";
import { createClient } from "@/lib/supabase/server";
import { PendingModifications } from "@/components/pending-modifications";

async function getPendingModifications() {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    return await listPendingModificationRequests(supabase);
  } catch {
    return [];
  }
}

export default async function ModificationsPage() {
  const requests = await getPendingModifications();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">PROFILE UPDATES</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Modification Requests</h1>
      <p className="mt-2 text-foreground-muted">
        Review profile changes submitted by verified boutique owners before they go live.
      </p>
      <div className="mt-8">
        <PendingModifications requests={requests} />
      </div>
    </div>
  );
}
