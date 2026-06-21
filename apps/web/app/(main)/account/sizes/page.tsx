import { AccountSectionHeader } from "@/components/account/account-section-header";
import { SavedSizesPanel } from "@/components/account/saved-sizes-panel";
import { requireAccountUser } from "@/lib/account/require-account-user";
import {
  isSavedProfilesAvailable,
  listCustomerMeasurementProfiles,
} from "@/lib/measurement/saved-profiles";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Saved Sizes — FADEN",
  description: "Manage your saved measurement profiles.",
};

export const dynamic = "force-dynamic";

export default async function AccountSizesPage() {
  const { user, supabase } = await requireAccountUser("/account/sizes");

  let profiles: Awaited<ReturnType<typeof listCustomerMeasurementProfiles>> = [];
  let tableAvailable = false;

  if (isWebSupabaseConfigured()) {
    try {
      tableAvailable = await isSavedProfilesAvailable(supabase);
      if (tableAvailable) {
        profiles = await listCustomerMeasurementProfiles(supabase, user.id);
      }
    } catch {
      profiles = [];
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="Saved sizes"
        description="Store measurement profiles for different outfits and reuse them when customizing."
      />
      <SavedSizesPanel profiles={profiles} tableAvailable={tableAvailable} />
    </div>
  );
}
