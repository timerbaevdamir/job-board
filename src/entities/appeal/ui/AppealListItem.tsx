import type { Appeal } from "../model/types"
import { APPEAL_STATUS_LABEL } from "../model/types"
import { AppealLogo } from "./AppealLogo"
import { DoubleCheckIcon } from "@/shared/ui/icons"
import { Counter } from "@/shared/ui/Counter"
import { cn } from "@/shared/lib/cn"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

// Badge tint per status — fill matches the text color.
const STATUS_STYLE: Record<Appeal["status"], string> = {
  invitation: "bg-success-soft text-success",
  viewed: "bg-chip text-muted",
  rejected: "bg-danger/10 text-danger",
  sent: "bg-chip text-muted",
}

/** A conversation row in the appeals list column. */
export function AppealListItem({
  appeal,
  selected,
  onSelect,
}: {
  appeal: Appeal
  selected: boolean
  onSelect: (id: string) => void
}) {
  // Highlight only where the list stays beside the thread. On a phone the
  // row is under the overlay, and a selected fill would flash through the
  // slide — there is no persistent selection.
  const highlight = selected && useLayoutMode() !== "mobile"

  return (
    <button
      type="button"
      onClick={() => onSelect(appeal.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors",
        highlight
          ? "bg-chat-active text-chat-active-foreground"
          : "hover:bg-chip",
      )}
    >
      {/* Logo tile with online dot */}
      <span className="relative shrink-0">
        <AppealLogo appeal={appeal} highlight={highlight} />
        {appeal.online && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 z-10 size-3 rounded-full border-2 bg-success",
              highlight ? "border-chat-active" : "border-background",
            )}
          />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-base font-semibold leading-[22px]",
              highlight ? "text-chat-active-foreground" : "text-foreground",
            )}
          >
            {appeal.company}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium leading-4",
              highlight
                ? "bg-chat-active-foreground/20 text-chat-active-foreground"
                : STATUS_STYLE[appeal.status],
            )}
          >
            {APPEAL_STATUS_LABEL[appeal.status]}
          </span>
        </span>

        <span
          className={cn(
            "truncate text-sm leading-5",
            highlight ? "text-chat-active-foreground/85" : "text-foreground",
          )}
        >
          {appeal.position}
        </span>

        <span className="flex items-center gap-1.5">
          {appeal.lastRead && (
            <DoubleCheckIcon
              className={cn(
                "size-4 shrink-0",
                highlight ? "text-chat-active-foreground/70" : "text-info",
              )}
            />
          )}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm leading-5",
              highlight ? "text-chat-active-foreground/70" : "text-muted",
            )}
          >
            {appeal.lastMessage} · {appeal.lastTime}
          </span>
          {appeal.unread && !highlight && <Counter tone="info" />}
        </span>
      </span>
    </button>
  )
}
