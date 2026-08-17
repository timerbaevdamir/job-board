import { Fragment } from "react"
import { SKILL_MATCHES } from "@/shared/config/discovery"
import { SearchIcon } from "@/shared/ui/icons"

/**
 * Native "you might like" block for the feed — full-width, sits between job
 * cards like a promoted recommendation rather than a sidebar carousel.
 * Rows are inset cells (8px from the edges) that highlight on hover.
 */
export function InterestingRoles() {
  return (
    <section className="rounded-2xl border border-border-strong/70 bg-surface-muted p-2">
      <p className="px-2 pb-1 pt-2 text-base leading-[22px] text-muted">
        Может быть интересно
      </p>
      <div className="flex flex-col">
        {SKILL_MATCHES.map((s, i) => (
          <Fragment key={s.id}>
            {/* Divider inset to align with the cell text and icon (matches p-3). */}
            {i > 0 && <span className="mx-3 h-px bg-border" />}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-black/[0.04]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base leading-[22px] text-foreground">
                  {s.title}
                </span>
                <span className="block text-sm leading-5 tracking-[0.07px]">
                  <span className="text-foreground">{s.match}%</span>{" "}
                  <span className="text-muted">
                    совпадает с вашими навыками
                  </span>
                </span>
              </span>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-chip">
                <SearchIcon className="size-6 text-foreground" />
              </span>
            </button>
          </Fragment>
        ))}
      </div>
    </section>
  )
}
