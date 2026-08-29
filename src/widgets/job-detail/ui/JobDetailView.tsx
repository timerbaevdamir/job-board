import { useRef } from "react"
import type { Job } from "@/entities/job"
import { JOBS, JobCard } from "@/entities/job"
import { Button } from "@/shared/ui/Button"
import { AppliedBadge } from "@/shared/ui/AppliedBadge"
import { useApplications } from "@/features/apply"
import { useSaved } from "@/features/save-job"
import { SectionHeading, BulletList } from "./primitives"
import { DetailHeader } from "./DetailHeader"
import { CompanyCard } from "./CompanyCard"
import { AddressMap } from "./AddressMap"
import { AskEmployer } from "./AskEmployer"
import { ReviewsSection } from "./ReviewsSection"

/**
 * Full vacancy view rendered inside the center column — the sidebar and right
 * panel stay in place. A sticky header (sized to the column) carries the back
 * action and save / share / more; a sticky footer carries the apply CTA.
 *
 * `chrome="pane"` is the phone vacancy, forced: used beside chat or opened
 * from a thread. Viewport `md:` would otherwise restyle it into the feed
 * overlay, and apply / contacts / questions / related jobs do not belong —
 * the candidate already applied.
 */
export function JobDetailView({
  job,
  onBack,
  onOpen,
  chrome = "page",
  dismiss = "back",
}: {
  job: Job
  onBack: () => void
  onOpen: (id: string) => void
  chrome?: "page" | "pane"
  /** Desktop third column closes in place; a mobile screen still goes back. */
  dismiss?: "back" | "close"
}) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const d = job.detail
  const skills = d?.skills ?? job.tags
  const related = JOBS.filter((j) => j.id !== job.id).slice(0, 3)
  const { isApplied, apply } = useApplications()
  const { isSaved, toggleSaved } = useSaved()
  const applied = isApplied(job.id)

  return (
    // Full-bleed shell: sticky header/footer span the column, the body centers
    // itself. `min-h-full` keeps the footer at the bottom for short content.
    <div className="flex min-h-full flex-col">
      <DetailHeader
        job={job}
        onBack={onBack}
        titleRef={titleRef}
        inset={
          chrome !== "pane"
            ? "flush"
            : dismiss === "close"
              ? "column"
              : "tight"
        }
        dismiss={dismiss}
      />

      {/* Centered, padded content column. Pane skips `sm:` — those are
          viewport queries, and a 400px column on a desktop still matches them. */}
      <div
        className={
          chrome === "pane"
            ? "mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-8 pt-8"
            : "mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-8 pt-8 sm:px-8 sm:pt-10"
        }
      >
        {/* Title, salary and spec rows */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h1
              ref={titleRef}
              className="text-display font-semibold tracking-display text-foreground"
            >
              {job.title}
            </h1>
            {job.salary && (
              <p className="text-xl font-semibold leading-7 tracking-[-0.1px] text-foreground">
                {job.salary}
              </p>
            )}
          </div>

          {d?.specs && d.specs.length > 0 && (
            <dl className="flex flex-col gap-1.5">
              {d.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex flex-wrap gap-x-2 text-sm leading-5"
                >
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {applied && <AppliedBadge size="md" className="w-full" />}
        </div>

        <CompanyCard job={job} />

        {/* Intro / description */}
        <div className="flex flex-col gap-3">
          {d?.intro && (
            <p className="text-sm leading-6 text-foreground">{d.intro}</p>
          )}
          {job.description.map((paragraph, i) => (
            <p key={i} className="text-sm leading-6 text-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Titled bullet sections */}
        {d?.sections?.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <SectionHeading>{section.heading}</SectionHeading>
            <BulletList items={section.items} />
          </section>
        ))}

        {/* Key skills */}
        {skills.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Ключевые навыки</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg bg-chip px-2 py-1 text-sm leading-5 text-chip-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {d?.address && (
          <AddressMap
            address={d.address}
            mapImage={d.mapImage}
            metro={d.metro}
          />
        )}

        {/* Contacts */}
        {chrome !== "pane" && d?.contactName && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Контакты</SectionHeading>
            <div className="flex flex-col gap-4 rounded-3xl border border-border-strong/70 bg-surface p-4 md:rounded-2xl md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-col">
                <span className="text-base leading-[22px] text-foreground">
                  {d.contactName}
                </span>
                {d.contactRole && (
                  <span className="text-sm leading-5 tracking-[0.07px] text-muted">
                    {d.contactRole}
                  </span>
                )}
              </div>
              <Button variant="secondary" size="sm" className="w-full md:w-auto">
                Показать контакты
              </Button>
            </div>
          </section>
        )}

        {chrome !== "pane" && <AskEmployer />}

        {d && <ReviewsSection detail={d} compact={chrome === "pane"} />}

        {chrome !== "pane" && related.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Вам подойдут и эти вакансии</SectionHeading>
            <div className="flex flex-col gap-4">
              {related.map((r) => (
                <JobCard
                  key={r.id}
                  job={r}
                  onSelect={onOpen}
                  saved={isSaved(r.id)}
                  applied={isApplied(r.id)}
                  onToggleSave={toggleSaved}
                  onApply={apply}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {chrome !== "pane" && (
        /* Sticky full-width apply bar. On a phone it sits on the tab bar as
           one raised panel; from `md` it is the page's bottom edge. */
        <footer className="sticky bottom-0 z-20 rounded-t-[20px] bg-surface shadow-bar md:rounded-none md:border-t md:border-border md:shadow-none">
          {/* On a phone the two actions split the width as equal grid tracks —
              a flex `flex-1` would fight `shrink-0` on `Button`. From `md` they
              hug their labels and sit on the left of the content column. */}
          <div
            className={
              applied
                ? "mx-auto w-full max-w-3xl px-4 pb-2 pt-4 sm:px-8 md:flex md:pb-4"
                : "mx-auto grid w-full max-w-3xl grid-cols-2 items-center gap-3 px-4 pb-2 pt-4 sm:px-8 md:flex md:pb-4"
            }
          >
            {!applied && (
              <Button variant="primary" size="lg" onClick={() => apply(job.id)}>
                Откликнуться
              </Button>
            )}
            <Button
              variant="secondary"
              size="lg"
              fullWidth={applied}
              className={applied ? "md:w-auto" : undefined}
            >
              Контакты
            </Button>
          </div>
        </footer>
      )}
    </div>
  )
}
