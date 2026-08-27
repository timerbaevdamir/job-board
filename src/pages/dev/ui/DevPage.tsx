import type { ReactNode } from "react"
import { Button, type ButtonSize, type ButtonVariant } from "@/shared/ui/Button"
import { Cell } from "@/shared/ui/Cell"
import { Counter } from "@/shared/ui/Counter"
import { OptionRow, RadioMark } from "@/shared/ui/OptionRow"
import {
  HeartIcon,
  SearchIcon,
  ShareIcon,
  SlidersIcon,
  StarIcon,
  VerifiedIcon,
} from "@/shared/ui/icons"

/* ------------------------------------------------------------------ layout */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold leading-[26px] text-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

/* --------------------------------------------------------------- swatches */

const TOKENS: { name: string; className: string; border?: boolean }[] = [
  { name: "background", className: "bg-background", border: true },
  { name: "foreground", className: "bg-foreground" },
  { name: "surface-muted", className: "bg-surface-muted", border: true },
  { name: "muted", className: "bg-muted" },
  { name: "border", className: "bg-border" },
  { name: "chip", className: "bg-chip", border: true },
  { name: "brand", className: "bg-brand" },
  { name: "success", className: "bg-success" },
  { name: "accent", className: "bg-accent" },
  { name: "danger", className: "bg-danger" },
]

function Swatch({
  name,
  className,
  border,
}: {
  name: string
  className: string
  border?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`size-16 rounded-xl ${className} ${
          border ? "border border-border" : ""
        }`}
      />
      <span className="text-xs text-muted">{name}</span>
    </div>
  )
}

/* -------------------------------------------------------------------- tags */

function Well({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chip text-foreground">
      {children}
    </span>
  )
}

