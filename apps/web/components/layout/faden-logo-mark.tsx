import Image from "next/image";
import Link from "next/link";
import { cn } from "@faden/utils";
import { homeHref } from "@/lib/landing/home-nav";

const LOGO_SRC = "/faden-logo.png";

interface FadenLogoMarkProps {
  className?: string;
  imageClassName?: string;
  height?: number;
  priority?: boolean;
  linked?: boolean;
  /** Large hero treatment — fills most of the viewport height. */
  variant?: "default" | "hero";
}

export function FadenLogoMark({
  className,
  imageClassName,
  height = 44,
  priority = false,
  linked = true,
  variant = "default",
}: FadenLogoMarkProps) {
  const isHero = variant === "hero";

  const image = (
    <Image
      src={LOGO_SRC}
      alt="FADEN"
      width={280}
      height={390}
      priority={priority}
      className={cn(
        "w-auto object-contain",
        isHero && "h-[min(68vh,720px)] max-w-[min(92vw,520px)]",
        imageClassName,
      )}
      style={isHero ? undefined : { height, width: "auto" }}
    />
  );

  if (!linked) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link href={homeHref()} className={cn("inline-flex shrink-0 items-center", className)} aria-label="FADEN home">
      {image}
    </Link>
  );
}
