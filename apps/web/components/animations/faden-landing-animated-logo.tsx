"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

const GOLD = "#B38B38";
const NAVY = "#0A1128";
const E: [number, number, number, number] = [0.42, 0, 0.58, 1];

// ─── Animated stroke path ────────────────────────────────────────────────────
function Stroke({
  d,
  delay,
  dur,
  sw = 1.2,
  stroke = GOLD,
  fill = "none",
  noAnim = false,
}: {
  d: string;
  delay: number;
  dur: number;
  sw?: number;
  stroke?: string;
  fill?: string;
  noAnim?: boolean;
}) {
  if (noAnim) {
    return (
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  return (
    <motion.path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: dur, delay, ease: E }}
    />
  );
}

// ─── Fade-in group ────────────────────────────────────────────────────────────
function FadeGroup({
  children,
  delay,
  dur = 1.0,
  dy = 0,
  noAnim = false,
}: {
  children: React.ReactNode;
  delay: number;
  dur?: number;
  dy?: number;
  noAnim?: boolean;
}) {
  if (noAnim) return <g>{children}</g>;
  return (
    <motion.g
      initial={{ opacity: 0, y: dy }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur, delay, ease: E }}
    >
      {children}
    </motion.g>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface FadenLandingAnimatedLogoProps {
  onSequenceComplete?: () => void;
}

export function FadenLandingAnimatedLogo({
  onSequenceComplete,
}: FadenLandingAnimatedLogoProps) {
  const rm = useReducedMotion() ?? false;

  useEffect(() => {
    if (!onSequenceComplete) return;
    const t = window.setTimeout(onSequenceComplete, rm ? 400 : 6700);
    return () => clearTimeout(t);
  }, [onSequenceComplete, rm]);

  /**
   * viewBox 0 0 300 430
   * Centre x = 150
   * Arch outer: x 50 – 250, top y ≈ 14, base y = 252
   * Inner arch: x 66 – 234, top y ≈ 40, base y = 244
   * Dress: bodice 76–120, skirt 120–238
   * FADEN text: y ≈ 280
   * Divider:    y ≈ 294
   * Tagline:    y ≈ 311
   * Flourish:   y ≈ 322–365
   */
  return (
    <div
      className="mx-auto w-full max-w-[min(88vw,340px)]"
      aria-label="FADEN — It all starts with a thread"
    >
      <svg
        viewBox="0 0 300 430"
        className="h-auto w-full"
        aria-hidden
      >
        {/* ══════════════════════════════════════════════════════
            PHASE 1 – Mughal Arch Frame   (0 – 1.8 s)
            Outer arch, then inner arch, then base lines
        ══════════════════════════════════════════════════════ */}

        {/* Outer arch: starts bottom-left, traces upward with cusps, returns bottom-right */}
        <Stroke
          noAnim={rm}
          delay={0}
          dur={1.7}
          sw={1.6}
          d={[
            "M 50 252",
            "L 50 162",
            // 4 cusps on left side (inward dips as arch rises)
            "Q 49 155 56 147",
            "Q 63 139 59 131",
            "Q 55 123 63 112",
            "Q 71 101 67 90",
            // sweeps up to peak
            "Q 78 70 97 52",
            "Q 118 34 136 22",
            "Q 150 14 164 22",
            "Q 182 34 203 52",
            "Q 222 70 233 90",
            // 4 cusps on right side (mirror)
            "Q 229 101 237 112",
            "Q 245 123 241 131",
            "Q 237 139 244 147",
            "Q 251 155 250 162",
            "L 250 252",
          ].join(" ")}
        />

        {/* Inner arch */}
        <Stroke
          noAnim={rm}
          delay={0.18}
          dur={1.5}
          sw={0.95}
          d={[
            "M 66 244",
            "L 66 166",
            "Q 65 160 71 153",
            "Q 77 146 74 139",
            "Q 71 132 78 123",
            "Q 85 114 82 105",
            "Q 91 87 108 70",
            "Q 126 52 141 42",
            "Q 150 36 159 42",
            "Q 174 52 192 70",
            "Q 209 87 218 105",
            "Q 215 114 222 123",
            "Q 229 132 226 139",
            "Q 223 146 229 153",
            "Q 235 160 234 166",
            "L 234 244",
          ].join(" ")}
        />

        {/* Outer base line */}
        <Stroke noAnim={rm} delay={1.3} dur={0.5} sw={1.5} d="M 44 252 L 256 252" />
        {/* Inner base line */}
        <Stroke noAnim={rm} delay={1.45} dur={0.4} sw={0.95} d="M 60 244 L 240 244" />

        {/* ══════════════════════════════════════════════════════
            PHASE 2 – Mannequin + Dress Silhouette  (1.0 – 3.0 s)
        ══════════════════════════════════════════════════════ */}

        {/* Mannequin "head" / bust top */}
        <Stroke
          noAnim={rm}
          delay={1.0}
          dur={0.7}
          sw={1.1}
          d="M 144 64 C 142 58 144 52 150 50 C 156 52 158 58 156 64 C 154 68 152 70 150 70 C 148 70 146 68 144 64"
        />

        {/* Neck posts */}
        <Stroke noAnim={rm} delay={1.6} dur={0.3} sw={1.0} d="M 147 70 L 147 78 M 153 70 L 153 78" />

        {/* Shoulder bar */}
        <Stroke noAnim={rm} delay={1.85} dur={0.25} sw={1.0} d="M 140 82 L 160 82" />

        {/* Full dress outline: bodice straps → bodice → skirt */}
        <Stroke
          noAnim={rm}
          delay={1.2}
          dur={1.8}
          sw={1.35}
          d={[
            "M 147 78",
            "L 137 91",
            "C 132 98 130 108 132 116",
            "L 134 122",
            // skirt flare
            "C 120 143 105 168 95 198",
            "C 87 222 87 234 95 239",
            "L 205 239",
            // right skirt
            "C 213 234 213 222 205 198",
            "C 195 168 180 143 166 122",
            "L 168 116",
            "C 170 108 168 98 163 91",
            "L 153 78",
          ].join(" ")}
        />

        {/* V-neck */}
        <Stroke noAnim={rm} delay={1.9} dur={0.5} sw={0.95} d="M 137 91 L 150 104 L 163 91" />

        {/* Bodice waist seam */}
        <Stroke noAnim={rm} delay={2.2} dur={0.3} sw={0.9} d="M 134 122 L 166 122" />

        {/* Bodice decorative pearl dots (centre front) */}
        <Stroke noAnim={rm} delay={2.35} dur={0.4} sw={0.7}
          d="M 149 87 L 151 87 M 148 92 L 152 92 M 148 96 L 152 96 M 149 100 C 149 103 151 103 151 100" />

        {/* ══════════════════════════════════════════════════════
            PHASE 3 – Dress Embroidery Details  (2.5 – 4.6 s)
        ══════════════════════════════════════════════════════ */}

        {/* Bottom border of skirt */}
        <Stroke noAnim={rm} delay={2.5} dur={0.8} sw={1.15} d="M 96 232 L 204 232" />
        <Stroke noAnim={rm} delay={2.65} dur={0.7} sw={0.7} d="M 98 226 L 202 226" />
        {/* Small scallop along bottom border */}
        <Stroke noAnim={rm} delay={2.8} dur={0.6} sw={0.6}
          d="M 98 229 Q 106 225 114 229 Q 122 233 130 229 Q 138 225 150 229 Q 162 233 170 229 Q 178 225 186 229 Q 194 233 202 229" />

        {/* Centre vertical vine */}
        <Stroke noAnim={rm} delay={2.9} dur={1.0} sw={0.9}
          d="M 150 122 C 149 134 150 148 150 162 C 150 176 149 190 150 204 C 151 216 150 224 150 232" />

        {/* Leaf / bud nodes on centre vine */}
        <Stroke noAnim={rm} delay={3.1} dur={0.4} sw={0.65}
          d="M 150 138 C 145 134 140 136 141 140 C 142 144 147 144 150 140" />
        <Stroke noAnim={rm} delay={3.25} dur={0.4} sw={0.65}
          d="M 150 138 C 155 134 160 136 159 140 C 158 144 153 144 150 140" />
        <Stroke noAnim={rm} delay={3.4} dur={0.4} sw={0.65}
          d="M 150 157 C 145 153 140 155 141 159 C 142 163 147 163 150 159" />
        <Stroke noAnim={rm} delay={3.5} dur={0.4} sw={0.65}
          d="M 150 157 C 155 153 160 155 159 159 C 158 163 153 163 150 159" />

        {/* Left lateral vines */}
        <Stroke noAnim={rm} delay={3.0} dur={0.7} sw={0.7} d="M 148 130 C 140 138 134 147 132 157" />
        <Stroke noAnim={rm} delay={3.15} dur={0.7} sw={0.7} d="M 146 148 C 138 156 133 165 132 175" />
        <Stroke noAnim={rm} delay={3.3} dur={0.7} sw={0.7} d="M 145 165 C 138 173 136 181 136 191" />
        <Stroke noAnim={rm} delay={3.45} dur={0.65} sw={0.7} d="M 144 182 C 139 190 138 197 138 206" />

        {/* Right lateral vines (mirror) */}
        <Stroke noAnim={rm} delay={3.0} dur={0.7} sw={0.7} d="M 152 130 C 160 138 166 147 168 157" />
        <Stroke noAnim={rm} delay={3.15} dur={0.7} sw={0.7} d="M 154 148 C 162 156 167 165 168 175" />
        <Stroke noAnim={rm} delay={3.3} dur={0.7} sw={0.7} d="M 155 165 C 162 173 164 181 164 191" />
        <Stroke noAnim={rm} delay={3.45} dur={0.65} sw={0.7} d="M 156 182 C 161 190 162 197 162 206" />

        {/* Flowers at left vine tips (small 4-petal / cross) */}
        <Stroke noAnim={rm} delay={3.6} dur={0.4} sw={0.65}
          d="M 127 158 L 136 158 M 131 154 L 131 162 M 127 154 L 136 162 M 127 162 L 136 154" />
        <Stroke noAnim={rm} delay={3.75} dur={0.4} sw={0.65}
          d="M 127 176 L 135 176 M 131 172 L 131 180" />
        <Stroke noAnim={rm} delay={3.9} dur={0.38} sw={0.65}
          d="M 129 193 L 136 193 M 132 190 L 132 196 M 129 190 L 136 196 M 129 196 L 136 190" />
        <Stroke noAnim={rm} delay={4.05} dur={0.35} sw={0.65}
          d="M 132 208 L 139 208 M 135 205 L 135 211" />

        {/* Flowers at right vine tips */}
        <Stroke noAnim={rm} delay={3.6} dur={0.4} sw={0.65}
          d="M 164 158 L 173 158 M 168 154 L 168 162 M 164 154 L 173 162 M 164 162 L 173 154" />
        <Stroke noAnim={rm} delay={3.75} dur={0.4} sw={0.65}
          d="M 165 176 L 173 176 M 169 172 L 169 180" />
        <Stroke noAnim={rm} delay={3.9} dur={0.38} sw={0.65}
          d="M 164 193 L 171 193 M 167 190 L 167 196 M 164 190 L 171 196 M 164 196 L 171 190" />
        <Stroke noAnim={rm} delay={4.05} dur={0.35} sw={0.65}
          d="M 161 208 L 168 208 M 164 205 L 164 211" />

        {/* Centre rose motif */}
        <Stroke noAnim={rm} delay={3.8} dur={0.75} sw={0.85}
          d="M 150 171 C 146 166 140 164 141 168 C 142 173 146 176 150 176 C 154 176 158 173 159 168 C 160 164 154 166 150 171" />
        {/* Rose petals */}
        <Stroke noAnim={rm} delay={3.95} dur={0.5} sw={0.65}
          d="M 150 164 L 150 158 M 143 167 L 139 163 M 157 167 L 161 163 M 143 175 L 139 179 M 157 175 L 161 179 M 150 178 L 150 184" />

        {/* Large side flowers on dress (luxury lehenga detail) */}
        <Stroke noAnim={rm} delay={4.1} dur={0.55} sw={0.7}
          d="M 112 188 C 108 182 106 176 110 174 C 114 172 118 176 118 182 C 118 188 114 192 110 192 C 107 192 105 189 106 186" />
        <Stroke noAnim={rm} delay={4.2} dur={0.4} sw={0.6}
          d="M 110 174 L 110 168 M 106 176 L 102 172 M 118 176 L 122 172 M 106 188 L 102 192 M 118 188 L 122 192" />

        <Stroke noAnim={rm} delay={4.1} dur={0.55} sw={0.7}
          d="M 188 188 C 192 182 194 176 190 174 C 186 172 182 176 182 182 C 182 188 186 192 190 192 C 193 192 195 189 194 186" />
        <Stroke noAnim={rm} delay={4.2} dur={0.4} sw={0.6}
          d="M 190 174 L 190 168 M 194 176 L 198 172 M 182 176 L 178 172 M 194 188 L 198 192 M 182 188 L 178 192" />

        {/* ══════════════════════════════════════════════════════
            PHASE 4 – FADEN Wordmark  (4.2 – 5.7 s)
        ══════════════════════════════════════════════════════ */}
        <FadeGroup noAnim={rm} delay={4.2} dur={1.5} dy={10}>
          <text
            x="150"
            y="280"
            textAnchor="middle"
            fill={NAVY}
            fontSize="54"
            fontFamily="'Cormorant Garamond', 'Didot', 'Bodoni MT', Georgia, serif"
            letterSpacing="10"
            fontWeight="300"
          >
            FADEN
          </text>
        </FadeGroup>

        {/* ══════════════════════════════════════════════════════
            PHASE 5 – Divider, Tagline & Flourish  (5.1 – 6.7 s)
        ══════════════════════════════════════════════════════ */}

        {/* Gold rule lines + centre ornament */}
        <FadeGroup noAnim={rm} delay={5.1} dur={1.0}>
          <line x1="64"  y1="293" x2="124" y2="293" stroke={GOLD} strokeWidth="0.85" />
          <line x1="176" y1="293" x2="236" y2="293" stroke={GOLD} strokeWidth="0.85" />
          <circle cx="133" cy="293" r="2.2" fill={GOLD} />
          <circle cx="167" cy="293" r="2.2" fill={GOLD} />
          {/* small centre swash */}
          <path d="M 138 290 Q 150 284 162 290 Q 150 298 138 290" fill={GOLD} />
        </FadeGroup>

        {/* Tagline */}
        <FadeGroup noAnim={rm} delay={5.4} dur={1.3} dy={5}>
          <text
            x="150"
            y="311"
            textAnchor="middle"
            fill={GOLD}
            fontSize="7.8"
            fontFamily="'Cormorant Garamond', Georgia, serif"
            letterSpacing="3.2"
            fontWeight="400"
          >
            IT ALL STARTS WITH A THREAD
          </text>
        </FadeGroup>

        {/* Bottom ornamental flourish */}
        <FadeGroup noAnim={rm} delay={5.7} dur={1.0}>
          <circle cx="150" cy="322" r="1.8" fill={GOLD} />
          {/* left scroll */}
          <path
            d={[
              "M 150 327",
              "C 143 330 137 337 136 344",
              "C 135 351 140 354 145 351",
              "C 142 355 137 360 130 362",
            ].join(" ")}
            fill="none"
            stroke={GOLD}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          {/* right scroll (mirror) */}
          <path
            d={[
              "M 150 327",
              "C 157 330 163 337 164 344",
              "C 165 351 160 354 155 351",
              "C 158 355 163 360 170 362",
            ].join(" ")}
            fill="none"
            stroke={GOLD}
            strokeWidth="0.9"
            strokeLinecap="round"
          />
          {/* small diamond accent */}
          <path d="M 150 317 L 153 322 L 150 327 L 147 322 Z" fill={GOLD} />
        </FadeGroup>
      </svg>
    </div>
  );
}
