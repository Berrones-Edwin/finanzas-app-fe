# AGENTS.md

## Project Overview

Personal finance SPA (Next.js 16 App Router), backed by a remote Spring Boot API. All data flows through Axios (`lib/api-client.ts`); there is no local database.

## Local Resources & Skills
- **Skills Directory:** Consult and trigger custom skills in `./.opencode/skills/` based on the task to be performed:
  - Use `git-best-practices` for code hygiene, `.gitignore` validation, and Conventional Commit formatting.
  - Use `create-pull-request` when ready to push changes and open a PR.
- **Next.js Documentation:** Before implementing complex routes, server/client boundaries, or layout logic, review the local documentation in `./.opencode/docs-next/`.

## Rules
- Do not run a dev server or run builds unless expressly requested.
- Do not delete files or folders without confirmation.
- Do not install dependencies without asking.
- Do not perform irreversible actions without confirmation.
- **Strict Typing:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`. Always carefully verify TypeScript types and props manually before completing a task, as `pnpm build` will not catch type mismatches.

## Branching & Workflow Rules
- **NEVER implement changes directly on `main` or `master`.**
- Before creating or modifying any code for a new feature, fix, or refactor:
  1. Check the current git branch (`git status` or `git branch --show-current`).
  2. If on `main` or `master`, automatically create and switch to a new branch following the format: `<type>/<short-kebab-description>` (e.g., `feat/add-user-login`, `fix/postgres-connection-leak`).
  3. Perform all work exclusively on the new feature branch.
- **Git Hygiene:** Never stage or commit temporary files, environment variables, or build outputs (`.next/`, `node_modules/`, `coverage/`, `.vscode/`, `.tmp/`, `.env*`).

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

```text
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
### Data Flow

Services (`lib/services/*.ts`) → Axios client → Spring Boot `/api/v1/*`. Hooks (`lib/hooks/*.ts`) wrap services with React Query mutations/queries and invalidate cache on success.

Auth tokens stored in `localStorage` (`lib/token-storage.ts`). API base URL defaults to `http://localhost:8080`, override with `NEXT_PUBLIC_API_URL`.

### Key Quirks & API Contracts

- **Enum Mapping:** Backend serializes enums UPPERCASE (`FlowTypeApi = "INCOME" | "EXPENSE"`), frontend uses lowercase — see `lib/types.ts`.
- **Known API Typo:** `User.fisrtName` is a typo in the API contract — do not rename or fix without explicit backend contract changes.
- **Cache Opt-out:** `instant = false` export in layouts opts out of Next.js Cache Components (TODO in codebase).
- **Unoptimized Images:** Images are unoptimized (`next.config.mjs`), suitable for static export or non-Vercel deploys.
- **Workspace Overrides:** `pnpm-workspace.yaml` allows native builds for `msw` and `sharp` and pins `@types/react` / `@types/react-dom`.

## Code Conventions

- **Path Alias:** `@/*` maps to project root.
- **UI Components:** Place base UI in `components/ui/` (shadcn) and domain-specific components in `components/<domain>/`.
- **Formatting:** Currency via `Intl.NumberFormat` in `es-MX` locale (`lib/format.ts`). Dates also follow `es-MX`.
- **Validation:** Manual validation functions in `lib/validation.ts` (no Zod or Formik). Each returns an error string or `null`.
- **Commits:** Follow Conventional Commits via `.opencode/skills/git-best-practices.md`.
- **UI Language:** All user-facing strings, tooltips, and labels **MUST** be written in Spanish (`es-MX`).