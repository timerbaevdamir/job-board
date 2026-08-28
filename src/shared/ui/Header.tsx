import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react"
import { cn } from "@/shared/lib/cn"
import { HeaderFade } from "./HeaderFade"

/**
 * Page chrome: a 64px bar on a phone, 80px from `md` up. Same slot layout as
 * the bank Navbar — start, center, end — without expanded titles or colour
 * schemes. Those screens are not here; the slots are.
 *
 * Does not know about routing. A back control is just `start` with an
 * `onClick`. Extra rows (search, a résumé chip) go in {@link below} so they
 * sit under the bar and do not change its height.
 *
 * `hud` is a modifier, not a second header: the center stays in the bar and
 * only reveals once the page title has scrolled under it (`scrolled`, or
 * observed from {@link titleRef}).
 *
 * `edge` is the same hairline without the hidden title — a list whose chrome
 * sits above the scroller, not inside it. `hairline` is that rule always on.
 */
export function Header({
  start,
  end,
  below,
  fade,
  sticky = false,
  hud = false,
  edge = false,
  hairline = false,
  scrolled: scrolledProp,
  titleRef,
  align = "left",
  inset = "default",
  width = "full",
  padTitle = false,
  children,
  className,
  ref,
}: {
  start?: ReactNode
  end?: ReactNode
  /** Content under the bar — search, a résumé chip. Not part of the 64/80. */
  below?: ReactNode
  fade?: boolean
  /** Stick to the top of the scrollport with a solid fill. */
  sticky?: boolean
  /** Center is a compact title that stays hidden until scrolled. */
  hud?: boolean
  /** Hairline once the page has moved — no title hide. List chrome uses this. */
  edge?: boolean
  /** Always-on hairline. Chat chrome uses this — visible even at scrollTop 0. */
  hairline?: boolean
  /** Controlled HUD / edge reveal. When omitted, the scroller is observed. */
  scrolled?: boolean
  titleRef?: RefObject<HTMLElement | null>
  align?: "left" | "center"
  /** `tight` is 8px; `flush` is 8 / 16 from md / 24 from xl (board vacancy); `column` is 16 — chat third column. */
  inset?: "default" | "flush" | "tight" | "column"
  width?: "full" | "column"
  /** Title slot carries its own 16px sides; desktop adds extra left air. */
  padTitle?: boolean
  children?: ReactNode
  className?: string
  ref?: Ref<HTMLElement>
}) {
  const nodeRef = useRef<HTMLElement>(null)
  const [observed, setObserved] = useState(false)
  const controlled = scrolledProp !== undefined
  const watching = hud || edge
  const scrolled = watching && (controlled ? scrolledProp : observed)
  const showFade = fade ?? !sticky
  const insetClass =
    inset === "column"
      ? "px-4"
      : inset === "tight"
        ? "px-2"
        : inset === "flush"
          ? "px-2 md:px-4 xl:px-6"
          : "px-2 md:px-4"
  const belowInset =
    inset === "column"
      ? "px-4"
      : inset === "tight"
        ? "px-2"
        : inset === "flush"
          ? "px-2 md:px-4 xl:px-6"
          : "px-4"
  const barInset = padTitle
    ? inset === "column"
      ? "pr-4"
      : inset === "tight"
        ? "pr-2"
        : inset === "flush"
          ? "pr-2 md:pr-4 xl:pr-6"
          : "pr-2 md:pr-4"
    : insetClass

  useEffect(() => {
    if (!watching || controlled) return

    let scroller: HTMLElement | null = null
    let raf = 0
    let cancelled = false

    const update = () => {
      const title = titleRef?.current
      const header = nodeRef.current
      if (title && header) {
        setObserved(
          title.getBoundingClientRect().top <=
            header.getBoundingClientRect().bottom,
        )
        return
      }
      if (scroller) setObserved(scroller.scrollTop > 0)
    }

    const attach = () => {
      if (cancelled) return
      const header = nodeRef.current
      const next = header?.nextElementSibling
      scroller =
        titleRef?.current?.closest<HTMLElement>(".scroll-area") ??
        (next instanceof HTMLElement && next.classList.contains("scroll-area")
          ? next
          : null) ??
        header?.closest<HTMLElement>(".scroll-area") ??
        null
      if (!header || !scroller) {
        raf = requestAnimationFrame(attach)
        return
      }
      update()
      scroller.addEventListener("scroll", update, { passive: true })
    }

    attach()
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      scroller?.removeEventListener("scroll", update)
    }
  }, [watching, controlled, titleRef])

  return (
    <header
      ref={(node) => {
        nodeRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      className={cn(
        sticky ? "sticky top-0 z-20 bg-background" : "relative z-20",
        "flex flex-col",
        hairline || scrolled ? "border-b border-border/70" : null,
        className,
      )}
    >
      {showFade ? <HeaderFade /> : null}
      <div
        className={cn(
          "relative z-10 flex min-h-16 items-center gap-3 md:min-h-20",
          barInset,
          width === "column" ? "mx-auto w-full max-w-3xl" : null,
        )}
      >
        {start}
        <div
          className={
            hud
              ? cn(
                  "flex min-w-0 flex-1 items-center gap-3 transition-[opacity,transform] duration-200",
                  align === "center" ? "justify-center" : null,
                  scrolled
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-1 opacity-0",
                )
              : cn(
                  "flex min-w-0 flex-1 items-center gap-3",
                  padTitle
                    ? "px-4 md:pl-6"
                    : inset === "tight" || inset === "column"
                      ? null
                      : "md:pl-2",
                  align === "center" ? "justify-center" : null,
                )
          }
          aria-hidden={hud && !scrolled ? true : undefined}
        >
          {children}
        </div>
        {end}
      </div>
      {below ? (
        <div className={cn("relative z-10 pb-4", belowInset)}>{below}</div>
      ) : null}
    </header>
  )
}

const ACTION_TONE = {
  /** No fill at rest — a back arrow sitting in the start slot. */
  plain: "text-foreground transition-colors hover:bg-chip",
  /** Vacancy cluster: the same 48px hit, a quieter hover. */
  ghost: "text-foreground transition-colors hover:bg-surface-muted",
  /** Frosted disc — the trailing actions on a fading header. */
  glass:
    "bg-background/60 text-foreground backdrop-blur-md transition-colors hover:bg-chip/70",
} as const

/**
 * 48px round control for a header slot. Same size on phone and desktop; the
 * bar around it is what grows from 64 to 80.
 */
export function HeaderAction({
  tone = "glass",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof ACTION_TONE
}) {
  return (
    <button
      type={type}
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full",
        ACTION_TONE[tone],
        className,
      )}
      {...props}
    />
  )
}

/** Packed end-slot: several {@link HeaderAction}s in one pill. */
export function HeaderActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center overflow-hidden rounded-full">
      {children}
    </div>
  )
}
