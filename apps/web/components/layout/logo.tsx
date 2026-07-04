import Link from "next/link";
import { homeHref } from "@/lib/landing/home-nav";

export function Logo() {
  return (
    <Link
      href={homeHref()}
      className="faden-logo-gradient font-logo text-3xl font-bold tracking-[0.14em] text-navy md:text-4xl"
    >
      FADEN
    </Link>
  );
}
