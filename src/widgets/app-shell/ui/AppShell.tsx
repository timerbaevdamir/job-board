import { useEffect, useState, type ReactNode } from "react"
import { Sidebar, TabBar } from "@/widgets/navigation"
import { Drawer, DrawerContent } from "@/shared/ui/Drawer"
import {
  activeSection,
  useNavigate,
  useNavVia,
  useRoute,
  type Route,
} from "@/shared/lib/router"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

/** Nav ids that have a screen of their own; everything else lands on the board. */
const ROUTE_BY_NAV: Record<string, Route> = {
  search: { name: "search" },
  appeals: { name: "appeals" },
}

/**
 * Application frame shared by every screen: the primary navigation plus the
 * full-height, non-scrolling page ground. Each screen lays out its own columns
 * inside `children`.
 *
 * Navigation takes three shapes, and they differ in behaviour rather than only
 * in width — which is why the mode is decided in JS instead of by `md:` / `lg:`
 * classes:
 *
 * - **desktop** — the full sidebar, labels inline.
 * - **tablet** — an icon rail; "Показать меню" opens those same labels as a
 *   panel over the page. The panel is the desktop sidebar, floated: one
 *   component, so the two can't drift apart.
 * - **mobile** — no rail at all; a bottom bar in the shell's flex column.
 *
 * `collapsed` still forces the rail regardless of viewport, for the appeals
 * screen, which is designed around it.
 */
export function AppShell({
  collapsed = false,
  bottomBar = false,
  children,
}: {
  /** Force the icon-only rail — the appeals screen's own design. */
  collapsed?: boolean
  /**
   * Whether the screen is showing a sticky action bar of its own along the
   * bottom edge. Only the screen knows — its bar lives inside its scroll area,
   * out of the shell's sight — and the tab bar needs to be told so the two
   * don't draw a seam between them. See `TabBar`'s `attached`.
   */
  bottomBar?: boolean
  children: ReactNode
}) {
  const route = useRoute()
  const navigate = useNavigate()
  const via = useNavVia()
  const mode = useLayoutMode()
  const [panelOpen, setPanelOpen] = useState(false)

  const active = activeSection(route)
  const go = (id: string) =>
    navigate(ROUTE_BY_NAV[id] ?? { name: "section", section: id })

  // A resize that changes the layout leaves the panel belonging to a mode that
  // no longer exists — close it rather than let it hang over the new one.
  useEffect(() => {
    if (mode !== "tablet") setPanelOpen(false)
  }, [mode])

  const rail = collapsed || mode === "tablet"
  // A thread on a phone is its own screen: back lives in the header, and the
  // bar would sit under the composer. The list still needs it. A vacancy
  // opened from a thread is the next overlay on that stack, so the bar stays
  // off — search vacancies keep it (they attach their apply bar).
  const hideTabBar =
    mode === "mobile" &&
    ((route.name === "appeals" && Boolean(route.appealId)) ||
      (route.name === "job" && via === "appeal"))

  return (
    // A column on mobile so the bar can be a sibling of the content: the scroll
    // area above is then already sized to exclude it, and nothing has to
    // reserve padding or measure the bar's height.
    //
    // `h-dvh`, not `h-screen`: 100vh is the large viewport, so on iOS Safari
    // the tab bar paints behind the address bar. dvh tracks the visible
    // height as that chrome shows and hides; the home-indicator inset on
    // the bar itself is separate.
    <div
      className={
        mode === "mobile"
          ? "flex h-dvh flex-col overflow-hidden bg-background"
          : "flex h-dvh overflow-hidden bg-background"
      }
    >
      {mode !== "mobile" && (
        <Sidebar
          collapsed={rail}
          active={active}
          onNavigate={go}
          onExpand={rail ? () => setPanelOpen(true) : undefined}
        />
      )}

      {mode === "mobile" ? (
        <div className="flex min-h-0 flex-1 overflow-hidden">{children}</div>
      ) : (
        children
      )}

      {mode === "mobile" && !hideTabBar && (
        <TabBar active={active} onNavigate={go} attached={bottomBar} />
      )}

      {/* Tablet panel: the rail itself, widened. It shares the rail's edge and
          icon positions, so opening it reads as the menu unfolding rather than
          a second one appearing — see the `rail` variant. `modal={false}` keeps
          the page live behind it; an outside press dismisses. */}
      <Drawer
        open={panelOpen}
        onOpenChange={setPanelOpen}
        modal={false}
        swipeDirection="left"
      >
        <DrawerContent variant="rail" scrim={false}>
          <Sidebar
            floating
            active={active}
            onNavigate={(id) => {
              go(id)
              setPanelOpen(false)
            }}
            onCollapse={() => setPanelOpen(false)}
          />
        </DrawerContent>
      </Drawer>
    </div>
  )
}
