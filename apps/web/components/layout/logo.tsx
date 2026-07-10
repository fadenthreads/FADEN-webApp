import Link from "next/link";
import Image from "next/image";
import { homeHref } from "@/lib/landing/home-nav";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href={homeHref()} className="group flex min-w-0 items-center gap-2.5 sm:gap-3">
      <Image
        src="/faden-emblem.png"
        alt=""
        width={40}
        height={40}
        className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
        aria-hidden
      />
      <span className="min-w-0">
        <span className="faden-logo-gradient block font-logo text-xl font-bold tracking-[0.12em] text-navy sm:text-2xl md:text-3xl">
          FADEN
        </span>
        {!compact && (
          <span className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.14em] text-gold/90 sm:block sm:text-[10px]">
            Fashion struggles reduced to near zero
          </span>
        )}
      </span>
    </Link>
  );
}
