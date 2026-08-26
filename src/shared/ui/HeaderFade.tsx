import { cn } from "@/shared/lib/cn"

/**
 * A no-blur "fade" that fills a sticky HEADER: a background gradient that is
 * solid at the top edge and ramps to transparent at the header's bottom, so
 * content scrolling underneath dissolves into the background with no hard line.
 * Cheaper than a progressive blur, but only convincing on a flat background.
 *
 * Extends below its parent, so give the header a transparent background and render
 * its own content above this layer (e.g. `relative z-10`).
 */
type HeaderFadeVariant = "gradient" | "material"

export function HeaderFade({
  className,
  variant = "gradient",
}: {
  className?: string
  variant?: HeaderFadeVariant
}) {
  return (
    <div
      aria-hidden
      className={cn(
        variant === "material"
          ? "header-fade-material pointer-events-none absolute inset-x-0 top-0 z-0 h-[150%]"
          : "pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background via-background/85 to-transparent",
        className,
      )}
    />
  )
}
