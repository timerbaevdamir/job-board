import type { Job, JobProperty, JobPropertyKind } from "@/entities/job"
import {
  EyeIcon,
  StarIcon,
  TrendingUpIcon,
  VerifiedIcon,
} from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { Stars } from "./primitives"

const IT_FALLBACK: JobProperty = {
  kind: "it",
  label: "ИТ-компания",
  sublabel: "Аккредитованный работодатель",
}

const VERIFIED_FALLBACK: JobProperty = {
  kind: "verified",
  label: "Компания проверена",
}

/** Prefer the vacancy's own list; otherwise derive from the two boolean marks. */
function propertiesOf(job: Job): JobProperty[] {
  if (job.detail?.properties?.length) return job.detail.properties
  const rows: JobProperty[] = []
  if (job.verified) rows.push(VERIFIED_FALLBACK)
  if (job.itAccredited) rows.push(IT_FALLBACK)
  return rows
}

function PropertyIcon({ kind }: { kind: JobPropertyKind }) {
  if (kind === "it") {
    return <span className="text-xs font-bold leading-none">IT</span>
  }
  const Icon =
    kind === "open"
      ? EyeIcon
      : kind === "rating"
        ? TrendingUpIcon
        : kind === "award"
          ? StarIcon
          : VerifiedIcon
  return <Icon className="size-5" strokeWidth={1.75} />
}

function PropertyRow({ kind, label, sublabel }: JobProperty) {
  const tinted = kind === "rating" || kind === "award"
  return (
    <span className="flex items-center gap-3">
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          tinted ? "bg-info/10 text-info" : "bg-chip text-foreground",
        )}
      >
        <PropertyIcon kind={kind} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold leading-5 text-foreground">
          {label}
        </span>
        {sublabel && (
          <span className="text-sm leading-5 text-muted">{sublabel}</span>
        )}
      </span>
    </span>
  )
}

/** Company summary card: name and rating share a row with the logo on the right;
 *  employer marks sit under that row, full width. */
export function CompanyCard({ job }: { job: Job }) {
  const d = job.detail
  const properties = propertiesOf(job)

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border-strong/70 bg-surface p-6">
      <div className="flex items-start gap-4">
        <div className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1">
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
        <span
          className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xl font-semibold text-foreground"
          style={{ backgroundColor: job.logoBg }}
        >
          {job.logoUrl ? (
            <img src={job.logoUrl} alt="" className="size-full object-cover" />
          ) : (
            job.companyInitial
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
          />
        </span>
      </div>
      {properties.length > 0 && (
        <div className="flex flex-col gap-3">
          {properties.map((property) => (
            <PropertyRow key={`${property.kind}-${property.label}`} {...property} />
          ))}
        </div>
      )}
    </div>
  )
}
