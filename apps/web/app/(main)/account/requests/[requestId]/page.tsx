import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CustomizationRequestDetailView } from "@/components/dashboard/customization-request-detail-view";
import { getCustomerCustomizationRequestDetail } from "@/lib/customization/queries";
import { requireAccountUser } from "@/lib/account/require-account-user";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Request Details — FADEN",
  description: "View your full customization request.",
};

export const dynamic = "force-dynamic";

export default async function AccountRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;

  if (!isWebSupabaseConfigured()) {
    redirect("/account/requests");
  }

  const { user, supabase } = await requireAccountUser(`/account/requests/${requestId}`);

  let request = null;
  try {
    request = await getCustomerCustomizationRequestDetail(supabase, user.id, requestId);
  } catch {
    request = null;
  }

  if (!request) {
    notFound();
  }

  return (
    <div>
      <header className="mb-8">
        <Link href="/account/requests" className="text-sm text-gold hover:text-gold-light">
          ← Back to my requests
        </Link>
      </header>
      <CustomizationRequestDetailView request={request} mode="customer" />
    </div>
  );
}
