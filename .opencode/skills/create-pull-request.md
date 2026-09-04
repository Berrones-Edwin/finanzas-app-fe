---
name: create-pull-request
description: Creates a GitHub Pull Request following conventional standards using the GitHub CLI (gh).
---

# Skill: Create Pull Request

## Description
Automates the creation of a Pull Request by creating a feature branch, committing changes, pushing to the remote repository, and opening the PR via `gh cli`.

## Execution Steps

1. **Safety Check:**
   - Verify there are no sensitive files staged or untracked (`.env`, `logs/`, etc.).
   - Check current git status using `git status`.

2. **Branch Naming:**
   - Ensure you are not on `main` or `master`.
   - If on `main`, create and switch to a new branch following the format: `feat/short-description` or `fix/short-description`.

3. **Commit & Push:**
   - Commit changes applying the `git-best-practices` skill (Conventional Commits).
   - Push the branch to the remote origin: `git push -u origin <branch-name>`.

4. **Pull Request Creation:**
   - Execute the GitHub CLI command to create the PR:
     ```bash
     gh pr create --title "<type>(<scope>): <short description>" --body "<detailed summary of changes>"
     ```
   - Make sure the body includes sections for: `Summary`, `Changes Made`, and `Testing Done`.