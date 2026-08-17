# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Formatting

There is deliberately **no `format` script**. `oxfmt` 0.2.0 corrupts TypeScript
in this project in two ways, both silent:

1. It collapses multi-line object **types** onto one line and drops the
   separators — `{ checked: boolean; multi: boolean }` becomes
   `{ checked: boolean multi: boolean }`, a TS1005 error.
2. It **moves doc comments out of a type literal** into the destructuring
   pattern above it, so every prop's documentation ends up attached to nothing.
   This one does not fail typecheck, so it survives review.

A single run across `src` damaged ten files at once. Match the surrounding style
by hand instead. If a formatter is reintroduced, pin a version verified against
both cases above.

## `cn` does not merge

`shared/lib/cn.ts` joins class strings and nothing more — there is no
tailwind-merge. Two classes setting the **same CSS property** both survive, and
the winner is decided by their order in Tailwind's stylesheet, not by the order
you wrote them. This has caused real bugs here: `flex-col` vs `flex-row`,
`transition-transform` vs `transition-[width]`, `shrink-0` vs `flex-1`, and
Tailwind v4's `translate-*` (which sets `translate`) against an arbitrary
`[transform:…]`.

So: **choose, don't override.** Write the property once, in a conditional —
`variant === "tab" ? "flex-col" : "flex-row"` — rather than a base class a
caller is expected to beat. When a component's variants differ across many
properties and states, move them into `@layer components` in `index.css` and
apply exactly one class per variant (see `.drawer-sheet` / `.drawer-rail`).

Responsive variants (`md:shadow-none` over `shadow-bar`) are exempt: those are
the same declaration at two widths, which is what the variant is for.

## Breakpoints

Declared once, in the `@theme static` block at the top of `src/index.css`.
Tailwind builds `sm:` / `md:` / `lg:` from them, and `shared/lib/useLayoutMode`
reads the same custom properties at runtime. Do not hardcode a pixel width in
either language — change the token and both follow.

`useLayoutMode` exists for the cases where the three layouts differ in
*behaviour*, not only appearance (mobile has no rail and navigates from a bottom
bar; tablet opens its labels in a panel; desktop shows them inline). Use classes
for everything that is only a matter of size.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
