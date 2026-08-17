import { defineConfig } from "vitest/config"
import path from "node:path"

/**
 * A config of its own rather than reusing `vite.config.ts`: that one loads the
 * Figma Make plugins and the dev-server setup, none of which a test run needs.
 * All the tests require is the `@` alias.
 *
 * `environment: "node"` on purpose — everything covered here is pure logic, so
 * there is no DOM to emulate and no jsdom dependency to carry.
 */
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
