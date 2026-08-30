import type { ComponentType, SVGProps } from "react"
import { PRIMARY_NAV } from "@/shared/config/navigation"
import {
  BarsIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { NavRow } from "./NavRow"

function BrandMark() {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2c4 3 7 6 7 10a7 7 0 1 1-14 0c0-1.5.6-2.9 1.5-4C6 11 8 13 10 13c-1-2-1-5 2-11Z"
          fill="currentColor"
        />
      </svg>
      <span className="sr-only">Работа</span>
    </div>
  )
}

/** The bottom "Ещё" cell — same shape as a nav row, without active/selection. */
function MoreRow({
  collapsed = false,
  onClick,
  label = "Ещё",
  icon: Icon = BarsIcon,
}: {
  collapsed?: boolean
  onClick?: () => void
  label?: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-foreground transition-colors hover:bg-chip/60",
        collapsed ? "justify-center" : "w-full",
      )}
    >
      <Icon className="size-6 shrink-0 text-foreground" />
      {!collapsed && (
        <span className="flex-1 text-base leading-[22px]">{label}</span>
      )}
    </button>
  )
}

/**
 * Primary navigation rail. `collapsed` renders the icon-only variant; the
 * expanded one is the default. Both share one structure — same nesting, padding
 * (`p-4`) and gaps — so they stay in lockstep.
 *
 * `floating` drops the full-height chrome (screen height, the separator border)
 * for when the sidebar is shown as a panel over the page rather than as a column
 * beside it.
 */
export function Sidebar({
  active,
  onNavigate,
  collapsed = false,
  floating = false,
  onExpand,
  onCollapse,
  onMore,
}: {
  active: string
  onNavigate: (id: string) => void
  collapsed?: boolean
  floating?: boolean
  /** Given to the collapsed rail, turns "Ещё" into the panel's opener. */
  onExpand?: () => void
  /** Given to the floating panel, turns the same row into its closer. */
  onCollapse?: () => void
  /** Opens the "Ещё" menu; given to every expanded form of the rail. */
  onMore?: () => void
}) {
  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        "flex shrink-0 flex-col justify-between bg-surface p-4",
        floating ? "h-full w-[260px]" : "h-screen border-r border-border",
        // The widths include the 1px hairline (border-box), so the collapsed
        // rail is 80px of surface + the separator. Without that extra pixel its
        // content box is 47px while a centered row needs 48 — the overflow
        // splits in half and drags every icon 0.5px left of where the expanded
        // rail puts it. The expanded rail has no such problem: its rows are
        // `w-full` and left-aligned, so nothing is centered against an odd box.
        !floating && (collapsed ? "w-[81px] items-center" : "w-[260px]"),
      )}
    >
      <div className={cn("flex flex-col gap-4", collapsed && "items-center")}>
        <BrandMark />
        <div className={cn("flex flex-col gap-1", collapsed && "items-center")}>
          {PRIMARY_NAV.map((item) => (
            <NavRow
              key={item.id}
              item={item}
              active={active === item.id}
              variant={collapsed ? "rail" : "full"}
              onSelect={onNavigate}
            />
          ))}
        </div>
      </div>

      {collapsed ? (
        // The expander sits directly above "Ещё", one frame, a 4px gap: both
        // are rail-level actions rather than destinations, and the hamburger
        // keeps its "Ещё" meaning everywhere in the app while the double
        // chevron says "widen".
        <div className="flex flex-col items-center gap-1">
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              title="Показать меню"
              aria-label="Показать меню"
              className="flex items-center justify-center rounded-xl px-3 py-2.5 text-muted transition-colors hover:bg-chip/60 hover:text-foreground"
            >
              <ChevronsRightIcon className="size-6 shrink-0" />
            </button>
          )}
          {onMore && <MoreRow collapsed onClick={onMore} label="Ещё" />}
        </div>
      ) : (
        // The collapse control sits above "Ещё", mirroring the collapsed
        // rail where the expander is above it — the control keeps its place
        // between the two states.
        <div className="flex flex-col gap-1">
          {onCollapse && (
            <MoreRow
              onClick={onCollapse}
              label="Скрыть меню"
              icon={ChevronsLeftIcon}
            />
          )}
          {onMore && <MoreRow onClick={onMore} label="Ещё" />}
        </div>
      )}
    </nav>
  )
}
