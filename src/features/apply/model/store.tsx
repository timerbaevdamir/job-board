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

/** Daily apply goal used for the motivating snackbar copy. */
const DAILY_GOAL = 10

type ApplicationsContextValue = {
  isApplied: (id: string) => boolean
  apply: (id: string) => void
}

const ApplicationsContext = createContext<ApplicationsContextValue | null>(null)

/** Encouraging title + subtitle for the snackbar, based on progress. */
function motivate(count: number): { title: string; subtitle: string } {
  const remaining = Math.max(DAILY_GOAL - count, 0)
  if (remaining === 0) {
    return {
      title: "Дневная цель выполнена! 🎉",
      subtitle: "Вы отправили 10 откликов сегодня",
    }
  }
  const wordForms =
    remaining === 1 ? "отклик" : remaining < 5 ? "отклика" : "откликов"
  return {
    title: "Отклик отправлен",
    subtitle: `Ещё ${remaining} ${wordForms} до дневной цели`,
  }
}

/**
 * Tracks which vacancies the user has applied to and surfaces a black snackbar
 * in the bottom-left corner that fades in and out on each new application.
 */
export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const [applied, setApplied] = useState<Set<string>>(() => new Set())
  const [toast, setToast] = useState<{ key: number; count: number } | null>(null)
  const [visible, setVisible] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isApplied = useCallback((id: string) => applied.has(id), [applied])

  const apply = useCallback((id: string) => {
    setApplied((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      // Show the snackbar with a count that reflects this fresh application.
      setToast({ key: Date.now(), count: next.size })
      return next
    })
  }, [])

  // Drive the fade: mount -> next frame fade-in -> hold -> fade-out -> unmount.
  useEffect(() => {
    if (!toast) return
    if (hideTimer.current) clearTimeout(hideTimer.current)
    if (clearTimer.current) clearTimeout(clearTimer.current)

    const raf = requestAnimationFrame(() => setVisible(true))
    hideTimer.current = setTimeout(() => setVisible(false), 3200)
    clearTimer.current = setTimeout(() => setToast(null), 3200 + 320)

    return () => cancelAnimationFrame(raf)
  }, [toast])

  // Memoized so the toast's own re-renders (fade in/out) don't invalidate the
  // context and re-render every card subscribed to it.
  const value = useMemo(() => ({ isApplied, apply }), [isApplied, apply])

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none fixed bottom-6 left-6 z-50 w-[340px] rounded-2xl bg-black p-4 text-white shadow-xl transition-all duration-300 ease-out ${
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {(() => {
            const { title, subtitle } = motivate(toast.count)
            const pct = Math.min((toast.count / DAILY_GOAL) * 100, 100)
            return (
              <>
                <p className="text-base font-semibold leading-[22px]">
                  {title}
                </p>
                <p className="mt-0.5 text-sm leading-5 text-white/70">
                  {subtitle}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-[#0dc267] transition-[width] duration-500 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-sm leading-5 tabular-nums text-white/70">
                    {Math.min(toast.count, DAILY_GOAL)}/{DAILY_GOAL}
                  </span>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </ApplicationsContext.Provider>
  )
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext)
  if (!ctx)
    throw new Error("useApplications must be used within ApplicationsProvider")
  return ctx
}
