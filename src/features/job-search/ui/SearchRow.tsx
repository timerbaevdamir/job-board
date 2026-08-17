import type { ComponentType } from "react"
import { XIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"

/**
 * One overlay row (suggestion / recent / recommendation). A single hover "cell"
 * holds the label and, when removable, a trailing clear control inside it.
 * mousedown (not click) so the action lands before the input's blur tears the
 * overlay down. `active` reflects keyboard focus for the combobox.
 */
export function SearchRow({
  id,
  icon: Icon,
  label,
  active = false,
  onSelect,
  onRemove,
}: {
  id?: string
  icon: ComponentType<{ className?: string }>
  label: string
  active?: boolean
  onSelect: () => void
  onRemove?: () => void
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      className={cn(
        "group flex items-center rounded-xl pr-1.5 transition-colors hover:bg-chip",
        active && "bg-chip",
      )}
    >
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={(e) => {
          e.preventDefault()
          onSelect()
        }}
        className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-2 pr-1 text-left"
      >
        <Icon className="size-5 shrink-0 text-subtle" />
        {/* Full-strength text: these rows are the primary thing to read and act
            on while the panel is open. The leading icon stays muted, and the
            row's hover fill already marks the pointer — the label doesn't need
            to change colour to do it. */}
        <span className="truncate text-base leading-6 text-foreground">
          {label}
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Удалить «${label}» из истории`}
          onMouseDown={(e) => {
            e.preventDefault()
            onRemove()
          }}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-subtle transition-opacity hover:text-foreground",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <XIcon className="size-[18px]" />
        </button>
      )}
    </li>
  )
}
