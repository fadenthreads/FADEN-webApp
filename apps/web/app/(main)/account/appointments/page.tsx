import { AccountSectionHeader } from "@/components/account/account-section-header";
import { CustomerAppointmentsPanel } from "@/components/appointments/customer-appointments-panel";
import { CustomerHomeVisitsPanel } from "@/components/home-visits/home-visits-panels";
import { PremiumCard } from "@/components/ui/premium-card";
import { listCustomerAppointments } from "@/lib/appointments/queries";
import { listCustomerHomeVisits } from "@/lib/home-visits/queries";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Fittings & Visits — FADEN",
  description: "Your video fittings and home measurement visits.",
};

export const dynamic = "force-dynamic";

export default async function AccountAppointmentsPage() {
  const { user, supabase } = await requireAccountUser("/account/appointments");

  let appointments: Awaited<ReturnType<typeof listCustomerAppointments>> = [];
  let homeVisits: Awaited<ReturnType<typeof listCustomerHomeVisits>> = [];
  let error: string | null = null;

  if (isWebSupabaseConfigured()) {
    try {
      [appointments, homeVisits] = await Promise.all([
        listCustomerAppointments(supabase, user.id),
        listCustomerHomeVisits(supabase, user.id),
      ]);
    } catch (err) {
      error = err instanceof Error ? err.message : "Could not load appointments";
    }
  }

  return (
    <div>
      <AccountSectionHeader
        title="Fittings & visits"
        description="Video sessions with boutique tailors and home measurement visits."
      />
      {error && (
        <PremiumCard className="mb-6 border-amber-500/30 bg-amber-500/5" hover={false}>
          <p className="text-sm text-amber-200">{error}</p>
        </PremiumCard>
      )}
      <div className="space-y-10">
        <section>
          <h2 className="font-display text-lg font-semibold">Video fittings</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Join live video measurement sessions when your slot is active.
          </p>
          <div className="mt-4">
            <CustomerAppointmentsPanel appointments={appointments} embedded />
          </div>
        </section>
        <section>
          <h2 className="font-display text-lg font-semibold">Home measurement visits</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Track boutique home visits booked from your customization requests.
          </p>
          <div className="mt-4">
            <CustomerHomeVisitsPanel visits={homeVisits} embedded />
          </div>
        </section>
      </div>
    </div>
  );
}
