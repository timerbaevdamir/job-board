import type { ComponentProps, ElementType, ReactNode } from "react"
import { Drawer as Base } from "@base-ui/react/drawer"
import { cn } from "@/shared/lib/cn"

/**
 * Base UI lets `className` be a function of the part's state. These wrappers
 * merge it with their own classes instead, so they narrow it back to a string.
 */
type StyledProps<T extends ElementType,> = Omit<ComponentProps<T>, "className"> & {
  className?: string
}

/**
 * Drawer built on Base UI, dressed in this project's tokens.
 *
 * Base UI owns the parts that are genuinely hard to get right — the swipe
 * gesture and its velocity, focus trapping, scroll locking, nesting, the
 * software keyboard, the enter/exit transition states — and this module owns
 * how it looks and how it moves: our surface and border tokens, the 28px radius
 * the search field uses, and the shared `--ease-soft` curve so a drawer opens
 * with the same motion as the rest of the interface.
 *
 * The gesture is worth spelling out, because it is the part a bottom sheet
 * lives or dies by. Base UI publishes the drag as CSS custom properties rather
 * than moving the panel itself — `--drawer-swipe-movement-y` is the live
 * offset, `--drawer-swipe-progress` how far along the dismissal is, and
 * `--drawer-swipe-strength` how hard the panel was thrown. Reading them (see
 * `.drawer-sheet` in `index.css`) is what makes the panel follow the finger and
 * the backdrop lighten with it; a drawer that ignores them still *dismisses* on
 * a swipe, but does nothing at all until the finger lifts.
 *
 * Composition mirrors the Base UI docs, so their reference applies here:
 *
 *   Drawer
 *   ├── DrawerTrigger
 *   └── DrawerContent
 *       ├── DrawerHeader → DrawerTitle, DrawerDescription
 *       ├── (body)
 *       └── DrawerFooter
 */
export const Drawer = Base.Root
export const DrawerTrigger = Base.Trigger
export const DrawerClose = Base.Close

/**
 * Opt a drawer into software-keyboard handling: while a field inside it is
 * focused, the popup is kept clear of the keyboard and the focused field is
 * scrolled into view. Wrap the drawer's contents in it when — and only when —
 * the drawer contains a text field.
 *
 * This is the one thing a phone gets wrong by default and a desktop browser
 * never shows you. iOS does not resize the layout viewport when the keyboard
 * appears; it slides the whole page up under it. A sheet pinned to the bottom
 * of the *layout* viewport therefore ends up behind the keyboard, taking its
 * input field with it — `100dvh` does not help, because the layout viewport
 * genuinely hasn't changed.
 */
export const DrawerVirtualKeyboardProvider = Base.VirtualKeyboardProvider

/**
 * Portal + backdrop + viewport + popup in one.
 *
 * `variant` picks how the panel arrives, `size` how tall it stands. Both resolve
 * to a single class apiece: `cn` joins strings without merging them, so two
 * competing utilities on one element would be settled by stylesheet order
 * rather than by choice. The geometry and motion behind those classes live in
 * `index.css`, keyed on Base UI's own state attributes.
 */
export function DrawerContent({
  className,
  children,
  scrim = true,
  variant = "sheet",
  size = "content",
  ...props
}: StyledProps<typeof Base.Popup> & {
  /**
   * `sheet` — a panel that slides in from an edge and can be thrown back out.
   *
   * `rail` — a panel that *widens in place* over a collapsed navigation rail,
   * sharing its left edge and inner geometry so the icons never move.
   */
  variant?: "sheet" | "rail"
  /**
   * Bottom sheets only; side drawers are always full height.
   *
   * `content` — the sheet is as tall as what is in it, capped short of the top.
   *
   * `full` — the sheet is pinned under a fixed top inset. Use it for content
   * that is long or that changes height: a content-sized sheet regrows as
   * sections open, which shifts everything the reader is already looking at.
   */
  size?: "content" | "full"
  /**
   * The dimmed layer behind the panel. Turn it off for a drawer that sits over
   * the page without shutting it out — the page stays readable and an outside
   * press still dismisses, so the panel reads as revealed rather than modal.
   * Pair it with `modal={false}` on the root, or focus and scrolling will still
   * be trapped behind an invisible wall.
   */
  scrim?: boolean
}) {
  return (
    <Base.Portal>
      {scrim && <Base.Backdrop className="drawer-backdrop" />}
      <Base.Viewport
        className={cn(
          "drawer-viewport fixed inset-0 z-50",
          // Without a scrim the viewport must not intercept pointer events, or
          // an invisible sheet would cover the page it is supposed to leave
          // usable. The panel itself opts back in.
          !scrim && "pointer-events-none",
        )}
      >
        <Base.Popup
          className={cn(
            "drawer-popup",
            variant === "sheet" && "drawer-sheet",
            variant === "sheet" && size === "full" && "drawer-sheet-full",
            variant === "rail" && "drawer-rail",
            className,
          )}
          {...props}
        >
          {/* The grab affordance. Rendered unconditionally and hidden by CSS
              for every direction but `down`, because the direction is already
              on the popup as a data attribute — so the handle is one element
              with no prop to keep in step with the drawer it sits in. */}
          <div
            aria-hidden
            className="drawer-grab shrink-0 justify-center pb-1 pt-2.5"
          >
            <span className="h-1 w-9 rounded-full bg-border-strong" />
          </div>
          {children}
        </Base.Popup>
      </Base.Viewport>
    </Base.Portal>
  )
}

/**
 * Title block, with an optional trailing control (a close button, usually).
 * The action is a slot rather than just another child so the header's own
 * layout stays fixed — `cn` only joins strings, so letting callers flip the
 * direction with a class would leave the winner to stylesheet order.
 */
export function DrawerHeader({
  className,
  action,
  children,
}: {
  className?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-6 pb-4 pt-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
      {action}
    </div>
  )
}

export function DrawerTitle({
  className,
  ...props
}: StyledProps<typeof Base.Title>) {
  return (
    <Base.Title
      className={cn(
        "text-xl font-semibold leading-7 tracking-[-0.2px] text-foreground",
        className,
      )}
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: StyledProps<typeof Base.Description>) {
  return (
    <Base.Description
      className={cn("text-sm leading-5 text-muted", className)}
      {...props}
    />
  )
}

export function DrawerFooter({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    // A row by default: footer actions sit side by side. Direction is not set
    // twice on purpose — `cn` only joins strings, so a base `flex-col` plus a
    // caller's `flex-row` would leave the winner to stylesheet order.
    <div
      className={cn(
        "mt-auto flex items-center gap-3 border-t border-border p-4",
        className,
      )}
    >
      {children}
    </div>
  )
}
