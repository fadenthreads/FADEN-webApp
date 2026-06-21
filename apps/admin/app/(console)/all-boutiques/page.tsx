import { isSupabaseConfigured, listAllBoutiqueForms } from "@faden/database";
import { createClient } from "@/lib/supabase/server";
import { AllBoutiquesDirectory } from "@/components/all-boutiques-directory";

async function getAllBoutiques() {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    return await listAllBoutiqueForms(supabase);
  } catch {
    return [];
  }
}

export default async function AllBoutiquesPage() {
  const boutiques = await getAllBoutiques();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">DIRECTORY</p>
      <h1 className="mt-2 font-display text-3xl font-bold">All Boutiques</h1>
      <p className="mt-2 text-foreground-muted">
        Browse every registered boutique, filter by status, and review full profile details.
      </p>
      <div className="mt-8">
        <AllBoutiquesDirectory boutiques={boutiques} />
      </div>
    </div>
  );
}
