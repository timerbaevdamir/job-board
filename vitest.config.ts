import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

/**
 * A config of its own rather than reusing `vite.config.ts`: that one loads the
 * Figma Make plugins and the dev-server setup, none of which a test run needs.
 *
 * Two projects, because the tests fall into two genuinely different kinds and
 * running them the same way would make one of them worse.
 *
 * `logic` is the bulk of it — search, routing, ordering, plurals, the nav phase
 * machine. All pure, so it runs in plain `node`: no DOM to build up and tear
 * down per file, and no way for a test to accidentally start depending on one.
 *
 * `dom` is for the parts whose whole job is to talk to the browser — hooks that
 * measure elements, stores that run effects, the router's history stack. Those
 * cannot be checked without a document, and leaving them untested meant the
 * code most likely to break silently was the code with no tests at all.
 *
 * The split is by filename (`*.dom.test.*`) rather than by directory, so a
 * module's tests stay next to it either way and the suffix says why this one is
 * different.
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    projects: [
      {
        resolve: {
          alias: { "@": path.resolve(import.meta.dirname, "./src") },
        },
        test: {
          name: "logic",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.dom.test.ts"],
        },
      },
      {
        // JSX in the test files themselves — provider wrappers, mostly.
        plugins: [react()],
        resolve: {
          alias: { "@": path.resolve(import.meta.dirname, "./src") },
        },
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/**/*.dom.test.{ts,tsx}"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
})
