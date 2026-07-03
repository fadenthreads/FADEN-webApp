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
}

export function FadenLogoMark({
  className,
  imageClassName,
  height = 44,
  priority = false,
  linked = true,
}: FadenLogoMarkProps) {
  const image = (
    <Image
      src={LOGO_SRC}
      alt="FADEN"
      width={280}
      height={390}
      priority={priority}
      className={cn("w-auto object-contain", imageClassName)}
      style={{ height, width: "auto" }}
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
