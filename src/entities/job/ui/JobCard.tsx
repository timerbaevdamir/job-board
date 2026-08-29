import type { MouseEvent } from "react"
import type { Job } from "../model/types"
import { HeartIcon, VerifiedIcon } from "@/shared/ui/icons"
import { Button } from "@/shared/ui/Button"
import { AppliedBadge } from "@/shared/ui/AppliedBadge"
import { cn } from "@/shared/lib/cn"

function LogoTile({
  initial,
  bg,
  src,
  className,
}: {
  initial: string
  bg: string
  src?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 font-semibold text-foreground",
        "size-11 text-lg sm:size-[60px] sm:text-xl",
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </div>
  )
}

function NeutralTag({ children }: { children: string }) {
  return (
    <span className="rounded-lg bg-chip px-2 py-1 text-sm leading-5 text-chip-foreground">
      {children}
    </span>
  )
}

/**
 * Presentational vacancy card. It owns no state: `saved` / `applied` and their
 * handlers are supplied by the composing widget, which wires them to the
 * `save-job` and `apply` features. Keeping the entity free of feature/state
 * imports preserves the FSD dependency direction (entities never reach upward).
 */
export function JobCard({
  job,
  onSelect,
  saved,
  applied,
  onToggleSave,
  onApply,
}: {
  job: Job
  onSelect: (id: string) => void
  saved: boolean
  applied: boolean
  onToggleSave: (id: string) => void
  onApply: (id: string) => void
}) {
  const stop = (e: MouseEvent) => e.stopPropagation()
  const handleApply = (e: MouseEvent) => {
    e.stopPropagation()
    onApply(job.id)
  }
  const handleToggleSave = (e: MouseEvent) => {
    e.stopPropagation()
    onToggleSave(job.id)
  }

  return (
    <article
      className={cn(
        "relative flex cursor-pointer flex-col gap-6 rounded-3xl border bg-surface p-6 transition-colors",
        // Hover darkens by one step inside the existing scale (70% → full
        // border-strong) rather than jumping to a much darker outline: the
        // cursor is already the primary hover signal, the border only has to
        // confirm which card it is on.
        //
        // There is no "selected" state: that would mean "this is the one open
        // in the pane beside you", and opening a vacancy replaces this list
        // rather than standing next to it. The two-pane screen in this project
        // is Отклики, and it has a card of its own.
        "border-border-strong/70 hover:border-border-strong",
      )}
    >
      {/* One element for both placements rather than two hidden copies: on a
          phone the logo is the company's avatar and sits beside its name; from
          `sm` the same node lifts out of the flow into the card's corner, where
          the wider card has room for it. */}
      <div className="flex flex-col gap-5 sm:pr-[72px]">
        {/* Title + salary. The heart overlaps this row on a phone, so the text
            keeps clear of it. */}
        <div className="flex flex-col gap-2 pr-12 sm:pr-0">
          {/* The title carries the action, not the card.
              The whole card stays clickable as a convenience for the mouse, but
              a click handler on an <article> is unreachable by keyboard — the
              vacancy simply could not be opened without a pointer. A real
              button gets focus, Enter and Space for free, and its `::after`
              stretches the hit area back over the entire card, so nothing is
              lost for the mouse. The nested Откликнуться / Контакты buttons sit
              above it via their own stacking, so they still win their clicks. */}
          <h3 className="text-lg font-semibold leading-[26px] text-foreground">
            <button
              type="button"
              onClick={() => onSelect(job.id)}
              className="text-left after:absolute after:inset-0 after:rounded-3xl after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info"
            >
              {job.title}
            </button>
          </h3>
          {job.salary && (
            <p className="text-lg leading-[26px] tracking-[-0.09px] text-foreground">
              {job.salary}
            </p>
          )}
        </div>

        {/* Company + location */}
        <div className="flex items-center gap-3 sm:block">
          <LogoTile
            initial={job.companyInitial}
            bg={job.logoBg}
            src={job.logoUrl}
            className="sm:absolute sm:right-6 sm:top-6"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5">
              <span className="inline-flex items-center gap-1">
                <span className="text-foreground">{job.company}</span>
                {job.verified && (
                  <VerifiedIcon className="size-4 text-muted" strokeWidth={1.5} />
                )}
              </span>
              {job.online && <span className="text-success">онлайн</span>}
            </div>
            <span className="text-sm leading-5 text-foreground">
              {job.location}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {job.matchPercent !== undefined && (
            <span className="rounded-lg border border-border px-2.5 py-1 text-sm leading-5">
              <span className="font-medium text-foreground">
                {job.matchPercent}%
              </span>{" "}
              <span className="text-chip-foreground">совпадение</span>
            </span>
          )}
          {job.experience && <NeutralTag>{job.experience}</NeutralTag>}
          {job.remoteAllowed && (
            <span className="rounded-lg bg-accent-soft px-2 py-1 text-sm leading-5 text-accent">
              Можно из дома
            </span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          {job.description.map((paragraph, i) => (
            <p
              key={i}
              className={cn(
                "text-sm leading-6 text-foreground",
                i === 1 && "line-clamp-2",
              )}
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Actions. The row itself is *not* positioned: the heart escapes it on a
          phone and has to land in the card's corner, and a positioned row would
          become its containing block. `relative` moves to the pieces that need
          to paint above the title's stretched `::after` — the cost of the
          stretched-link pattern is that everything clickable must outrank it. */}
      <div className="flex items-center justify-between gap-3">
        {/* On a phone the pair spans the card — the heart has moved to the
            corner, so there is nothing else competing for the row. Applied
            stacks the informer above Контакты so the contact action can take
            the full width; from `sm` both sit in a row and hug their labels. */}
        <div
          className={cn(
            "relative flex gap-3",
            applied
              ? "flex-1 flex-col sm:flex-none sm:flex-row sm:items-center"
              : "flex-1 flex-row items-center sm:flex-none",
          )}
        >
          {applied ? (
            <AppliedBadge size="md" className="w-full sm:w-auto" />
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleApply}
              className="flex-1 sm:flex-none"
            >
              Откликнуться
            </Button>
          )}
          <Button
            variant="secondary"
            size="md"
            onClick={stop}
            className={applied ? "w-full sm:w-auto" : "flex-1 sm:flex-none"}
          >
            Контакты
          </Button>
        </div>
        <button
          type="button"
          onClick={handleToggleSave}
          aria-pressed={saved}
          aria-label={saved ? "Убрать из сохранённых" : "Сохранить"}
          // Phone: the corner the logo used to occupy. From `sm`: back in the
          // row, still positioned so it outranks the stretched `::after`.
          className="absolute right-4 top-4 flex size-12 items-center justify-center rounded-full transition-colors hover:bg-surface-muted active:scale-90 sm:relative sm:right-auto sm:top-auto"
        >
          <HeartIcon
            className={cn(
              "size-6 transition-colors",
              saved ? "text-danger" : "text-foreground",
            )}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </article>
  )
}