function CellList({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-md flex-col rounded-3xl bg-surface-muted p-2">
      {children}
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-lg bg-chip px-2 py-1 text-sm leading-5 text-chip-foreground">
      {children}
    </span>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, value - i))
        return (
          <span key={i} className="relative inline-block size-4">
            <StarIcon
              className="size-4 text-[#d7dde5]"
              strokeWidth={1.5}
              fill="currentColor"
            />
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon
                  className="size-4 text-[#ffb020]"
                  strokeWidth={1.5}
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

/* -------------------------------------------------------------------- page */

const VARIANTS: ButtonVariant[] = ["primary", "secondary", "tertiary", "link"]
const SIZES: ButtonSize[] = ["sm", "md", "lg"]

export function DevPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-14 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-display font-semibold tracking-display text-foreground">
            UI Kit · Атомы
          </h1>
          <p className="text-sm leading-5 text-muted">
            Витрина базовых компонентов дизайн-системы.{" "}
            <a href="#/" className="text-info">
              ← Вернуться к приложению
            </a>
          </p>
        </header>

        {/* Colour tokens */}
        <Section title="Цветовые токены">
          <div className="flex flex-wrap gap-5">
            {TOKENS.map((t) => (
              <Swatch key={t.name} {...t} />
            ))}
          </div>
        </Section>

        {/* Type */}
        <Section title="Типографика">
          <div className="flex flex-col gap-4">
            <p className="text-display font-semibold tracking-display text-foreground">
              Display 28 · Заголовок страницы
            </p>
            <p className="text-title font-semibold tracking-title text-foreground">
              Title 24 · Заголовок секции
            </p>
            <p className="text-xl font-semibold leading-7 text-foreground">
              Xl 20 · Подзаголовок
            </p>
            <p className="text-lg font-semibold leading-[26px] text-foreground">
              Lg 18 · Заголовок карточки
            </p>
            <p className="text-base leading-[22px] text-foreground">
              Base 16 · Основной текст
            </p>
            <p className="text-sm leading-5 text-muted">
              Sm 14 · Вторичный текст
            </p>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Кнопки">
          {VARIANTS.map((variant) => (
            <Row key={variant} label={variant}>
              {SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  Кнопка {size}
                </Button>
              ))}
            </Row>
          ))}

          <Row label="С иконкой">
            <Button variant="primary" icon={<ShareIcon />}>
              Поделиться
            </Button>
            <Button variant="secondary" icon={<HeartIcon />}>
              В избранное
            </Button>
          </Row>

          <Row label="Только иконка">
            <Button
              variant="primary"
              size="sm"
              icon={<SearchIcon />}
              aria-label="Поиск"
            />
            <Button
              variant="secondary"
              size="md"
              icon={<SlidersIcon />}
              aria-label="Фильтры"
            />
            <Button
              variant="tertiary"
              size="lg"
              icon={<ShareIcon />}
              aria-label="Поделиться"
            />
          </Row>

          <Row label="Поле чата">
            <Button variant="primary" size="composer">
              Отправить
            </Button>
            <Button variant="primary" size="composer" disabled>
              Отправить
            </Button>
          </Row>

          <Row label="Состояния">
            <Button variant="primary">По умолчанию</Button>
            <Button variant="primary" disabled>
              Отключена
            </Button>
            <Button variant="primary" fullWidth>
              Во всю ширину
            </Button>
          </Row>
        </Section>

        {/* Cells */}
        <Section title="Ячейки">
          <Row label="Подпись и подзаголовок">
            <CellList>
              <Cell
                start={
                  <Well>
                    <HeartIcon className="size-5" />
                  </Well>
                }
                label="Избранное"
                chevron
              />
              <Cell
                start={
                  <Well>
                    <SearchIcon className="size-5" />
                  </Well>
                }
                label="Дизайнер интерфейсов"
                sublabel="Москва · от 180 000 ₽"
                chevron
              />
              <Cell
                start={
                  <Well>
                    <VerifiedIcon className="size-5" />
                  </Well>
                }
                reverse
                label="Компания проверена"
                sublabel="Статус"
                chevron
              />
            </CellList>
          </Row>

          <Row label="Состояния">
            <CellList>
              <Cell label="Обычная" chevron />
              <Cell label="Выбранная" selected chevron />
              <Cell label="Отключённая" disabled chevron />
              <Cell
                label="Город"
                sublabel="Место поиска"
                end={
                  <span className="shrink-0 text-sm leading-5 text-muted">
                    Москва
                  </span>
                }
                chevron
              />
            </CellList>
          </Row>

          <Row label="Крупная · как в ленте">
            <CellList>
              <Cell
                size="lg"
                label="Дизайнер интерфейсов"
                sublabel={
                  <>
                    <span className="text-foreground">92%</span> совпадает с
                    вашими навыками
                  </>
                }
                end={
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-surface">
                    <SearchIcon className="size-6 text-foreground" />
                  </span>
                }
              />
            </CellList>
          </Row>

          <Row label="Вариант выбора">
            <CellList>
              <OptionRow start={<RadioMark checked={false} />}>
                По дате
              </OptionRow>
              <OptionRow selected start={<RadioMark checked />}>
                По соответствию
              </OptionRow>
            </CellList>
          </Row>
        </Section>

        {/* Tags & badges */}
        <Section title="Теги и бейджи">
          <Row label="Нейтральные теги">
            <Tag>Опыт от 3 до 6 лет</Tag>
            <Tag>Figma</Tag>
            <Tag>Прототипирование</Tag>
          </Row>

          <Row label="Акцентные бейджи">
            <span className="rounded-lg bg-accent-soft px-2 py-1 text-sm leading-5 text-accent">
              Можно из дома
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-success-soft px-2 py-1 text-sm leading-5 text-success">
              <VerifiedIcon className="size-4" strokeWidth={1.75} />
              Компания проверена
            </span>
            <span className="rounded-lg border border-border px-2.5 py-1 text-sm leading-5">
              <span className="font-medium text-foreground">99%</span>{" "}
              <span className="text-chip-foreground">совпадение</span>
            </span>
          </Row>

          <Row label="Статус">
            <span className="text-sm text-success">онлайн</span>
            <span className="rounded bg-chip px-1 text-[11px] font-semibold text-muted">
              IT
            </span>
          </Row>

          <Row label="Счётчики">
            <Counter />
            <Counter size="sm" />
            <Counter value={2} size="sm" />
            <Counter value={2} />
            <Counter value={35} />
            <Counter value={128} tone="info" />
          </Row>

          <Row label="Счётчики на иконке">
            <span className="relative size-6">
              <SearchIcon className="size-6 text-muted" />
              <Counter
                value={2}
                size="sm"
                className="absolute right-0 top-0 translate-[50%_-25%]"
              />
            </span>
            <span className="relative size-6">
              <HeartIcon className="size-6 text-muted" />
              <Counter className="absolute right-0 top-0 translate-[50%_-25%]" />
            </span>
          </Row>
        </Section>

        {/* Chips */}
        <Section title="Чипы">
          <Row label="Подсказки (pill)">
            {["Можно удалённо?", "Есть ли ДМС?", "Какой график?"].map((q) => (
              <button
                key={q}
                type="button"
                className="rounded-full bg-chip px-3 py-1.5 text-sm leading-5 text-foreground transition-colors hover:bg-chip-hover"
              >
                {q}
              </button>
            ))}
          </Row>
        </Section>

        {/* Inputs */}
        <Section title="Поля ввода">
          <Row label="Поиск">
            <label className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface py-3 pl-3 pr-4 focus-within:border-brand/50">
              <SearchIcon className="size-6 shrink-0 text-subtle" />
              <input
                type="text"
                placeholder="Профессия или должность"
                className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
              />
            </label>
          </Row>

          <Row label="С кнопкой">
            <label className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface py-3 pl-4 pr-3 focus-within:border-brand/50">
              <input
                type="text"
                placeholder="Напишите свой вопрос…"
                className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
              />
              <Button variant="primary" size="sm">
                Отправить
              </Button>
            </label>
          </Row>
        </Section>

        {/* Rating */}
        <Section title="Рейтинг">
          <Row label="Звёзды (дробный)">
            <span className="flex items-center gap-2">
              <span className="text-base font-semibold leading-[22px] text-foreground">
                3,8
              </span>
              <Stars value={3.8} />
            </span>
            <Stars value={5} />
            <Stars value={2.5} />
          </Row>
        </Section>
      </div>
    </div>
  )
}
