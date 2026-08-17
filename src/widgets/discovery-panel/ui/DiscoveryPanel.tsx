import { useState, type ReactNode } from "react"
import { SPONSORS, USER_ACTIVITY } from "@/shared/config/discovery"
import {
  RECOMMENDATIONS,
  RECOMMENDATIONS_VISIBLE,
} from "@/shared/config/recommendations"
import { ChevronDownIcon } from "@/shared/ui/icons"
import { cn } from "@/shared/lib/cn"

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

/**
 * Unified suggestion card — one layout for both free tips and paid services.
 * A service simply carries an accent icon tint ({@link iconBg}/{@link iconColor})
 * and an accent trigger line ({@link cta}); otherwise the card is identical.
 */
function RecommendationCard({
  title,
  subtitle,
  cta,
  icon,
  iconBg,
  iconColor,
}: {
  title: string
  subtitle?: string
  cta?: string
  icon: ReactNode
  iconBg?: string
  iconColor?: string
}) {
  const accent = iconBg != null
  return (
    <button
      type="button"
      className={`${CARD} flex w-full items-start gap-3 p-4 text-left transition-colors hover:border-border-strong`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-base leading-[22px] text-foreground">
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

export function DiscoveryPanel() {
  const [expanded, setExpanded] = useState(false)
  const recs = expanded
    ? RECOMMENDATIONS
    : RECOMMENDATIONS.slice(0, RECOMMENDATIONS_VISIBLE)

  return (
    <div className="flex flex-col gap-8 p-6">
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
