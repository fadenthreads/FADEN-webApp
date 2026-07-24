"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@faden/utils";
import { Button } from "@faden/ui";
import { useUser } from "@/hooks/use-user";
import { useNotificationsOptional } from "@/components/notifications/notifications-provider";
import { formatPostedAt } from "@/lib/datetime/format";

interface NotificationBellProps {
  className?: string;
  onNavigate?: () => void;
}

export function NotificationBell({ className, onNavigate }: NotificationBellProps) {
  const { user } = useUser();
  const notificationsCtx = useNotificationsOptional();
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const unreadCount = notificationsCtx?.unreadCount ?? 0;
  const notifications = notificationsCtx?.notifications ?? [];

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-full p-2 text-navy transition-colors duration-200 hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
        aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-navy px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-border/60 bg-background-elevated shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold text-navy">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void notificationsCtx?.markAllRead()}
                className="text-xs font-medium text-navy/80 transition-colors hover:text-navy"
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-foreground-muted">
                No notifications yet. Submit a customization request to get updates here.
              </li>
            ) : (
              notifications.map((item) => (
                <li key={item.id} className="border-b border-border/40 last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.readAt) void notificationsCtx?.markRead([item.id]);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors duration-200 hover:bg-background-soft",
                      !item.readAt && "bg-navy/[0.04]",
                    )}
                  >
                    <p className="text-sm leading-relaxed text-foreground">{item.body}</p>
                    <p className="mt-1 text-[11px] text-foreground-muted">{formatPostedAt(item.createdAt)}</p>
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-border/60 p-3">
            <Button asChild variant="luxury-outline" size="sm" className="w-full">
              <Link href="/account/messages" onClick={() => { setOpen(false); onNavigate?.(); }}>
                View all messages
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
