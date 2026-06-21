import {
  Calendar,
  CreditCard,
  FileText,
  LayoutGrid,
  MessageSquare,
  Package,
  Ruler,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";

export type AccountNavId =
  | "overview"
  | "requests"
  | "orders"
  | "quotations"
  | "payments"
  | "appointments"
  | "sizes"
  | "messages"
  | "reviews";

export interface AccountNavItem {
  id: AccountNavId;
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  countKey?: keyof AccountNavCounts;
}

export interface AccountNavCounts {
  requests: number;
  orders: number;
  quotations: number;
  payments: number;
  appointments: number;
  messages: number;
  reviews: number;
}

export const ACCOUNT_NAV_ITEMS: AccountNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/account",
    description: "Profile and quick links",
    icon: LayoutGrid,
  },
  {
    id: "requests",
    label: "Requests",
    href: "/account/requests",
    description: "Outfit requests sent to boutiques",
    icon: Sparkles,
    countKey: "requests",
  },
  {
    id: "orders",
    label: "Orders",
    href: "/account/orders",
    description: "Track production and delivery",
    icon: Package,
    countKey: "orders",
  },
  {
    id: "quotations",
    label: "Quotations",
    href: "/account/quotations",
    description: "Price quotes from boutiques",
    icon: FileText,
    countKey: "quotations",
  },
  {
    id: "payments",
    label: "Payments",
    href: "/account/payments",
    description: "Pay for confirmed orders",
    icon: CreditCard,
    countKey: "payments",
  },
  {
    id: "appointments",
    label: "Fittings & visits",
    href: "/account/appointments",
    description: "Video fittings and home measurement visits",
    icon: Calendar,
    countKey: "appointments",
  },
  {
    id: "sizes",
    label: "Saved sizes",
    href: "/account/sizes",
    description: "Your saved measurement profiles",
    icon: Ruler,
  },
  {
    id: "messages",
    label: "Messages",
    href: "/account/messages",
    description: "Chat with boutiques",
    icon: MessageSquare,
    countKey: "messages",
  },
  {
    id: "reviews",
    label: "Reviews",
    href: "/account/reviews",
    description: "Rate delivered orders",
    icon: Star,
    countKey: "reviews",
  },
];

export function isAccountNavActive(pathname: string, href: string): boolean {
  if (href === "/account") return pathname === "/account";
  return pathname === href || pathname.startsWith(`${href}/`);
}
