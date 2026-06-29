"use client";

export function HeroDecoration() {
  return (
    <>
      <div
        className="pointer-events-none absolute -right-8 top-1/4 hidden h-64 w-64 rounded-full bg-gold/5 blur-3xl lg:block"
        aria-hidden
      />
      <svg
        className="pointer-events-none absolute right-8 top-1/4 hidden h-[50vh] w-12 -translate-y-8 opacity-60 lg:block xl:right-16"
        viewBox="0 0 48 400"
        fill="none"
        aria-hidden
      >
        <path
          className="faden-hero-line"
          d="M24 0 C 36 60, 12 120, 24 180 C 36 240, 12 300, 24 360 L 24 400"
          stroke="url(#goldLineGradient)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="goldLineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4b87a" stopOpacity="0.15" />
            <stop offset="40%" stopColor="#b8860b" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#b8860b" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}
