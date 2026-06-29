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
        className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-navy text-white shadow-lg transition-all hover:scale-105 hover:bg-navy-light hover:shadow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label="Open FADEN support chat"
        aria-expanded={open}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
      <SupportChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
