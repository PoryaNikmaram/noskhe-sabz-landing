# Noskhe Sabz Website Architecture

## Core Principles

- Use TypeScript in strict mode.
- Avoid `any`.
- Use Server Components by default.
- Add `"use client"` only when browser APIs, state, effects, or interaction require it.
- Keep business logic outside presentational components.
- Do not add dependencies without a clear architectural reason.
- Prefer native Next.js and browser APIs before adding libraries.
- Use feature-first architecture.
- Feature-specific code must stay inside `src/features`.
- Shared components must only contain truly reusable UI.
- Do not move components into shared folders prematurely.

## Folder Responsibilities

### `src/app`

Routing, layouts, loading states, error boundaries, metadata, route handlers.

### `src/features`

Business or product-specific functionality.

Examples:

- auth
- catalog-3d
- checkout
- demo-request
- pricing
- support

### `src/components/ui`

Generic UI primitives.

Examples:

- Button
- Input
- Dialog
- Badge

### `src/components/layout`

Application layout components.

Examples:

- Navbar
- Footer
- Container

### `src/components/shared`

Reusable components that are not primitive UI.

### `src/lib`

Framework-independent helpers and infrastructure.

### `src/config`

Static application configuration.

### `src/providers`

Global React providers.

## React / Next.js Rules

- Prefer React Server Components.
- Never convert an entire page to a Client Component for one interactive element.
- Extract interactive sections into isolated Client Components.
- Fetch public SEO-critical content on the server when possible.
- Use `next/image` for website images when appropriate.
- Use `next/font` for fonts.
- Use Next.js Metadata APIs for SEO.

## Styling

- Tailwind CSS is the primary styling solution.
- Do not introduce MUI, styled-components, Emotion, or another styling system.
- Use design tokens for brand colors.
- Do not hardcode brand colors repeatedly throughout components.

## State

- Prefer local React state for local UI state.
- Prefer URL state for filters, tabs, pagination, and shareable state.
- Prefer server state for backend data.
- Do not add Redux or Zustand without an explicit requirement.

## Dependencies

Before adding a package, verify:

1. The problem cannot reasonably be solved with the current stack.
2. The package is actively maintained.
3. It does not duplicate an existing dependency.
4. It has acceptable bundle/runtime impact.

## 3D

All Three.js / React Three Fiber implementation must remain inside:

`src/features/catalog-3d`

Other parts of the application must not depend directly on Three.js internals.

## Quality Gate

Before considering a task complete:

```bash
npm run typecheck
npm run lint
npm run build
```
