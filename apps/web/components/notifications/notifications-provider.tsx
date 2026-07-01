"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createBrowserClient, isBrowserSupabaseConfigured } from "@/lib/supabase/client";
import { useUser } from "@/hooks/use-user";
import type { CustomerNotification } from "@/lib/notifications/queries";

interface NotificationsContextValue {
  notifications: CustomerNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

async function fetchNotifications(): Promise<{
  notifications: CustomerNotification[];
  unreadCount: number;
}> {
  const res = await fetch("/api/notifications", { credentials: "include" });
  const data = (await res.json()) as {
    notifications?: CustomerNotification[];
    unreadCount?: number;
  };
  return {
    notifications: data.notifications ?? [],
    unreadCount: data.unreadCount ?? 0,
  };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return;
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      await refresh();
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    await refresh();
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user || !isBrowserSupabaseConfigured()) return;

    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refresh,
      markAllRead,
      markRead,
    }),
    [notifications, unreadCount, loading, refresh, markAllRead, markRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

export function useNotificationsOptional() {
  return useContext(NotificationsContext);
}
