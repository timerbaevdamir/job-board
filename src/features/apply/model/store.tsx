import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useSnackbar } from "@/shared/ui/Snackbar"

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
 * Tracks which vacancies the user has applied to and surfaces a snackbar on
 * each new application. The card itself lives on {@link SnackbarProvider};
 * this feature only supplies the daily-goal copy and the progress bar.
 */
export function ApplicationsProvider({ children }: { children: ReactNode }) {
  const { show } = useSnackbar()
  const [applied, setApplied] = useState<Set<string>>(() => new Set())

  const isApplied = useCallback((id: string) => applied.has(id), [applied])

  const apply = useCallback(
    (id: string) => {
      if (applied.has(id)) return
      const count = applied.size + 1
      setApplied((prev) => {
        if (prev.has(id)) return prev
        const next = new Set(prev)
        next.add(id)
        return next
      })
      const { title, subtitle } = motivate(count)
      const pct = Math.min((count / DAILY_GOAL) * 100, 100)
      show({
        title,
        subtitle,
        trailing: `${Math.min(count, DAILY_GOAL)}/${DAILY_GOAL}`,
        extra: (
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background/15">
            <div
              className="h-full rounded-full bg-[#0dc267] transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        ),
      })
    },
    [applied, show],
  )

  const value = useMemo(() => ({ isApplied, apply }), [isApplied, apply])

  return (
    <ApplicationsContext.Provider value={value}>
      {children}
    </ApplicationsContext.Provider>
  )
}

export function useApplications(): ApplicationsContextValue {
  const ctx = useContext(ApplicationsContext)
  if (!ctx)
    throw new Error("useApplications must be used within ApplicationsProvider")
  return ctx
}
