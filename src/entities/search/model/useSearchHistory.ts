import { useCallback, useEffect, useState } from "react"

const STORAGE_KEY = "job-search:history"

// Seed a few recent searches so the empty-focus state has content on first run.
const SEED = ["Продуктовый дизайнер", "UX-исследователь", "Аналитик данных"]

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as string[]
  } catch {
    // Ignore unavailable/corrupt storage — fall back to the seed.
  }
  return SEED
}

/**
 * Recent-search history, persisted to localStorage so it survives reloads.
 * `record` prepends (deduped, most-recent first, capped); `remove` drops one.
 */
export function useSearchHistory(max = 8) {
  const [history, setHistory] = useState<string[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch {
      // Non-fatal: persistence is best-effort.
    }
  }, [history])

  const record = useCallback(
    (value: string) => {
      const v = value.trim()
      if (!v) return
      setHistory((prev) => [v, ...prev.filter((h) => h !== v)].slice(0, max))
    },
    [max],
  )

  const remove = useCallback((value: string) => {
    setHistory((prev) => prev.filter((h) => h !== value))
  }, [])

  return { history, record, remove }
}
