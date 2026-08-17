import { PRIMARY_NAV } from "@/shared/config/navigation"
import { cn } from "@/shared/lib/cn"
import { NavRow } from "./NavRow"

/**
 * Bottom navigation for the mobile layout.
 *
 * Marked up as navigation, not as ARIA tabs. The `tablist` / `tab` roles
 * describe switching panels *within* one view, with `aria-controls` tying a tab
 * to its panel; these move between sections instead. Announcing "tab 2 of 5,
 * selected" would promise content that changes in place — and the roles bring a
 * keyboard model (arrow keys move between tabs) that a bar of links doesn't
 * implement. `aria-current="page"` says the same thing truthfully, and it is
 * what the sidebar already uses.
 *
 * Tapping the section you are already in navigates to its root — so from an
 * open vacancy, "Поиск" returns to the feed. That falls out of routing to the
 * section root on every tap; no separate re-select handler needed.
 *
 * It sits in the shell's flex column rather than `position: fixed`, so the
 * scroll area above it is already sized to exclude it. Nothing needs to
 * reserve padding for the bar, and a sticky footer inside the feed (the
 * vacancy's apply buttons) lands above it rather than underneath.
 */
export function TabBar({
  active,
  onNavigate,
  attached = false,
}: {
  active: string
  onNavigate: (id: string) => void
  /**
   * Whether the screen has put its own action bar directly above this one.
   *
   * The bar can't see what sits over it — it is a sibling of the scroll area,
   * not of the footer inside it — so the screen that owns the footer has to
   * say. When one is there the two are a single raised panel and only the top
   * of that panel is separated from the content; a line here would draw the
   * seam back in, right through the middle of it.
   */
  attached?: boolean
}) {
  return (
    <nav
      aria-label="Основная навигация"
      className={cn(
        "flex shrink-0 items-stretch gap-1 bg-surface px-2 pb-[env(safe-area-inset-bottom,0px)]",
        !attached && "border-t border-border",
      )}
    >
      {PRIMARY_NAV.map((item) => (
        <NavRow
          key={item.id}
          item={item}
          active={active === item.id}
          variant="tab"
          onSelect={onNavigate}
        />
      ))}
    </nav>
  )
}
