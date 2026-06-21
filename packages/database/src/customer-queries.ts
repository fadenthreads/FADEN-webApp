import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminCustomerRecord {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  locationLabel: string | null;
  createdAt: string;
  customizationCount: number;
  orderCount: number;
  conversationCount: number;
}

function readCount(value: unknown): number {
  if (Array.isArray(value) && value[0] && typeof value[0] === "object" && value[0] !== null) {
    const count = (value[0] as { count?: number }).count;
    if (typeof count === "number") return count;
  }
  return 0;
}

export async function listAllCustomersForAdmin(
  supabase: SupabaseClient,
): Promise<AdminCustomerRecord[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      full_name,
      phone,
      location_label,
      created_at,
      customization_requests ( count ),
      orders ( count ),
      conversations ( count )
    `,
    )
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: row.email as string,
    fullName: row.full_name as string | null,
    phone: row.phone as string | null,
    locationLabel: row.location_label as string | null,
    createdAt: row.created_at as string,
    customizationCount: readCount(row.customization_requests),
    orderCount: readCount(row.orders),
    conversationCount: readCount(row.conversations),
  }));
}
