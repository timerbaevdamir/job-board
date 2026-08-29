import { useState } from "react"
import { SEARCH_CARD } from "@/features/job-search/ui/searchCard"
import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/Button"
import { ArrowUpIcon, CornerDownRightIcon } from "@/shared/ui/icons"
import { SectionHeading } from "./primitives"

const QUICK_QUESTIONS = [
  "Есть ли тестовое задание для дизайнера?",
  "Какой формат работы — гибрид или удалёнка?",
  "Из чего складывается вилка от 300 000 ₽?",
  "Как устроен процесс собеседования?",
]

/** Free-form question field with quick-suggestion chips below it. */
export default function AskEmployer() {
  const [value, setValue] = useState("")

  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Задайте вопрос работодателю</SectionHeading>
      <div className={cn(SEARCH_CARD, "shadow-field")}>
        <div className="flex items-center gap-2 pr-2.5">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Напишите свой вопрос…"
            className="min-h-[52px] min-w-0 flex-1 bg-transparent py-[15px] pl-4 text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
          />
          <Button
            variant="primary"
            size="composer"
            type="button"
            disabled={!value.trim()}
            aria-label="Отправить"
            icon={<ArrowUpIcon />}
          />
        </div>
      </div>
      <div className="flex flex-col">
        {QUICK_QUESTIONS.map((q) => (
          <button
            type="button"
            key={q}
            className="group flex items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-muted"
          >
            <span className="flex size-6 shrink-0 items-center justify-center">
              <CornerDownRightIcon className="size-5 text-faint transition-colors group-hover:text-muted" />
            </span>
            <span className="flex items-center py-px text-base leading-[22px] text-foreground">
              {q}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
