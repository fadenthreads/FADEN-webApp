import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdminOrderDetail, isSupabaseConfigured, formatAdminOrderRef } from "@faden/database";
import { createClient } from "@/lib/supabase/server";
import { OrderDetailPanel } from "@/components/order-detail-panel";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${formatAdminOrderRef(orderId)} — FADEN Admin`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;

  if (!isSupabaseConfigured()) notFound();

  let order = null;
  try {
    const supabase = await createClient();
    order = await getAdminOrderDetail(supabase, orderId);
  } catch {
    notFound();
  }

  if (!order) notFound();

  return <OrderDetailPanel order={order} />;
}
