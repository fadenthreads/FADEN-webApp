"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, Send, Mail, ExternalLink } from "lucide-react";
import { Button } from "@faden/ui";
import {
  FADEN_SUPPORT_EMAIL,
  SUPPORT_QUICK_QUESTIONS,
  buildSupportMailto,
  defaultAssistantGreeting,
  type SupportChatMessage,
} from "@/lib/support/faden-support-chat";
import { FADEN_CONTACT } from "@/lib/content/faden-contact";

interface SupportChatPanelProps {
  open: boolean;
  onClose: () => void;
}

function findQuickAnswer(text: string): string | null {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return null;

  const match = SUPPORT_QUICK_QUESTIONS.find((item) => {
    const label = item.label.toLowerCase();
    return (
      normalized.includes(label.toLowerCase()) ||
      label.includes(normalized) ||
      item.id.replace(/-/g, " ").includes(normalized)
    );
  });

  if (match) return match.answer;

  if (normalized.includes("payment") || normalized.includes("pay")) {
    return SUPPORT_QUICK_QUESTIONS.find((q) => q.id === "payments")!.answer;
  }
  if (normalized.includes("custom") || normalized.includes("outfit")) {
    return SUPPORT_QUICK_QUESTIONS.find((q) => q.id === "customize")!.answer;
  }
  if (normalized.includes("boutique") || normalized.includes("register")) {
    return SUPPORT_QUICK_QUESTIONS.find((q) => q.id === "boutique")!.answer;
  }
  if (normalized.includes("map") || normalized.includes("location")) {
    return SUPPORT_QUICK_QUESTIONS.find((q) => q.id === "location")!.answer;
  }

  return null;
}

export function SupportChatPanel({ open, onClose }: SupportChatPanelProps) {
  const [messages, setMessages] = useState<SupportChatMessage[]>([defaultAssistantGreeting()]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  function appendMessage(role: SupportChatMessage["role"], body: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role,
        body,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  function handleQuickQuestion(question: (typeof SUPPORT_QUICK_QUESTIONS)[number]) {
    appendMessage("user", question.label);
    appendMessage("assistant", question.answer);
  }

  function handleSend() {
    const text = draft.trim();
    if (!text) return;

    appendMessage("user", text);
    setDraft("");

    const quickAnswer = findQuickAnswer(text);
    if (quickAnswer) {
      appendMessage("assistant", quickAnswer);
      return;
    }

    appendMessage(
      "assistant",
      `Thanks for your question. Our FADEN team can follow up by email. Tap "Email FADEN team" below to send this message to ${FADEN_SUPPORT_EMAIL}, or visit Help / FAQ for more.`,
    );
  }

  if (!open) return null;

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.body ?? "";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-end sm:justify-end sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close support chat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="faden-support-chat-title"
        className="relative flex h-[min(85dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:mb-20 sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-gold">FADEN SUPPORT</p>
            <h2 id="faden-support-chat-title" className="font-display text-lg font-semibold">
              Ask us anything
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-soft hover:text-foreground"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-burgundy text-white"
                    : "border border-border bg-background-elevated text-foreground"
                }`}
              >
                {message.body}
              </div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-border px-4 py-3">
          <p className="mb-2 text-xs font-medium text-foreground-muted">Quick questions</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {SUPPORT_QUICK_QUESTIONS.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() => handleQuickQuestion(question)}
                className="rounded-full border border-border bg-background-elevated px-3 py-1 text-xs text-foreground transition-colors hover:border-gold/40 hover:text-gold"
              >
                {question.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={2}
              placeholder="Type your question…"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-background-elevated px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
            />
            <Button type="button" variant="luxury" size="sm" className="self-end px-3" onClick={handleSend}>
              <Send className="h-4 w-4" aria-hidden />
              <span className="sr-only">Send</span>
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="luxury-outline" size="sm">
              <a href={FADEN_CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp us
              </a>
            </Button>
            {lastUserMessage && (
              <Button asChild variant="luxury-outline" size="sm">
                <a href={buildSupportMailto(lastUserMessage)}>
                  <Mail className="mr-2 h-4 w-4" aria-hidden />
                  Email FADEN team
                </a>
              </Button>
            )}
            <Button asChild variant="luxury-outline" size="sm">
              <Link href="/help" onClick={onClose}>
                Help center
              </Link>
            </Button>
            <Button asChild variant="luxury-outline" size="sm">
              <Link href="/faq" onClick={onClose}>
                FAQ
                <ExternalLink className="ml-2 h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
