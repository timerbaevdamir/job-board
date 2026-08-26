import type { Job } from "../model/types"

export type FeedId = "for-you" | "design" | "product" | "analytics" | "dev"

/**
 * Personal recommendation feeds above the vacancy list. The first is the
 * general ranking; the rest are short role-shaped cuts of the same results.
 */
export const FEEDS: { id: FeedId; label: string }[] = [
  { id: "for-you", label: "Для вас" },
  { id: "design", label: "Дизайн" },
  { id: "product", label: "Продакт" },
  { id: "analytics", label: "Аналитика" },
  { id: "dev", label: "Разработка" },
]

/** Title/tag fragments that pull a vacancy into a role feed. */
const NEEDLES: Record<Exclude<FeedId, "for-you">, string[]> = {
  design: ["дизайн", "designer", "ux", "ui", "figma", "лендинг"],
  product: ["продакт", "growth", "владелец продукта", "менеджер проектов"],
  analytics: ["аналитик", "sql"],
  dev: ["frontend", "разработчик", "react", "typescript"],
}

export function jobMatchesFeed(job: Job, feedId: FeedId): boolean {
  if (feedId === "for-you") return true
  const hay = `${job.title} ${job.tags.join(" ")}`.toLowerCase()
  return NEEDLES[feedId].some((n) => hay.includes(n))
}
