import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWebSupabaseConfigured } from "@/lib/supabase/env";
import {
  countUnreadNotifications,
  listCustomerNotifications,
  markNotificationsRead,
} from "@/lib/notifications/queries";

export async function GET() {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const [notifications, unreadCount] = await Promise.all([
    listCustomerNotifications(supabase, user.id),
    countUnreadNotifications(supabase, user.id),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(request: NextRequest) {
  if (!isWebSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json()) as { ids?: string[]; markAll?: boolean };
  let ids = body.ids ?? [];

  if (body.markAll) {
    const notifications = await listCustomerNotifications(supabase, user.id, 100);
    ids = notifications.filter((item) => !item.readAt).map((item) => item.id);
  }

  await markNotificationsRead(supabase, user.id, ids);
  const unreadCount = await countUnreadNotifications(supabase, user.id);

  return NextResponse.json({ ok: true, unreadCount });
}
