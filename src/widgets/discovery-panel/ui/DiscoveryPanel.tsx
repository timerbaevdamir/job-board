import { useState, type ReactNode } from "react"
import { SPONSORS, USER_ACTIVITY } from "@/shared/config/discovery"
import {
  RECOMMENDATIONS,
  RECOMMENDATIONS_VISIBLE,
} from "@/shared/config/recommendations"
import { ChevronDownIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

function SectionLabel({ children }: { children: string }) {
  return <p className="text-base leading-[22px] text-muted">{children}</p>
}

const CARD = "rounded-2xl border border-border-strong/70 bg-surface"

function ActivityCard() {
  return (
    <div className={`${CARD} flex flex-col gap-2.5 p-4`}>
      <div className="flex items-center justify-between text-base leading-[22px]">
        <span className="text-foreground">Моя активность</span>
        <span className="text-muted">{USER_ACTIVITY}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-[#0dc267]"
          style={{ width: `${USER_ACTIVITY}%` }}
        />
      </div>
    </div>
  )
}

function IconWell({
  accent,
  iconBg,
  iconColor,
  icon,
}: {
  accent: boolean
  iconBg?: string
  iconColor?: string
  icon: ReactNode
}) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full",
        !accent && "bg-chip text-foreground",
      )}
      style={
        accent ? { backgroundColor: iconBg, color: iconColor } : undefined
      }
    >
      {icon}
    </span>
  )
}

/**
 * Unified suggestion card — one layout for both free tips and paid services.
 * A service simply carries an accent icon tint ({@link iconBg}/{@link iconColor})
 * and an accent trigger line ({@link cta}); otherwise the card is identical.
 *
 * `stack` is the phone carousel: avatar above the copy, title sized like the
 * subtitle. `row` is the rail — copy left, avatar right, title at body size.
 * `cn` does not merge, so the axis is chosen once rather than overridden.
 */
function RecommendationCard({
  title,
  subtitle,
  cta,
  icon,
  iconBg,
  iconColor,
  layout,
}: {
  title: string
  subtitle?: string
  cta?: string
  icon: ReactNode
  iconBg?: string
  iconColor?: string
  layout: "row" | "stack"
}) {
  const accent = iconBg != null
  const stacked = layout === "stack"
  const well = (
    <IconWell
      accent={accent}
      iconBg={iconBg}
      iconColor={iconColor}
      icon={icon}
    />
  )
  const copy = (
    <span className="min-w-0 flex-1">
      <span
        className={
          stacked
            ? "block text-sm leading-5 tracking-[0.07px] text-foreground"
            : "block text-base leading-[22px] text-foreground"
        }
      >
        {title}
      </span>
      {subtitle && (
        <span className="block text-sm leading-5 tracking-[0.07px] text-muted">
          {subtitle}
        </span>
      )}
      {cta && (
        <span className="block text-sm leading-5 tracking-[0.07px] text-info">
          {cta}
        </span>
      )}
    </span>
  )

  return (
    <button
      type="button"
      className={cn(
        CARD,
        "text-left transition-colors hover:border-border-strong",
        stacked
          ? "flex w-56 shrink-0 flex-col items-start gap-3 p-4"
          : "flex w-full items-start gap-3 p-4",
      )}
    >
      {stacked ? (
        <>
          {well}
          {copy}
        </>
      ) : (
        <>
          {copy}
          {well}
        </>
      )}
    </button>
  )
}

function SponsorRow({
  title,
  domain,
  image,
}: {
  title: string
  domain: string
  image: string
}) {
  return (
    // A button, not an anchor: it goes nowhere yet, and `href="#"` gives
    // screen readers a link that lies about being one.
    <button
      type="button"
      aria-label={`${title} — ${domain}`}
      className="flex w-full items-center gap-3 text-left"
    >
      <img
        src={image}
        alt=""
        className="size-24 shrink-0 rounded-2xl border border-black/10 bg-surface-muted object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-base leading-[22px] text-foreground">{title}</p>
        <p className="text-sm leading-5 tracking-[0.07px] text-muted">
          {domain}
        </p>
      </div>
    </button>
  )
}

