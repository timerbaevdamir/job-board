import type { JobDetail, JobReview } from "@/entities/job"
import { Button } from "@/shared/ui/Button"
import { SectionHeading, Stars } from "./primitives"

function ReviewCard({ review }: { review: JobReview }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl bg-chip p-4">
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
export function ReviewsSection({ detail }: { detail: JobDetail }) {
  const { rating, recommendPercent, reviews } = detail
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
      <div className="flex flex-col gap-3 sm:flex-row">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
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
