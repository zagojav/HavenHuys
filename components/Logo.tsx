interface LogoProps {
  /** Rendered height in px. Width follows the viewBox ratio. */
  height?: number;
  className?: string;
}

/**
 * The Haven Huis wordmark: the shop name set in the editorial serif with a
 * hand-drawn ceramic brush stroke beneath it.
 *
 * Colour comes from `currentColor`, so the mark inherits `text-accent` in the
 * header and a warm cream in the dark footer without a second asset.
 */
export function Logo({ height = 30, className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 268 60"
      height={height}
      width={(268 / 60) * height}
      role="img"
      aria-label="Haven Huis"
      className={className}
      focusable="false"
    >
      <text
        x="0"
        y="38"
        fill="currentColor"
        fontFamily="var(--font-display), Georgia, serif"
        fontSize="38"
        fontWeight="500"
        letterSpacing="-0.5"
        style={{ fontVariationSettings: "'SOFT' 20, 'WONK' 1" }}
      >
        Haven Huis
      </text>

      {/* Ceramic brush stroke — thins toward both ends like a loaded brush. */}
      <path
        d="M3 51.2c38.4 5.1 78.9 4.4 118.2 1.9 37.4-2.4 74.9-4.6 112.3-1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
