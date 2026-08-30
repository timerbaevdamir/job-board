import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  /** Switch between light and dark. */
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "job-board-theme"

/**
 * Read the persisted choice, falling back to the OS preference. Guarded for
 * environments without storage (private mode, tests), where the app should
 * still come up on the system setting.
 */
function initialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark") return stored
  } catch {
    // storage unavailable — fall through to the media query
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

/**
 * Applies the theme to the document and persists it.
 *
 * The dark palette is a re-declaration of the `@theme` tokens under a `.dark`
 * class (see `index.css`), so flipping the class on the root element is the
 * whole switch — every utility already resolves through `var(--color-…)`.
 */
function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark")
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // storage unavailable — the choice applies for this session only
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  // Keep the document in step with state — on first mount and on every change.
  // A layout effect so a stored dark choice lands before the first paint
  // instead of flashing light for a frame.
  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
