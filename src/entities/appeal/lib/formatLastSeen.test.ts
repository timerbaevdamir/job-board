import { describe, expect, it } from "vitest"
import { formatLastSeen } from "./formatLastSeen"

/** Friday 28 Aug 2026, 19:46 — matches the session "today". */
const now = new Date(2026, 7, 28, 19, 46, 0)

const at = (y: number, mo: number, d: number, h = 0, mi = 0, s = 0) =>
  new Date(y, mo, d, h, mi, s)

describe("formatLastSeen", () => {
  it("falls back when the timestamp is missing or unreadable", () => {
    expect(formatLastSeen(undefined, now)).toBe("Не в сети")
    expect(formatLastSeen("", now)).toBe("Не в сети")
    expect(formatLastSeen("not-a-date", now)).toBe("Не в сети")
  })

  it("says только что within the last minute, including clock skew", () => {
    expect(formatLastSeen(at(2026, 7, 28, 19, 45, 30), now)).toBe(
      "был(а) в сети только что",
    )
    expect(formatLastSeen(at(2026, 7, 28, 19, 50), now)).toBe(
      "был(а) в сети только что",
    )
  })

  it("names today and yesterday with the clock", () => {
    expect(formatLastSeen(at(2026, 7, 28, 14, 20), now)).toBe(
      "был(а) в сети сегодня в 14:20",
    )
    expect(formatLastSeen(at(2026, 7, 27, 18, 3), now)).toBe(
      "был(а) в сети вчера в 18:03",
    )
  })

  it("counts 2–6 calendar days with the Russian plural", () => {
    expect(formatLastSeen(at(2026, 7, 26, 9, 0), now)).toBe(
      "был(а) в сети 2 дня назад",
    )
    expect(formatLastSeen(at(2026, 7, 25, 12, 0), now)).toBe(
      "был(а) в сети 3 дня назад",
    )
    expect(formatLastSeen(at(2026, 7, 23, 8, 0), now)).toBe(
      "был(а) в сети 5 дней назад",
    )
  })

  it("switches to a calendar date from a week back", () => {
    expect(formatLastSeen(at(2026, 7, 21, 11, 0), now)).toBe(
      "был(а) в сети 21 авг",
    )
    expect(formatLastSeen(at(2026, 6, 4, 10, 0), now)).toBe(
      "был(а) в сети 4 июл",
    )
    expect(formatLastSeen(at(2025, 11, 2, 16, 0), now)).toBe(
      "был(а) в сети 2 дек 2025",
    )
  })

  it("accepts an ISO string the same way as a Date", () => {
    expect(formatLastSeen(at(2026, 7, 28, 14, 20).toISOString(), now)).toBe(
      "был(а) в сети сегодня в 14:20",
    )
  })
})
