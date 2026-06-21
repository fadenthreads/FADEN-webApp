"use client";

interface ThreadLineProps {
  scrollProgress: number;
}

export function ThreadLine({ scrollProgress }: ThreadLineProps) {
  const height = 40 + scrollProgress * 120;

  return (
    <svg
      width="3"
      height={height}
      viewBox={`0 0 3 ${height}`}
      className="mt-3 overflow-visible"
      aria-hidden
    >
      <path
        d={`M1.5 0 Q ${1.5 + Math.sin(scrollProgress * 8) * 1.5} ${height / 2} 1.5 ${height}`}
        fill="none"
        stroke="url(#threadGold)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          strokeDasharray: `${scrollProgress * 200} 200`,
        }}
      />
      <defs>
        <linearGradient id="threadGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
