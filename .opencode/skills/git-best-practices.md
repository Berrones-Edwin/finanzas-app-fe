---
name: git-best-practices
description: Applies Conventional Commits standards, CHANGELOG.md updates, and security checks in .gitignore.
---

# Skill: Git Best Practices & Security Standard

## Description
Applies professional standards for version control management, sensitive data leak prevention, and project history maintenance.

## Execution Rules

### 1. Version Control & Hygiene (.gitignore)
- **Pre-check:** Before making any changes, commit, or staging, ensure that the `.gitignore` file contains and respects the exclusion of:
  - Environment variables (`.env`, `.env.local`, `.env.*`).
  - Dependency directories (`node_modules/`, `venv/`, `.venv/`, `vendor/`,).
  - Temporary files and AI/editor state folders (`.opencode/`, `.cursor/`, `.tmp/`, `dist/`, `build/`,`.next/`).
- **Leak Prevention:** Never suggest, create, or include API keys, tokens, or credentials in Git-tracked files.

### 2. Commit Format (Conventional Commits)
When writing commit messages or updating change history, strictly follow the **Conventional Commits** standard:

#### Format:
`<type>(<optional scope>): <short description in present/imperative tense>`

#### Allowed Types:
- `feat`: A new feature for the user.
- `fix`: A bug fix in the code.
- `docs`: Changes exclusively in documentation.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Updates to build tasks, package managers, or tools without changing source code.

#### Valid Examples:
- `feat(auth): add JWT authentication flow`
- `fix(chat): resolve memory leak in message listener`
- `chore(deps): update opencode dependencies`

### 3. Changelog Maintenance (CHANGELOG.md)
- Upon completing a major feature or critical fix, update or create the `CHANGELOG.md` file, documenting changes under the sections: `Added`, `Changed`, `Fixed`, or `Removed`.