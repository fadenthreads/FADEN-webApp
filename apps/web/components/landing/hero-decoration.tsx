"use client";

export function HeroDecoration() {
  return (
    <svg
      className="pointer-events-none absolute right-8 top-1/4 hidden h-[55vh] w-16 -translate-y-8 lg:block xl:right-16"
      viewBox="0 0 64 400"
      fill="none"
      aria-hidden
    >
      <path
        className="faden-hero-line"
        d="M32 0 C 48 60, 16 120, 32 180 C 48 240, 16 300, 32 360 L 32 400"
        stroke="url(#goldLineGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="goldLineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5d061" stopOpacity="0.2" />
          <stop offset="30%" stopColor="#d4af37" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#e8a040" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#dc5034" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}
