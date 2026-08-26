import { Button } from "@/shared/ui/Button"
import { CornerDownRightIcon } from "@/shared/ui/icons"
import { SectionHeading } from "./primitives"

const QUICK_QUESTIONS = [
  "Есть ли тестовое задание для дизайнера?",
  "Какой формат работы — гибрид или удалёнка?",
  "Из чего складывается вилка от 300 000 ₽?",
  "Как устроен процесс собеседования?",
]

/** Free-form question field with quick-suggestion chips below it. */
export function AskEmployer() {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeading>Задайте вопрос работодателю</SectionHeading>
      <label className="flex items-center gap-3 rounded-xl bg-chip py-3 pl-4 pr-3">
        <input
          type="text"
          placeholder="Напишите свой вопрос…"
          className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
        />
        <Button variant="primary" size="sm">
          Отправить
        </Button>
      </label>
      <div className="flex flex-col">
        {QUICK_QUESTIONS.map((q) => (
          <button
            type="button"
            key={q}
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-surface-muted"
          >
            <CornerDownRightIcon className="size-5 shrink-0 text-faint transition-colors group-hover:text-muted" />
            <span className="text-base leading-[22px] text-foreground">
              {q}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
