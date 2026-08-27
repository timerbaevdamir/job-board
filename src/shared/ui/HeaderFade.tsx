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
 * Fills the chrome only — a backdrop under the control, not a veil on the
 * list. Put the control above it (`relative z-10`). Material is the exception:
 * it extends past the parent so content can dissolve through the lower fade.
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
        ? "pointer-events-none absolute inset-0 z-0 bg-gradient-to-t from-background via-background/85 to-transparent"
        : "pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-background via-background/85 to-transparent"

  return <div aria-hidden className={cn(fadeClass, className)} />
}
