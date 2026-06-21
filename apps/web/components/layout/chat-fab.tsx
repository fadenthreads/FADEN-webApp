"use client";

import { MessageCircle } from "lucide-react";

export function ChatFab() {
  return (
    <button
      type="button"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-burgundy text-white shadow-lg transition-all hover:scale-105 hover:bg-burgundy-light hover:shadow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      aria-label="Open chat support"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
