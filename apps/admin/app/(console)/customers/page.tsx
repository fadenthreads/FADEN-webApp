import { isSupabaseConfigured, listAllCustomersForAdmin } from "@faden/database";
import { createClient } from "@/lib/supabase/server";
import { AllCustomersDirectory } from "@/components/all-customers-directory";

async function getCustomers() {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    return await listAllCustomersForAdmin(supabase);
  } catch {
    return [];
  }
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-gold">CUSTOMERS</p>
      <h1 className="mt-2 font-display text-3xl font-bold">All Customers</h1>
      <p className="mt-2 text-foreground-muted">
        View registered customers, contact details, and platform activity at a glance.
      </p>
      <div className="mt-8">
        <AllCustomersDirectory customers={customers} />
      </div>
    </div>
  );
}
