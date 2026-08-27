import type { Appeal } from "../model/types"
import { APPEAL_STATUS_LABEL } from "../model/types"
import { DoubleCheckIcon } from "@/shared/ui/icons"
import { Counter } from "@/shared/ui/Counter"
import { cn } from "@/shared/lib/cn"

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
  return (
    <button
      type="button"
      onClick={() => onSelect(appeal.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl p-3 text-left transition-colors",
        selected ? "bg-info text-white" : "hover:bg-chip",
      )}
    >
      {/* Logo tile with online dot */}
      <span className="relative shrink-0">
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-xl text-base font-semibold",
            selected && "bg-white/20 text-white",
          )}
          style={
            selected
              ? undefined
              : {
                  backgroundColor: appeal.logoBg,
                  color: appeal.logoColor ?? "#ffffff",
                }
          }
        >
          {appeal.companyInitial}
        </span>
        {appeal.online && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 z-10 size-3 rounded-full border-2 bg-success",
              selected ? "border-info" : "border-background",
            )}
          />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-base font-semibold leading-[22px]",
              selected ? "text-white" : "text-foreground",
            )}
          >
            {appeal.company}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium leading-4",
              selected
                ? "bg-white/20 text-white"
                : STATUS_STYLE[appeal.status],
            )}
          >
            {APPEAL_STATUS_LABEL[appeal.status]}
          </span>
        </span>

        <span
          className={cn(
            "truncate text-sm leading-5",
            selected ? "text-white/85" : "text-foreground",
          )}
        >
          {appeal.position}
        </span>

        <span className="flex items-center gap-1.5">
          {appeal.lastRead && (
            <DoubleCheckIcon
              className={cn(
                "size-4 shrink-0",
                selected ? "text-white/70" : "text-info",
              )}
            />
          )}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-sm leading-5",
              selected ? "text-white/70" : "text-muted",
            )}
          >
            {appeal.lastMessage} · {appeal.lastTime}
          </span>
          {appeal.unread && !selected && <Counter tone="info" />}
        </span>
      </span>
    </button>
  )
}
