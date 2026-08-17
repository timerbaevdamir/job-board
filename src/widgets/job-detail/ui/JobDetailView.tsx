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
 */
export function JobDetailView({
  job,
  onBack,
  onOpen,
}: {
  job: Job
  onBack: () => void
  onOpen: (id: string) => void
}) {
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
      <DetailHeader job={job} onBack={onBack} />

      {/* Centered, padded content column */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pb-8 pt-2 sm:px-8">
        {/* Title, salary and spec rows */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="text-[28px] font-semibold leading-9 tracking-[-0.35px] text-foreground">
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
        {d?.contactName && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Контакты</SectionHeading>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border-strong/70 bg-surface p-4">
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
              <Button variant="secondary" size="sm">
                Показать контакты
              </Button>
            </div>
          </section>
        )}

        <AskEmployer />

        {d && <ReviewsSection detail={d} />}

        {/* Related vacancies */}
        {related.length > 0 && (
          <section className="flex flex-col gap-3">
            <SectionHeading>Вам подойдут и эти вакансии</SectionHeading>
            <div className="flex flex-col gap-3">
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

      {/* Sticky full-width apply bar, separated from the content above it two
          different ways.

          On a phone the tab bar sits directly under it, and the two are one
          raised panel: same surface, no line between them, a rounded top for
          the content to disappear under and a single shadow lifting the whole
          stack. From `md` there is no tab bar and the page is laid out rather
          than stacked — the bar is just its bottom edge, and a hairline is what
          an edge looks like. Opaque either way; a translucent bar over a white
          feed only reads as a smudge. */}
      <footer className="sticky bottom-0 z-20 rounded-t-[20px] bg-surface shadow-bar md:rounded-none md:border-t md:border-border md:shadow-none">
        {/* A grid, not a flex row: the two actions carry equal weight and split
            the width, and a grid track stretches its item without being asked.
            The flex spelling would be `flex-1` on each button — but `Button`
            has `shrink-0` baked in and `cn` doesn't merge, so which of the two
            won would come down to stylesheet order.

            Less room below than above, but only on a phone: there the gap under
            the buttons is really the tab bar's own centring, so the bar adds
            little of its own. From `md` the bar ends the page and nothing sits
            below to lend it space, so it goes back to even. */}
        <div className="mx-auto grid w-full max-w-3xl grid-cols-2 items-center gap-3 px-4 pb-2 pt-4 sm:px-8 md:pb-4">
          {applied ? (
            <AppliedBadge size="lg" />
          ) : (
            <Button variant="primary" size="lg" onClick={() => apply(job.id)}>
              Откликнуться
            </Button>
          )}
          <Button variant="secondary" size="lg">
            Контакты
          </Button>
        </div>
      </footer>
    </div>
  )
}
