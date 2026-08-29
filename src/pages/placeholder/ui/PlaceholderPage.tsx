import type { ComponentType, SVGProps } from "react"
import { AppShell } from "@/widgets/app-shell"
import { Header } from "@/shared/ui/Header"
import { PRIMARY_NAV } from "@/shared/config/navigation"

export const PLACEHOLDER_KINDS = ["saved", "activity", "profile"] as const
export type PlaceholderKind = (typeof PLACEHOLDER_KINDS)[number]

export function isPlaceholderKind(value: string): value is PlaceholderKind {
  return PLACEHOLDER_KINDS.some((kind) => kind === value)
}

/**
 * Same layout as the search empty state: a faded section icon, a short title,
 * and a muted line underneath. Quiet on purpose — these screens have no
 * content yet, and a construction illustration would oversell that.
 */
function UnderDevelopment({
  icon: Icon,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Icon className="size-8 text-faint" />
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-semibold leading-[26px] text-foreground">
          Раздел в разработке
        </p>
        <p className="max-w-sm text-sm leading-6 text-muted">
          Этот раздел появится позже.
        </p>
      </div>
    </div>
  )
}

/**
 * Stand-in screen for a primary-nav section that has nowhere to go yet.
 * The nav item's label and icon come from {@link PRIMARY_NAV}, so the header
 * and the faded mark stay in lockstep with the rail and the tab bar.
 */
export function PlaceholderPage({ kind }: { kind: PlaceholderKind }) {
  const item = PRIMARY_NAV.find((entry) => entry.id === kind)
  if (!item) return null
  const Icon = item.icon

  return (
    <AppShell>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        <Header edge padTitle>
          <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.2px] text-foreground">
            {item.label}
          </h1>
        </Header>
        <div className="scroll-area flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col justify-center">
            <UnderDevelopment icon={Icon} />
          </div>
        </div>
      </main>
    </AppShell>
  )
}

export default PlaceholderPage

