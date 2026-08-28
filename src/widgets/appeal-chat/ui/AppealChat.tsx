import { useLayoutEffect, useRef, useState } from "react"
import {
  formatLastSeen,
  type Appeal,
  type AppealMessage,
} from "@/entities/appeal"
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  DotsIcon,
  DoubleCheckIcon,
  InfoIcon,
  PlusIcon,
} from "@/shared/ui/icons"
import { Button } from "@/shared/ui/Button"
import { Header, HeaderAction, HeaderActions } from "@/shared/ui/Header"
import { HeaderFade } from "@/shared/ui/HeaderFade"
import { SEARCH_CARD } from "@/features/job-search/ui/searchCard"
import { cn } from "@/shared/lib/cn"
import { useScrollToEnd } from "@/shared/lib/useScrollToEnd"

/** 20px on free corners; 6px (`md`) only where two same-side bubbles meet. */
function bubbleCorners(mine: boolean, grouped: boolean, last: boolean) {
  if (mine) {
    return cn(
      "rounded-tl-[20px] rounded-bl-[20px]",
      grouped ? "rounded-tr-md" : "rounded-tr-[20px]",
      last ? "rounded-br-[20px]" : "rounded-br-md",
    )
  }
  return cn(
    "rounded-tr-[20px] rounded-br-[20px]",
    grouped ? "rounded-tl-md" : "rounded-tl-[20px]",
    last ? "rounded-bl-[20px]" : "rounded-bl-md",
  )
}

/** Floats after the text so leftover width on the last line takes the time
 *  (Telegram / WhatsApp). Too narrow → the float wraps to its own row. */
function MessageTime({
  time,
  read,
  tone,
}: {
  time: string
  read?: boolean
  tone: "in" | "out"
}) {
  return (
    <span
      className={cn(
        "float-right ml-2 translate-y-px align-baseline text-xs leading-5",
        tone === "out" ? "text-background/60" : "text-muted",
      )}
    >
      <span className="inline-flex items-center gap-1">
        {time}
        {read && <DoubleCheckIcon className="size-3.5 text-background" />}
      </span>
    </span>
  )
}

function MessageBubble({
  msg,
  grouped,
  showTime,
}: {
  msg: AppealMessage
  /** Continues a stack from the same sender and time — avatar hidden. */
  grouped: boolean
  /** Last message of a group; it carries the shared timestamp. */
  showTime: boolean
}) {
  const mine = msg.from === "me"

  // Outgoing messages: right-aligned dark bubble, no gutter.
  if (mine) {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[72%] bg-foreground px-4 py-3 text-background",
            bubbleCorners(true, grouped, showTime),
          )}
        >
          <p className="flow-root whitespace-pre-line text-sm leading-5">
            {msg.text}
            <MessageTime time={msg.time} read={msg.read} tone="out" />
          </p>
        </div>
      </div>
    )
  }

  // Incoming messages (employer + contact) share a fixed avatar gutter so every
  // bubble lines up on the same left edge; the avatar shows once per group.
  return (
    <div className="flex items-end gap-2">
      {showTime ? (
        <span className="size-8 shrink-0 rounded-full bg-chip" />
      ) : (
        <span className="size-8 shrink-0" aria-hidden />
      )}
      <div
        className={cn(
          "min-w-0 max-w-[72%] bg-chip px-4 py-3 text-foreground",
          bubbleCorners(false, grouped, showTime),
        )}
      >
        {msg.author && !grouped && (
          <div className="mb-1 flex min-w-0 items-baseline justify-between gap-2">
            <p className="shrink-0 text-sm font-semibold leading-5 text-info">
              {msg.author}
            </p>
            {msg.role && (
              <p className="min-w-0 truncate text-right text-xs leading-5 text-muted">
                {msg.role}
              </p>
            )}
          </div>
        )}
        {msg.title && (
          <p className="mb-1 text-sm font-semibold leading-5">{msg.title}</p>
        )}
        <p className="flow-root whitespace-pre-line text-sm leading-5">
          {msg.text}
          <MessageTime time={msg.time} tone="in" />
        </p>
      </div>
    </div>
  )
}

