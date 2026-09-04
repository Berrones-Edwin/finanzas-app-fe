# AGENTS.md

## Project Overview

Personal finance SPA (Next.js 16 App Router), backed by a remote Spring Boot API. All data flows through Axios (`lib/api-client.ts`); there is no local database.

## Commands

| Task | Command |
|------|---------|
| Dev server | `pnpm dev` |
| Build | `pnpm build` |
| Lint | `pnpm lint` (runs `eslint .`) |

No test runner, formatter, or typecheck scripts are configured. `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so `pnpm build` will succeed even with TS errors — lint is the only automated check.

## Architecture

- **Package manager:** pnpm (single-package workspace, `pnpm-workspace.yaml` only has build overrides)
- **React 19 + Next.js 16** with `"use client"` boundary at providers and page level
- **Tailwind CSS v4** via `@tailwindcss/postcss`; theme tokens in `app/globals.css`
- **shadcn/ui** (`components/ui/`) — style `base-nova`, run `npx shadcn@latest add <component>` to add
- **React Query** for server state (`lib/hooks/`). Stale time: 30 s. Queries retry once.
- **Axios** client at `lib/api-client.ts` — auto-attaches JWT, retries 401 once with refresh token

### Route structure

```
app/
  page.tsx               # Root — redirects to /dashboard or /login
  login/page.tsx
  register/page.tsx
  (app)/                  # Authenticated layout (AuthGate + AppShell)
    layout.tsx
    dashboard/
    accounts/
    categories/
    transactions/
    transfers/
    budgets/
```

### Data flow

Services (`lib/services/*.ts`) → Axios client → Spring Boot `/api/v1/*`. Hooks (`lib/hooks/*.ts`) wrap services with React Query mutations/queries and invalidate cache on success.

Auth tokens stored in `localStorage` (`lib/token-storage.ts`). API base URL defaults to `http://localhost:8080`, override with `NEXT_PUBLIC_API_URL`.

### Key quirks

- Backend serializes enums UPPERCASE (`FlowTypeApi = "INCOME" | "EXPENSE"`), frontend uses lowercase — see `lib/types.ts`.
- `User.fisrtName` is a typo in the API contract — do not fix without backend change.
- `instant = false` export in layouts opts out of Next.js Cache Components (TODO in codebase).
- Images are unoptimized (`next.config.mjs`), suitable for static export or non-Vercel deploys.
- `pnpm-workspace.yaml` allows native builds for `msw` and `sharp` and pins `@types/react` / `@types/react-dom`.

## Conventions

- **Path alias:** `@/*` maps to project root.
- **UI components:** shadcn in `components/ui/`, domain components in `components/<domain>/`.
- **Formatting:** Currency via `Intl.NumberFormat` in `es-MX` locale (`lib/format.ts`). Dates also `es-MX`.
- **Validation:** Manual functions in `lib/validation.ts` (no zod/formik). Each returns an error string or `null`.
- **Git commits:** Conventional Commits format (see `.opencode/skills/git-best-practices.md`).
- **UI language:** All user-facing strings are in Spanish.

# Project Context and rules

## Local Resources
- **Work Skills** Consult the custom skills in `.opencode/skills/` baased on the task to be performed.
- **Next.js** Before implementing a route or complex components, review the local documentation in `.opencode/docs-next/`.