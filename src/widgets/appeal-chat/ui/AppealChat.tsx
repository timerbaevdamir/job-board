import type { Appeal, AppealMessage } from "@/entities/appeal"
import {
  ArrowLeftIcon,
  DotsIcon,
  DoubleCheckIcon,
  PaperclipIcon,
} from "@/shared/ui/icons"
import { HeaderFade } from "@/shared/ui/HeaderFade"
import { cn } from "@/shared/lib/cn"

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
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-background">
      {/* Header */}
      <header className="relative z-20 flex flex-col gap-4 px-6 pb-4 pt-4">
        <HeaderFade />
        <div className="relative z-10 flex items-center gap-3">
          {/* Only where the list isn't beside the chat: with both columns
              visible there is nothing to go back to. */}
          {onBack && (
            <button
              type="button"
              aria-label="К списку откликов"
              onClick={onBack}
              className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-chip"
            >
              <ArrowLeftIcon className="size-6" />
            </button>
          )}
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
          <button
            type="button"
            aria-label="Действия"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-background/60 text-foreground backdrop-blur-md transition-colors hover:bg-chip/70"
          >
            <DotsIcon className="size-5" />
          </button>
        </div>

        {/* Resume: bordered pill linking to the attached CV */}
        <div className="relative z-10 flex h-12 items-center rounded-xl border border-border px-4">
          <p className="text-sm leading-5 text-muted">
            Резюме: <span className="text-info">{appeal.resume}</span>
          </p>
        </div>
      </header>

      {/* Thread — grows from the bottom up (mt-auto pins content to the base). */}
      <div className="scroll-area flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-end">
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
                  className="rounded-full bg-[#e9f1fb] px-4 py-2 text-sm leading-5 text-info transition-colors hover:bg-[#dcebfb]"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="px-6 pb-6">
        <div className="mx-auto flex h-12 w-full max-w-2xl items-center gap-3 rounded-2xl bg-chip px-4">
          <button
            type="button"
            aria-label="Прикрепить файл"
            className="flex size-6 shrink-0 items-center justify-center text-subtle transition-colors hover:text-foreground"
          >
            <PaperclipIcon className="size-5" />
          </button>
          <input
            type="text"
            placeholder="Написать сообщение"
            className="min-w-0 flex-1 bg-transparent text-base leading-[22px] text-foreground placeholder:text-faint focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
