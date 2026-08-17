import type { Job } from "@/entities/job"
import { VerifiedIcon } from "@/shared/ui/icons"
import { Stars } from "./primitives"

/** Company summary card: identity + rating on the left, logo tile on the right. */
export function CompanyCard({ job }: { job: Job }) {
  const d = job.detail

  return (
    <div className="flex gap-6 rounded-3xl border border-border-strong/70 bg-surface p-6">
      <div className="flex min-w-0 flex-1 flex-col justify-end gap-4">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 leading-[22px]">
            <span className="truncate text-base font-semibold text-foreground">
              {job.company}
            </span>
            {job.online && (
              <span className="shrink-0 text-sm text-success">Онлайн</span>
            )}
          </span>
          {d?.rating !== undefined && (
            <span className="flex items-center gap-2 text-sm leading-5">
              <span className="flex items-center gap-1">
                <span className="text-base font-semibold leading-[22px] text-foreground">
                  {d.rating.toFixed(1).replace(".", ",")}
                </span>
                <Stars value={d.rating} />
              </span>
              {d.reviewsCount !== undefined && (
                <span className="text-muted">{d.reviewsCount} отзыва</span>
              )}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {job.verified && (
            <span className="flex items-center gap-1 rounded-lg bg-success-soft px-2 py-1 text-sm leading-5 text-success">
              <VerifiedIcon className="size-4" strokeWidth={1.75} />
              Компания проверена
            </span>
          )}
          {job.itAccredited && (
            <span className="flex items-center gap-1 rounded-lg bg-brand-soft px-2 py-1 text-sm leading-5 text-brand">
              <span className="flex size-4 items-center justify-center rounded bg-brand text-[10px] font-bold leading-none text-white">
                IT
              </span>
              ИТ-команда
            </span>
          )}
        </div>
      </div>
      <span
        className="flex size-24 shrink-0 items-center justify-center rounded-2xl border border-black/10 text-3xl font-semibold text-foreground"
        style={{ backgroundColor: job.logoBg }}
      >
        {job.companyInitial}
      </span>
    </div>
  )
}
