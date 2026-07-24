import Link from "next/link";
import { homeHref } from "@/lib/landing/home-nav";

export function Logo() {
  return (
    <Link
      href={homeHref()}
      className="faden-logo-gradient font-logo text-5xl font-bold leading-none tracking-[0.16em] text-navy md:text-6xl"
    >
      FADEN
    </Link>
  );
}
