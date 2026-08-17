import type { ButtonHTMLAttributes, ReactNode } from "react"
import { cn } from "@/shared/lib/cn"

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link"
export type ButtonSize = "sm" | "md" | "lg"

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  /** primary — основное, secondary — второстепенное, tertiary — третьестепенное. */
  variant?: ButtonVariant
  size?: ButtonSize
  /** Leading icon; when there is no text, the button becomes a square icon button. */
  icon?: ReactNode
  /** Stretch to fill the available width. */
  fullWidth?: boolean
  type?: "button" | "submit" | "reset"
}

// Colour + border per variant. Disabled state is shared (dim + no pointer).
// tertiary — чёрная «призрачная» (без фона); link — синяя, как ссылка.
const VARIANTS: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-black text-white hover:opacity-90",
  secondary: "border-black text-foreground hover:bg-surface-muted",
  tertiary: "border-transparent text-foreground hover:bg-surface-muted",
  link: "border-transparent text-info hover:bg-surface-muted",
}

// Единая шкала: фиксированные высоты 36 / 44 / 52; текст, паддинги, скругление
// и иконка растут вместе с размером.
// [height, text, horizontal padding, gap, rounding, icon size, square for icon-only].
const SIZES: Record<ButtonSize, {
  h: string
  text: string
  pad: string
  gap: string
  radius: string
  icon: string
  square: string
}> = {
  sm: {
    h: "h-9",
    text: "text-sm leading-5",
    pad: "px-4",
    gap: "gap-1.5",
    radius: "rounded-[10px]",
    icon: "[&_svg]:size-4",
    square: "size-9",
  },
  md: {
    h: "h-11",
    text: "text-base leading-[22px]",
    pad: "px-5",
    gap: "gap-2",
    radius: "rounded-xl",
    icon: "[&_svg]:size-5",
    square: "size-11",
  },
  lg: {
    h: "h-13",
    text: "text-lg leading-[26px]",
    pad: "px-6",
    gap: "gap-2.5",
    radius: "rounded-2xl",
    icon: "[&_svg]:size-6",
    square: "size-13",
  },
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  fullWidth,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const s = SIZES[size]
  const iconOnly = icon != null && (children == null || children === false)

  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border font-semibold transition-[opacity,background-color,color] disabled:pointer-events-none disabled:opacity-50",
        s.text,
        s.radius,
        s.icon,
        iconOnly ? s.square : cn(s.h, s.pad, s.gap),
        fullWidth && "w-full",
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {!iconOnly && children}
    </button>
  )
}
