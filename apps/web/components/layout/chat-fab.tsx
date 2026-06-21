"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { SupportChatPanel } from "@/components/layout/support-chat-panel";

export function ChatFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-burgundy text-white shadow-lg transition-all hover:scale-105 hover:bg-burgundy-light hover:shadow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label="Open FADEN support chat"
        aria-expanded={open}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      <SupportChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
