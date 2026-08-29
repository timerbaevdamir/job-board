import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { cn } from "@/shared/lib/cn"
import { useNavVia, useRoute } from "@/shared/lib/router"
import { showTabBar } from "@/shared/lib/showTabBar"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"

const HOLD_MS = 3200
const FADE_MS = 320

export type SnackbarContent = {
  title: string
  subtitle?: string
  trailing?: string
  extra?: ReactNode
}

type SnackbarContextValue = {
  show: (content: SnackbarContent) => void
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null)

/**
 * Black toast card used for every transient confirmation. On a phone it sits
 * 16px above the tab bar — or 16px above the home indicator when that bar is
 * off (a thread, or a vacancy opened from one) — and spans the screen with
 * 16px insets. Wider layouts keep a 340px card in the corner. `cn` does not
 * merge, so those positions are separate branches rather than a base class a
 * caller is expected to beat.
 */
function SnackbarCard({
  content,
  visible,
}: {
  content: SnackbarContent
  visible: boolean
}) {
  const mode = useLayoutMode()
  const route = useRoute()
  const via = useNavVia()
  const tabBar = showTabBar(mode, route, via)
  const bottom =
    mode !== "mobile"
      ? "bottom-6 left-6 w-[340px]"
      : tabBar
        ? "inset-x-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]"
        : "inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]"
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed z-50 rounded-2xl bg-black p-4 text-white shadow-xl transition-all duration-300 ease-out",
        bottom,
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-base font-semibold leading-[22px]">
          {content.title}
        </p>
        {content.trailing != null && (
          <span className="shrink-0 text-sm leading-5 tabular-nums text-white/70">
            {content.trailing}
          </span>
        )}
      </div>
      {content.subtitle != null && (
        <p className="mt-0.5 text-sm leading-5 text-white/70">
          {content.subtitle}
        </p>
      )}
      {content.extra}
    </div>
  )
}

/**
 * One live region for the whole app. Features call {@link useSnackbar} and
 * pass copy; they do not mount a card of their own.
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    key: number
    content: SnackbarContent
  } | null>(null)
  const [visible, setVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((content: SnackbarContent) => {
    setToast({ key: Date.now(), content })
  }, [])

  // Drive the fade: mount -> next frame fade-in -> hold -> fade-out -> unmount.
  useEffect(() => {
    if (!toast) return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (clearTimer.current) clearTimeout(clearTimer.current)

    const raf = requestAnimationFrame(() => setVisible(true))
    hideTimer.current = setTimeout(() => setVisible(false), HOLD_MS)
    clearTimer.current = setTimeout(() => setToast(null), HOLD_MS + FADE_MS)

    return () => cancelAnimationFrame(raf)
  }, [toast])

  const value = useMemo(() => ({ show }), [show])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {toast && <SnackbarCard content={toast.content} visible={visible} />}
    </SnackbarContext.Provider>
  )
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext)
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider")
  return ctx
}
