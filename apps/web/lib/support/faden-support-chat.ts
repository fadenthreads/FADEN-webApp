import { FADEN_CONTACT } from "@/lib/content/faden-contact";

export interface SupportChatMessage {
  id: string;
  role: "user" | "assistant";
  body: string;
  createdAt: string;
}

export const FADEN_SUPPORT_EMAIL = FADEN_CONTACT.primaryEmail;

export const SUPPORT_QUICK_QUESTIONS = [
  {
    id: "what-is-faden",
    label: "What is FADEN?",
    answer:
      "FADEN helps you discover verified custom-fashion boutiques, submit customization requests, order from portfolio designs, and track your journey from inquiry to delivery.",
  },
  {
    id: "customize",
    label: "How do I customize?",
    answer:
      "Go to Customize Outfit, choose Women/Men/Kids, pick an outfit type, add fabric and delivery preferences, and submit. Matching boutiques can respond with quotations.",
  },
  {
    id: "account",
    label: "Do I need an account?",
    answer:
      "You can browse as a guest. Sign in to sync wishlist and cart, manage customization requests, orders, fittings, and saved sizes.",
  },
  {
    id: "location",
    label: "How does location work?",
    answer:
      "Set your city or pin on the map in the header. We use it to sort boutiques by distance and show nearby featured studios.",
  },
  {
    id: "payments",
    label: "Payments & orders",
    answer:
      "Track quotations and payments under Account when signed in. Payment options depend on the boutique and order stage.",
  },
  {
    id: "boutique",
    label: "Register a boutique",
    answer:
      "Use Register Boutique from the menu, submit your portfolio and business details, and our team reviews applications before listing you as verified.",
  },
] as const;

export function buildSupportMailto(body: string): string {
  const subject = encodeURIComponent("FADEN support question");
  const message = encodeURIComponent(body.trim());
  return `mailto:${FADEN_SUPPORT_EMAIL}?subject=${subject}&body=${message}`;
}

export function defaultAssistantGreeting(): SupportChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    body: "Hi! I'm the FADEN assistant. Ask a quick question below or type your own — we'll help with discovery, customization, accounts, and orders.",
    createdAt: new Date().toISOString(),
  };
}
