"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@faden/ui";
import { PremiumCard } from "@/components/ui/premium-card";
import { PostedAt } from "@/components/ui/posted-at";
import { sendMessage } from "@/actions/operations";
import type { ConversationSummary, MessageRow } from "@/lib/customization/queries";
import { formatPostedAt } from "@/lib/datetime/format";

interface MessagesPanelProps {
  conversations: ConversationSummary[];
  initialMessages: Record<string, MessageRow[]>;
  mode?: "owner" | "customer";
  embedded?: boolean;
}

function conversationLabel(conv: ConversationSummary, mode: "owner" | "customer") {
  if (mode === "customer") {
    return conv.boutique_name ?? "Boutique";
  }
  return conv.customer_name || conv.customer_email || "Customer";
}

function isOwnMessage(senderType: string, mode: "owner" | "customer") {
  return mode === "owner" ? senderType === "boutique" : senderType === "customer";
}

export function MessagesPanel({
  conversations,
  initialMessages,
  mode = "owner",
  embedded = false,
}: MessagesPanelProps) {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [messagesByConversation, setMessagesByConversation] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const activeMessages = activeId ? messagesByConversation[activeId] ?? [] : [];
  const ownSenderType = mode === "owner" ? "boutique" : "customer";

  function handleSend() {
    if (!activeId || !draft.trim()) return;
    setError(null);
    const body = draft.trim();
    setDraft("");

    startTransition(async () => {
      const result = await sendMessage({ conversationId: activeId, body });
      if (!result.ok) {
        setError(result.error ?? "Failed to send message");
        setDraft(body);
        return;
      }

      setMessagesByConversation((prev) => ({
        ...prev,
        [activeId]: [
          ...(prev[activeId] ?? []),
          {
            id: `local-${Date.now()}`,
            body,
            sender_type: ownSenderType,
            created_at: new Date().toISOString(),
            sender_id: null,
          },
        ],
      }));
    });
  }

  if (!conversations.length) {
    return (
      <PremiumCard hover={false}>
        {!embedded && (
          <h3 className="font-display text-lg font-semibold text-gold">Messages</h3>
        )}
        <p className={embedded ? "text-sm text-foreground-muted" : "mt-4 text-sm text-foreground-muted"}>
          {mode === "customer"
            ? "Messages appear here when you submit a customization request to a boutique."
            : "Conversations start when a customer submits a customization request to your boutique."}
        </p>
      </PremiumCard>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <PremiumCard hover={false} className="p-0">
        <div className="border-b border-border px-4 py-3">
          <h3 className="font-display text-sm font-semibold text-gold">Inbox</h3>
        </div>
        <ul className="max-h-[420px] overflow-y-auto">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <button
                type="button"
                onClick={() => setActiveId(conv.id)}
                className={`w-full border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-background-elevated ${
                  activeId === conv.id ? "bg-cherry/20" : ""
                }`}
              >
                <p className="text-sm font-medium text-foreground">
                  {conversationLabel(conv, mode)}
                </p>
                {mode === "customer" && conv.boutique_slug && (
                  <p className="mt-0.5 text-[10px] text-gold/70">@{conv.boutique_slug}</p>
                )}
                <p className="mt-1 line-clamp-2 text-xs text-foreground-muted">
                  {conv.last_message ?? "No messages yet"}
                </p>
                {conv.last_message_at && (
                  <p className="mt-1 text-[10px] text-foreground-muted/70">
                    {formatPostedAt(conv.last_message_at)}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </PremiumCard>

      <PremiumCard hover={false} className="flex min-h-[420px] flex-col">
        {mode === "customer" && activeId && (
          <div className="mb-3 border-b border-border pb-3">
            {(() => {
              const active = conversations.find((c) => c.id === activeId);
              if (!active?.boutique_slug) return null;
              return (
                <Link
                  href={`/boutique/${active.boutique_slug}`}
                  className="text-xs text-gold hover:text-gold-light"
                >
                  View {active.boutique_name ?? "boutique"} profile →
                </Link>
              );
            })()}
          </div>
        )}

        {error && (
          <p className="mb-3 rounded-lg border border-red-accent/40 bg-red-accent/10 px-3 py-2 text-sm text-red-accent">
            {error}
          </p>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {activeMessages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                isOwnMessage(message.sender_type, mode)
                  ? "ml-auto bg-cherry/30 text-gold-light"
                  : "bg-background-elevated text-foreground-muted"
              }`}
            >
              <p>{message.body}</p>
              <p className="mt-1 text-[10px] opacity-70">{formatPostedAt(message.created_at)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={mode === "customer" ? "Reply to boutique…" : "Reply to customer…"}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold/40"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <Button type="button" variant="luxury" disabled={pending || !draft.trim()} onClick={handleSend}>
            Send
          </Button>
        </div>
      </PremiumCard>
    </div>
  );
}
