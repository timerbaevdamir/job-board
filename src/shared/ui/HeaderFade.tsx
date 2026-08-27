import { cn } from "@/shared/lib/cn"

/**
 * A no-blur "fade" that fills sticky chrome: a background gradient that is
 * solid at the attached edge and ramps to transparent at the free edge, so
 * content scrolling underneath dissolves into the background with no hard line.
 * Cheaper than a progressive blur, but only convincing on a flat background.
 *
 * `to="bottom"` (default) is a header: opaque at the top, transparent below.
 * `to="top"` is a footer: opaque at the bottom, transparent above — same stops.
 *
 * Extends past its parent, so give the chrome a transparent background and
 * render its own content above this layer (e.g. `relative z-10`).
 */
type HeaderFadeVariant = "gradient" | "material"

export function HeaderFade({
  className,
  variant = "gradient",
  to = "bottom",
}: {
  className?: string
  variant?: HeaderFadeVariant
  to?: "bottom" | "top"
}) {
  const fadeClass =
    variant === "material"
      ? "header-fade-material pointer-events-none absolute inset-x-0 top-0 z-0 h-[150%]"
      : to === "top"
        ? "pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[150%] bg-gradient-to-t from-background via-background/85 to-transparent"
        : "pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background via-background/85 to-transparent"

  return <div aria-hidden className={cn(fadeClass, className)} />
}
