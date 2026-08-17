import { describe, expect, it, beforeAll } from "vitest"
import { render, act } from "@testing-library/react"
import { useScrollRestoration } from "./useScrollRestoration"

/**
 * jsdom has no layout, so `scrollTop` is a fixed 0 on every element. This gives
 * each one somewhere to keep it — the least a scroll container needs to be one
 * at all. Installed on the prototype rather than per element because React
 * attaches refs and runs layout effects before a test gets a chance to touch
 * the node, and the hook restores its position in exactly that window.
 */
const tops = new WeakMap<Element, number>()

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
})

function Feed({ id }: { id: string }) {
  const ref = useScrollRestoration<HTMLDivElement>(id)
  return <div ref={ref} data-testid="feed" />
}

/** Scroll the way a user does: move it, and let the element say so. */
function scrollTo(el: HTMLElement, top: number) {
  act(() => {
    el.scrollTop = top
    el.dispatchEvent(new Event("scroll"))
  })
}

describe("useScrollRestoration", () => {
  it("puts a returning container back where it was", () => {
    const first = render(<Feed id="feed" />)
    scrollTo(first.getByTestId("feed"), 640)
    first.unmount()

    const second = render(<Feed id="feed" />)
    expect(second.getByTestId("feed").scrollTop).toBe(640)
  })

  it("keeps the last scrolled-to position, not the one read at teardown", () => {
    const first = render(<Feed id="teardown" />)
    const el = first.getByTestId("feed")
    scrollTo(el, 400)

    // A container hidden behind the vacancy view reports 0 without ever firing
    // a scroll event. Reading the element on the way out would overwrite a good
    // position with that zero; recording from the event cannot.
    el.scrollTop = 0
    first.unmount()

    const second = render(<Feed id="teardown" />)
    expect(second.getByTestId("feed").scrollTop).toBe(400)
  })

  it("keeps positions apart by key", () => {
    const feed = render(<Feed id="a" />)
    scrollTo(feed.getByTestId("feed"), 120)
    feed.unmount()

    const other = render(<Feed id="b" />)
    expect(other.getByTestId("feed").scrollTop).toBe(0)
  })

  it("starts a container that has never been scrolled at the top", () => {
    const { getByTestId } = render(<Feed id="fresh" />)
    expect(getByTestId("feed").scrollTop).toBe(0)
  })
})
