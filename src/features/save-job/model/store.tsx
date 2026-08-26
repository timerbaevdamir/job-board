import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useSnackbar } from "@/shared/ui/Snackbar"

type SavedContextValue = {
  isSaved: (id: string) => boolean
  toggleSaved: (id: string) => void
}

const SavedContext = createContext<SavedContextValue | null>(null)

/** Stable empty default: a literal would be a new array on every render. */
const NO_IDS: string[] = []

/**
 * Tracks which vacancies are saved to favourites so the heart toggle stays in
 * sync between the feed cards and the detail view. `initialSaved` seeds the
 * starting favourites; it is passed in by the app layer so this feature stays
 * free of any dependency on the `entities` mock data.
 */
export function SavedProvider({
  children,
  initialSaved = NO_IDS,
}: {
  children: ReactNode
  initialSaved?: string[]
}) {
  const { show } = useSnackbar()
  const [saved, setSaved] = useState<Set<string>>(() => new Set(initialSaved))

  const isSaved = useCallback((id: string) => saved.has(id), [saved])

  const toggleSaved = useCallback(
    (id: string) => {
      const adding = !saved.has(id)
      setSaved((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      show({
        title: adding
          ? "Вакансия добавлена в избранное"
          : "Вакансия удалена из избранного",
      })
    },
    [saved, show],
  )

  // Memoized so consumers only re-render when the favourites actually change,
  // not on every render of whatever sits above the provider.
  const value = useMemo(
    () => ({ isSaved, toggleSaved }),
    [isSaved, toggleSaved],
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error("useSaved must be used within SavedProvider")
  return ctx
}
