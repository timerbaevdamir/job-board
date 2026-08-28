import type { JobDetail, JobReview } from "@/entities/job"
import { Button } from "@/shared/ui/Button"
import { cn } from "@/shared/lib/cn"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import { SectionHeading, Stars } from "./primitives"

function ReviewCard({
  review,
  className,
}: {
  review: JobReview
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-2xl bg-chip p-4", className)}>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium leading-5 text-foreground">
            {review.author}
          </span>
          <Stars value={review.rating} />
        </div>
        <p className="text-sm leading-6 text-foreground">{review.text}</p>
      </div>
      <span className="text-xs leading-4 text-muted">{review.date}</span>
    </div>
  )
}

/** Company reviews: aggregate rating + recommend rate, review cards, actions. */
export function ReviewsSection({
  detail,
  compact = false,
}: {
  detail: JobDetail
  /** Phone carousel even on a wide viewport — a vacancy pane, not the feed. */
  compact?: boolean
}) {
  const { rating, recommendPercent, reviews } = detail
  const mobile = compact || useLayoutMode() === "mobile"
  if (!reviews || reviews.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Отзывы о компании</SectionHeading>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {rating !== undefined && (
          <span className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold leading-8 text-foreground">
              {rating.toFixed(1).replace(".", ",")}
            </span>
            <Stars value={rating} />
          </span>
        )}
        {recommendPercent !== undefined && (
          <span className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold leading-8 text-foreground">
              {recommendPercent}%
            </span>
            <span className="text-sm leading-5 text-muted">рекомендуют</span>
          </span>
        )}
      </div>
      {/* Phone: a snap carousel that peeks the next card. Wider screens keep
          the two reviews side by side in the column. */}
      <div
        className={
          mobile
            ? "-mx-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : undefined
        }
      >
        <div className={mobile ? "flex pl-4" : "flex gap-3"}>
          {reviews.map((review, i) => (
            <ReviewCard
              key={review.id}
              review={review}
              className={
                mobile
                  ? cn(
                      "w-[85%] shrink-0 snap-start",
                      i < reviews.length - 1 && "mr-3",
                    )
                  : "min-w-0 flex-1"
              }
            />
          ))}
          {/* Padding on a wrapping flex box does not extend the scroll
              overflow; a real end item does. */}
          {mobile ? <div className="w-4 shrink-0" aria-hidden /> : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" size="sm">
          Оставить отзыв
        </Button>
        <Button variant="link" size="sm">
          Все отзывы
        </Button>
      </div>
    </section>
  )
}
