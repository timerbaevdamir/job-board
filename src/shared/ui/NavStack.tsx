import { useRef, useState, type ReactNode } from "react"
import { cn } from "@/shared/lib/cn"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import { useNavDirection } from "@/shared/lib/router"

type Phase = "idle" | "entering" | "shown" | "leaving"

/**
 * Two screens in one box: a base that stays, and an overlay that slides in over
 * it and back out — a phone's navigation stack, one level deep.
 *
 * Only on a phone. On a wider screen the overlay simply replaces the base, as
 * it always has: the slide says "you went somewhere and can come back", which
 * is what a phone's single column means and what a laid-out page, where the
 * navigation is visible the whole time, does not.
 *
 * The stack is deliberately one deep, and that is why it is this small. In a
 * real stack either screen can be the one arriving or the one being covered, so
 * every transition needs a role swap and a z-index swap to match. Here the roles
 * are fixed — the overlay is always on top, always arrives from the right,
 * always leaves to the right — so none of that exists. If a second level is ever
 * pushed on top of the first, this is the assumption that has to go.
 *
 * The base is not unmounted or hidden while covered; it is translated and left
 * painted, because a parallax needs something behind it to move. It is `inert`
 * instead, so what is visually behind the overlay is also behind it for a screen
 * reader and for the Tab key.
 */
export function NavStack({
  overlay,
  className,
  children,
}: {
  /** The screen on top, or null when only the base is showing. */
  overlay: ReactNode | null
  className?: string
  children: ReactNode
}) {
  const enabled = useLayoutMode() === "mobile"
  const direction = useNavDirection()
  const open = overlay != null

  // The overlay has to keep rendering while it slides away, by which time the
  // route no longer names it. Holding the last one lets it leave with what it
  // was showing instead of emptying on the first frame.
  const last = useRef<ReactNode>(null)
  if (open) last.current = overlay

  // Starts settled, never entering: an overlay that is already there on the
  // first render was deep-linked to, and animating it in would claim a
  // navigation that never happened.
  const [phase, setPhase] = useState<Phase>(open ? "shown" : "idle")
  const settled: Phase = open ? "shown" : "idle"

  // Derived during render rather than in an effect. An effect would settle the
  // phase one frame after the overlay's presence changed, and that frame is
  // exactly the one the overlay would paint in — either a frame late, or a
  // frame at its final position before jumping back out to start. Updating
  // state during render of the same component re-renders before the commit, so
  // the first frame the overlay is painted in is already the right one.
  const prevOpen = useRef(open)
  if (prevOpen.current !== open) {
    prevOpen.current = open
    // `replace` is a correction of the current entry, not a journey — nothing
    // was navigated to, so nothing should move.
    setPhase(!enabled || direction === "replace" ? settled : open ? "entering" : "leaving")
  } else if (!enabled && phase !== settled) {
    // A resize mid-slide leaves an animation belonging to a layout that no
    // longer exists.
    setPhase(settled)
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "nav-layer",
          enabled && "nav-base",
          // Off a phone there is no parallax to keep it around for, so the
          // covered screen stops being painted at all.
          !enabled && open && "hidden",
        )}
        data-covered={enabled && open ? "" : undefined}
        inert={open}
      >
        {children}
      </div>

      {phase !== "idle" && (
        <div
          className={cn("nav-layer", enabled && "nav-overlay")}
          data-state={phase === "shown" ? undefined : phase}
          onAnimationEnd={(event) => {
            // Animations inside the screen bubble up here too.
            if (event.target !== event.currentTarget) return
            setPhase(settled)
          }}
        >
          {open ? overlay : last.current}
        </div>
      )}
    </div>
  )
}