/** Right panel of the appeals section: conversation header, thread, composer. */
export function AppealChat({
  appeal,
  onBack,
  onJobInfo,
  jobInfoOpen = false,
}: {
  appeal: Appeal
  /** Shown only when the chat stands alone — i.e. the narrow layout. */
  onBack?: () => void
  /** Info action: desktop toggles the vacancy pane; phone/tablet navigate. */
  onJobInfo?: () => void
  /** Desktop: the vacancy column is already open. */
  jobInfoOpen?: boolean
}) {
  const threadRef = useScrollToEnd<HTMLDivElement>(appeal.id)

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background">
      <Header
        hairline
        start={
          /* Only where the list isn't beside the chat: with both columns
             visible there is nothing to go back to. */
          onBack ? (
            <HeaderAction
              tone="plain"
              aria-label="К списку откликов"
              onClick={onBack}
            >
              <ArrowLeftIcon className="size-6" />
            </HeaderAction>
          ) : undefined
        }
        end={
          <HeaderActions>
            <HeaderAction
              aria-label="О вакансии"
              aria-pressed={jobInfoOpen}
              onClick={onJobInfo}
            >
              <InfoIcon className="size-5" />
            </HeaderAction>
            <HeaderAction aria-label="Действия">
              <DotsIcon className="size-5" />
            </HeaderAction>
          </HeaderActions>
        }
      >
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold"
          style={{
            backgroundColor: appeal.logoBg,
            color: appeal.logoColor ?? "#ffffff",
          }}
        >
          {appeal.companyInitial}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-semibold leading-[22px] text-foreground">
            {appeal.company}
          </span>
          <span
            className={
              appeal.online
                ? "truncate text-sm leading-5 text-success"
                : "truncate text-sm leading-5 text-muted"
            }
          >
            {appeal.online ? "Онлайн" : formatLastSeen(appeal.lastSeen)}
          </span>
        </div>
      </Header>

      {/* Thread + composer share the scroller so messages tuck under the
          sticky field the way jobs tuck under SearchHeader. `justify-end`
          pins a short conversation; overflowing ones land on the latest
          line via `threadRef`. */}
      <div
        ref={threadRef}
        className="scroll-area min-h-0 flex-1 overflow-y-auto"
      >
        <div className="flex min-h-full flex-col">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-end px-4 py-6 md:px-6">
            <div className="flex justify-center pb-4">
              <span className="text-xs leading-4 text-muted">Сегодня</span>
            </div>
            {appeal.messages.map((msg, i) => {
              const prev = appeal.messages[i - 1]
              const next = appeal.messages[i + 1]
              // Group by side (incoming vs outgoing), not exact sender: consecutive
              // messages on the same side read as one bubble stack — tight spacing,
              // a single avatar, aligned on one line. The last of a group shows the
              // timestamp.
              const side = (m?: AppealMessage) =>
                m ? (m.from === "me" ? "out" : "in") : null
              const grouped = side(prev) === side(msg)
              const showTime = side(next) !== side(msg)
              return (
                <div
                  key={msg.id}
                  className={grouped ? "mt-1" : i === 0 ? "" : "mt-4"}
                >
                  <MessageBubble
                    msg={msg}
                    grouped={grouped}
                    showTime={showTime}
                  />
                </div>
              )
            })}

            {appeal.quickReplies && appeal.quickReplies.length > 0 && (
              <div className="flex flex-wrap justify-end gap-2 pt-4">
                {appeal.quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    className="rounded-full bg-info/10 px-4 py-2 text-sm leading-5 text-info transition-colors hover:bg-info/15"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ChatComposer resume={appeal.resume} />
        </div>
      </div>
    </div>
  )
}

const TEXTAREA_MAX = 160

function ChatComposer({ resume }: { resume: string }) {
  const [value, setValue] = useState("")
  const taRef = useRef<HTMLTextAreaElement>(null)

  const fit = () => {
    const el = taRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX)}px`
  }

  useLayoutEffect(fit, [value])

  return (
    <div className="sticky bottom-0 z-20">
      {/* Fade is a backdrop for this chrome (padding + under the card),
          same stacking as SearchHeader: field on top, gradient behind —
          not a veil on the thread. Bottom padding is a separate solid
          strip so the wash stops at the card's bottom edge. */}
      <div className="relative px-4 pt-4 md:px-6 md:pt-6">
        <HeaderFade to="top" />
        {/* Lifted above the fade the same way SearchHeader lifts the field:
            HeaderFade is a positioned layer, so a static sibling paints
            underneath and the card's top edge would wash out. */}
        <div className="relative z-10 mx-auto w-full max-w-2xl">
          <div className={cn(SEARCH_CARD, "shadow-field")}>
            <textarea
              ref={taRef}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Написать сообщение"
              className="block min-h-[52px] w-full resize-none overflow-y-auto bg-transparent px-4 py-[15px] text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
            />
            <div className="pb-2.5">
              <div className="flex items-center justify-between gap-2 px-2.5">
                <div className="flex min-w-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Прикрепить"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-chip text-foreground transition-colors hover:bg-chip-hover"
                  >
                    <PlusIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Резюме: ${resume}`}
                    className="flex min-w-0 max-w-80 items-center gap-1 rounded-full py-1.5 pl-2.5 pr-3 text-sm font-semibold leading-5 text-foreground transition-colors hover:bg-chip/60"
                  >
                    <span className="truncate">{resume}</span>
                    <ChevronDownIcon className="size-4 shrink-0" />
                  </button>
                </div>
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
          </div>
        </div>
      </div>
      <div
        aria-hidden
        className="bg-background pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] md:pb-6"
      />
    </div>
  )
}
