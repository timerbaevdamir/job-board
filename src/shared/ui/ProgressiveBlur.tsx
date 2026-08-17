import { cn } from "@/shared/lib/cn"

/**
 * Progressive ("Apple/Vercel-style") blur that fills a sticky HEADER: a stack
 * of absolutely-positioned layers, each with a larger blur radius and an
 * overlapping mask shifted upward, so the blur ramps from full at the top edge
 * to nothing at the header's bottom — content scrolling underneath dissolves
 * with no hard line and no visible banding (a single `backdrop-filter` can't do
 * a gradual ramp — that's why the layers overlap). Click-through and purely
 * presentational.
 *
 * Fills its parent (`inset-0`), so give the header `relative` with a transparent
 * background and render its own content above this layer (e.g. `relative z-10`).
 */
const LAYERS = [
  {
    blur: 0.5,
    mask: "linear-gradient(to top, transparent 0%, #000 20%, #000 45%, transparent 70%)",
  },
  {
    blur: 1,
    mask: "linear-gradient(to top, transparent 20%, #000 45%, #000 70%, transparent 95%)",
  },
  {
    blur: 2,
    mask: "linear-gradient(to top, transparent 45%, #000 70%, #000 95%, transparent 100%)",
  },
  { blur: 4, mask: "linear-gradient(to top, transparent 70%, #000 95%)" },
] as const

export function ProgressiveBlur({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
    >
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            backdropFilter: `blur(${layer.blur}px)`,
            WebkitBackdropFilter: `blur(${layer.blur}px)`,
            maskImage: layer.mask,
            WebkitMaskImage: layer.mask,
          }}
        />
      ))}
    </div>
  )
}
