import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react"
import { ChevronRightIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"

type CellShared = {
  /** Leading slot: icon, avatar, radio, checkbox. */
  start?: ReactNode
  /** Trailing slot: count, switch, extra action. Drawn before {@link chevron}. */
  end?: ReactNode
  label?: ReactNode
  sublabel?: ReactNode
  /** Sublabel above the label — a caption, then the title. */
  reverse?: boolean
  chevron?: boolean
  selected?: boolean
  disabled?: boolean
  /** `md` is the option-list row; `lg` is a feed cell with a larger hit area. */
  size?: "md" | "lg"
  className?: string
  children?: ReactNode
}

type ButtonCell = CellShared & {
  as?: "button"
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">

type DivCell = CellShared & {
  as: "div"
} & Omit<HTMLAttributes<HTMLDivElement>, "children">

export type CellProps = ButtonCell | DivCell

function CellBody({
  label,
  sublabel,
  reverse,
  children,
}: {
  label?: ReactNode
  sublabel?: ReactNode
  reverse?: boolean
  children?: ReactNode
}) {
  if (children != null) {
    return (
      <span className="min-w-0 flex-1 text-foreground">{children}</span>
    )
  }

  const title =
    label != null && label !== "" ? (
      <span className="truncate text-base leading-[22px] text-foreground">
        {label}
      </span>
    ) : null
  const caption =
    sublabel != null && sublabel !== "" ? (
      <span className="text-sm leading-5 text-muted">{sublabel}</span>
    ) : null

  if (!title && !caption) return null

  return (
    <span className="flex min-w-0 flex-1 flex-col">
      {reverse ? (
        <>
          {caption}
          {title}
        </>
      ) : (
        <>
          {title}
          {caption}
        </>
      )}
    </span>
  )
}

/**
 * A list row: icon, title, caption, trailing control. Padding and hover live
 * here so every list — options, city, "you might like", settings — is one
 * object. The selected glyph is a slot (`start` / `end`); label and sublabel
 * can swap with {@link CellProps.reverse}.
 */
export function Cell({
  as = "button",
  start,
  end,
  label,
  sublabel,
  reverse,
  chevron,
  selected,
  disabled,
  size = "md",
  className,
  children,
  ...rest
}: CellProps) {
  const interactive = as === "button"
  const frame = cn(
    "flex w-full items-center gap-3 rounded-xl text-left",
    size === "lg" ? "p-3" : "px-3 py-2.5",
    interactive && "transition-colors hover:bg-chip",
    selected && "bg-chip",
    disabled && "pointer-events-none opacity-45",
    className,
  )

  const inner = (
    <>
      {start}
      <CellBody label={label} sublabel={sublabel} reverse={reverse}>
        {children}
      </CellBody>
      {end}
      {chevron && (
        <ChevronRightIcon className="size-5 shrink-0 text-faint" />
      )}
    </>
  )

  if (as === "div") {
    const divRest = rest as Omit<HTMLAttributes<HTMLDivElement>, "children">
    return (
      <div className={frame} {...divRest}>
        {inner}
      </div>
    )
  }

  const buttonRest = rest as Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children"
  >
  return (
    <button
      {...buttonRest}
      type="button"
      disabled={Boolean(disabled || buttonRest.disabled)}
      className={frame}
    >
      {inner}
    </button>
  )
}
