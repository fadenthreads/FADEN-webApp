import Link from "next/link";
import { homeHref } from "@/lib/landing/home-nav";

export function Logo() {
  return (
    <Link
      href={homeHref()}
      className="faden-logo-gradient font-display text-2xl font-semibold tracking-tight text-navy md:text-[1.65rem]"
    >
      Faden
    </Link>
  );
}
