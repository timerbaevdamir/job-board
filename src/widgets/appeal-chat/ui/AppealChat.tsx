import { useLayoutEffect, useRef, useState } from "react"
import type { Appeal, AppealMessage } from "@/entities/appeal"
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  DotsIcon,
  DoubleCheckIcon,
  PlusIcon,
} from "@/shared/ui/icons"
import { Header, HeaderAction } from "@/shared/ui/Header"
import { HeaderFade } from "@/shared/ui/HeaderFade"
import { SEARCH_CARD } from "@/features/job-search/ui/searchCard"
import { cn } from "@/shared/lib/cn"
import { useScrollToEnd } from "@/shared/lib/useScrollToEnd"

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
            "max-w-[72%] rounded-2xl bg-foreground px-4 py-3 text-background",
            grouped ? "rounded-r-md" : "rounded-br-md",
          )}
        >
          <p className="whitespace-pre-line text-sm leading-6">{msg.text}</p>
          {showTime && (
            <span className="mt-1 flex items-center justify-end gap-1 text-xs leading-4 text-background/60">
              {msg.time}
              {msg.read && (
                <DoubleCheckIcon className="size-4 text-[#4da3ff]" />
              )}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Incoming messages (employer + contact) share a fixed avatar gutter so every
  // bubble lines up on the same left edge; the avatar shows once per group.
  const isEmployer = msg.from === "employer"
  return (
    <div className="flex items-end gap-2">
      {showTime ? (
        <span className="size-7 shrink-0 rounded-full bg-chip" />
      ) : (
        <span className="size-7 shrink-0" aria-hidden />
      )}
      <div
        className={cn(
          "max-w-[72%] rounded-2xl px-4 py-3",
          isEmployer
            ? "bg-[#eef4fc] text-foreground"
            : "bg-chip text-foreground",
          grouped ? "rounded-l-md" : "rounded-bl-md",
        )}
      >
        {msg.author && !grouped && (
          <p className="mb-1 text-sm font-semibold leading-5 text-info">
            {msg.author}
          </p>
        )}
        {msg.title && (
          <p className="mb-1 text-sm font-semibold leading-5">{msg.title}</p>
        )}
        <p className="whitespace-pre-line text-sm leading-6">{msg.text}</p>
        {showTime && (
          <span className="mt-1 block text-xs leading-4 text-muted">
            {msg.time}
          </span>
        )}
      </div>
    </div>
  )
}

/** Right panel of the appeals section: conversation header, thread, composer. */
export function AppealChat({
  appeal,
  onBack,
}: {
  appeal: Appeal
  /** Shown only when the chat stands alone — i.e. the narrow layout. */
  onBack?: () => void
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
          <HeaderAction aria-label="Действия">
            <DotsIcon className="size-5" />
          </HeaderAction>
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
          <span className="text-sm leading-5 text-muted">
            {appeal.online ? "Онлайн" : "Не в сети"}
          </span>
        </div>
      </Header>

      {/* Thread + composer share the scroller so the fade can overlay the
          last bubbles the way SearchHeader overlays the feed. `justify-end`
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
      {/* Fade lives with the card only: opaque at the field's bottom edge,
          transparent through `pt-*` into the thread. Bottom padding is a
          separate solid strip so the wash does not continue under the card. */}
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
                  className="flex min-w-0 max-w-80 items-center gap-1 rounded-full bg-chip py-1.5 pl-3.5 pr-3 text-sm font-semibold leading-5 text-foreground transition-colors hover:bg-chip-hover"
                >
                  <span className="truncate">{resume}</span>
                  <ChevronDownIcon className="size-4 shrink-0" />
                </button>
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
