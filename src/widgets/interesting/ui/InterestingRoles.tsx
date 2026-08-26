import { Fragment } from "react"
import { SKILL_MATCHES } from "@/shared/config/discovery"
import { Cell } from "@/shared/ui/Cell"
import { SearchIcon } from "@/shared/ui/icons"

/**
 * Native "you might like" block for the feed — full-width, sits between job
 * cards like a promoted recommendation rather than a sidebar carousel.
 * Rows are inset cells (8px from the edges) that highlight on hover.
 */
export function InterestingRoles() {
  return (
    <section className="rounded-3xl bg-surface-muted p-2">
      <p className="px-3 pb-1 pt-2 text-base leading-[22px] text-muted">
        Может быть интересно
      </p>
      <div className="flex flex-col">
        {SKILL_MATCHES.map((s, i) => (
          <Fragment key={s.id}>
            {/* Divider inset to align with the cell text and icon (matches p-3). */}
            {i > 0 && <span className="mx-3 h-px bg-border" />}
            <Cell
              size="lg"
              label={s.title}
              sublabel={
                <>
                  <span className="text-foreground">{s.match}%</span>{" "}
                  совпадает с вашими навыками
                </>
              }
              end={
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface">
                  <SearchIcon className="size-6 text-foreground" />
                </span>
              }
            />
          </Fragment>
        ))}
      </div>
    </section>
  )
}
