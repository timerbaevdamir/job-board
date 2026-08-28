import { plural } from "@/shared/lib/plural"

const MONTHS = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек",
] as const

const DAYS = { one: "день", few: "дня", many: "дней" }

function pad(n: number) {
  return String(n).padStart(2, "0")
}

function clock(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** Calendar days from `then` to `now` (DST-safe: both snapped to midnight). */
function calendarDaysAgo(then: Date, now: Date) {
  return Math.round((startOfDay(now) - startOfDay(then)) / 86_400_000)
}

/**
 * Telegram-style Russian last-seen for a chat header.
 * Companies have no grammatical gender, so the verb stays `был(а)`.
 */
export function formatLastSeen(
  lastSeen: string | Date | undefined,
  now: Date = new Date(),
): string {
  if (lastSeen == null || lastSeen === "") return "Не в сети"
  const then = lastSeen instanceof Date ? lastSeen : new Date(lastSeen)
  if (Number.isNaN(then.getTime())) return "Не в сети"

  const ms = now.getTime() - then.getTime()
  if (ms < 60_000) return "был(а) в сети только что"

  const days = calendarDaysAgo(then, now)
  if (days <= 0) return `был(а) в сети сегодня в ${clock(then)}`
  if (days === 1) return `был(а) в сети вчера в ${clock(then)}`
  if (days < 7) {
    return `был(а) в сети ${days} ${plural(days, DAYS)} назад`
  }

  const date = `${then.getDate()} ${MONTHS[then.getMonth()]}`
  if (then.getFullYear() === now.getFullYear()) {
    return `был(а) в сети ${date}`
  }
  return `был(а) в сети ${date} ${then.getFullYear()}`
}