function ExpandToggle({
  expanded,
  onToggle,
}: {
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1 text-base leading-[22px] text-foreground"
    >
      {expanded ? "Свернуть" : "Развернуть"}
      <ChevronDownIcon
        className={`size-4 transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </button>
  )
}

function RecommendationList({ layout }: { layout: "row" | "stack" }) {
  return RECOMMENDATIONS.map(
    ({ id, label, subtitle, cta, icon: Icon, iconBg, iconColor }) => (
      <RecommendationCard
        key={id}
        title={label}
        subtitle={subtitle}
        cta={cta}
        icon={<Icon className="size-6" />}
        iconBg={iconBg}
        iconColor={iconColor}
        layout={layout}
      />
    ),
  )
}

/**
 * Profile tips, activity, and sponsors. On a phone this lives in the feed
 * (the rail is gone): activity first, then the same muted "Рекомендации"
 * label as the rail. The title-sized teaser opens the cards and then
 * yields to them. Wider layouts keep the vertical rail, with extra items
 * behind "Развернуть".
 */
export function DiscoveryPanel() {
  const mobile = useLayoutMode() === "mobile"
  // Phone starts folded so the teaser heading is visible; opening the cards
  // hides it. The rail starts folded too — extra items sit behind "Развернуть".
  const [expanded, setExpanded] = useState(false)
  const recs = expanded
    ? RECOMMENDATIONS
    : RECOMMENDATIONS.slice(0, RECOMMENDATIONS_VISIBLE)
  const top = RECOMMENDATIONS[0]
  const more = Math.max(0, RECOMMENDATIONS.length - 1)

  if (mobile) {
    return (
      <div className="flex flex-col gap-8">
        <ActivityCard />

        <section
          className={
            expanded ? "flex flex-col gap-3" : "flex flex-col gap-1"
          }
        >
          {expanded ? (
            <button
              type="button"
              aria-expanded
              onClick={() => setExpanded(false)}
              className="text-left text-base leading-[22px] text-muted"
            >
              Рекомендации
            </button>
          ) : (
            <SectionLabel>Рекомендации</SectionLabel>
          )}

          {!expanded && (
            <h3 className="text-title font-semibold tracking-title">
              <button
                type="button"
                aria-expanded={false}
                onClick={() => setExpanded(true)}
                className="inline text-left"
              >
                <span className="text-foreground">{top.label}</span>
                {more > 0 && (
                  <span className="font-semibold text-muted">
                    {" "}
                    плюс ещё {more}
                  </span>
                )}
                <ChevronDownIcon className="mb-0.5 ml-0.5 inline-block size-5 align-middle text-muted" />
              </button>
            </h3>
          )}

          {expanded && (
            <>
              <div className="-mx-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] sm:-mx-8 [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max gap-3 px-4 sm:px-8">
                  <RecommendationList layout="stack" />
                </div>
              </div>
              <ExpandToggle
                expanded
                onToggle={() => setExpanded(false)}
              />
            </>
          )}
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-5">
      <ActivityCard />

      <section className="flex flex-col gap-3">
        <SectionLabel>Рекомендации</SectionLabel>
        {recs.map(
          ({ id, label, subtitle, cta, icon: Icon, iconBg, iconColor }) => (
            <RecommendationCard
              key={id}
              title={label}
              subtitle={subtitle}
              cta={cta}
              icon={<Icon className="size-6" />}
              iconBg={iconBg}
              iconColor={iconColor}
              layout="row"
            />
          ),
        )}
        {RECOMMENDATIONS.length > RECOMMENDATIONS_VISIBLE && (
          <ExpandToggle
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Спонсоры</SectionLabel>
        {SPONSORS.map((s) => (
          <SponsorRow
            key={s.id}
            title={s.title}
            domain={s.domain}
            image={s.image}
          />
        ))}
      </section>
    </div>
  )
}
