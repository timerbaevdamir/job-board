import { describe, expect, it, beforeAll } from "vitest"
import { render, act } from "@testing-library/react"
import { useScrollToEnd } from "./useScrollToEnd"

/**
 * jsdom has no layout, so `scrollTop` is a fixed 0 and `scrollHeight` is 0.
 * The hook's whole job is `scrollTop = scrollHeight`; without somewhere to
 * keep both numbers, that assignment is a no-op and the test would pass
 * vacuously. Same prototype install as `useScrollRestoration`: React attaches
 * the ref and runs the layout effect before a test can touch the node.
 */
const tops = new WeakMap<Element, number>()
const THREAD = 800

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTop", {
    configurable: true,
    get(this: Element) {
      return tops.get(this) ?? 0
    },
    set(this: Element, value: number) {
      tops.set(this, value)
    },
  })
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get() {
      return THREAD
    },
  })
})

function Thread({ id }: { id: string }) {
  const ref = useScrollToEnd<HTMLDivElement>(id)
  return <div ref={ref} data-testid="thread" />
}

describe("useScrollToEnd", () => {
  it("opens a thread at its latest messages", () => {
    const { getByTestId } = render(<Thread id="a-1" />)
    expect(getByTestId("thread").scrollTop).toBe(THREAD)
  })

  it("re-pins when the conversation changes", () => {
    const { getByTestId, rerender } = render(<Thread id="a-1" />)
    act(() => {
      getByTestId("thread").scrollTop = 12
    })

    rerender(<Thread id="a-2" />)
    expect(getByTestId("thread").scrollTop).toBe(THREAD)
  })
})
