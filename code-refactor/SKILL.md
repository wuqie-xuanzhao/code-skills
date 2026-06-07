---
name: code-refactor
description: |
  Safe AI-assisted code refactoring for existing code. Use when the user asks to refactor, clean up, modernize, improve maintainability, reduce duplication, optimize structure or performance without changing behavior, or apply code-review findings. Do not use for new features, known bug fixes, full rewrites, or pure code review.
---

# Code Refactor

## Overview

Refactoring changes code structure while preserving externally observable behavior. It is controlled evolution, not a rewrite and not a feature delivery shortcut.

Use this skill to turn a clear maintainability, structure, modernization, or behavior-preserving performance goal into small verified changes. Prefer existing `code-review` findings as input when they exist; a review finding explains *why* the code deserves attention, while this skill controls *how* to change it safely.

## When to Use

**Use for:**

- Refactoring, cleanup, maintainability improvement, or code smell removal
- Breaking down long functions, large modules, god objects, duplicated logic, or tangled dependencies
- Applying confirmed `code-review` recommendations that are refactor-only
- Behavior-preserving performance optimization
- Modernization migrations that preserve the public contract
- Preparing code for future work by improving seams and boundaries

**Do not use for:**

- New features or product behavior changes
- Known bug fixes where current behavior is wrong
- Full rewrites or repo rebuilds
- Pure code review with no intent to change code
- Style-only churn that has no maintainability, safety, or performance goal

If the request mixes refactor with feature work or bug fixing, split the request first. Execute only the refactor slice unless the user explicitly switches tasks.

## Refactor Types

| Type | Use When | Typical Moves |
|------|----------|---------------|
| **Incremental** | Local code is hard to read but boundaries are sound | rename, extract function, remove duplication, simplify conditionals |
| **Structural** | Responsibilities, modules, or dependencies are tangled | extract class/module, move logic, introduce seams, split phases |
| **Performance-preserving** | Code is slow but behavior must stay identical | cache derived values, batch work, remove repeated computation, reduce N+1 patterns |
| **Modernization migration** | Old APIs, callbacks, types, or framework idioms need updating | adapter, compatibility wrapper, staged API migration, typed boundary |

## Workflow

### Phase 1: Clarify Goal and Behavior Boundary

Before editing, state the refactor goal in one sentence and define the behavior that must not change.

Ask only if unclear:

1. "What external behavior must remain identical?"
2. "Is there an existing review report or finding I should use?"

Behavior boundary includes public APIs, return shapes, errors, logs relied on by users, config keys, database schema, authorization behavior, timing/order guarantees, generated files, and UI-visible output.

If you cannot name the behavior boundary, you are not ready to refactor. Read `references/safety.md`.

### Phase 2: Reuse Existing Review Findings

When a `code-review` report or review comments exist:

1. Read the relevant findings first.
2. Classify each item:
   - **Refactor now** — structure/maintainability/performance-with-same-behavior
   - **Bugfix** — current behavior is wrong; route to debugging/TDD
   - **Feature** — behavior addition; defer to feature flow
   - **Defer** — valid but out of scope for this pass
3. Refactor only the **Refactor now** items.

Do not redo a full review unless the user asks. If no review exists, do a lightweight smell scan using `references/code_smells.md`.

### Phase 3: Build the Safety Net

Refactoring without a safety net is editing with hope. Before changing behavior-adjacent code:

- Run existing focused tests if available.
- Add characterization tests when behavior is under-tested.
- For performance work, record a baseline and a behavioral equivalence check.
- For modernization, identify compatibility points and migration stages.
- Note rollback points for multi-step changes.

If tests are absent and the refactor is non-trivial, stop implementation and propose the smallest characterization tests first.

### Phase 4: Plan Small Verified Steps

Write a short plan before editing. Each step must name:

- The smell or review finding it addresses
- The exact files/functions it touches
- The behavior boundary it preserves
- The verification command or manual check after the step

Prefer one refactor technique per step. Do not combine rename + extraction + API migration + performance optimization in one edit.

### Phase 5: Execute One Refactor at a Time

After each small change:

1. Run the focused verification.
2. If it fails, revert or fix before continuing.
3. Do not expand scope to make the next step easier.
4. Keep public interfaces stable unless the user explicitly approved an interface migration.

Use `references/techniques.md` for mechanics and `references/patterns.md` only when a code smell justifies a pattern.

### Phase 6: Verify and Summarize

Before claiming completion, run the agreed verification and summarize evidence. If verification cannot be run, say exactly why and what remains unproven.

Suggest a follow-up `code-review` when the refactor touches critical paths, public APIs, security-sensitive code, or multiple modules.

## Reference Loading Guide

| Need | Read |
|------|------|
| Identify whether code deserves refactoring | `references/code_smells.md` |
| Choose a small mechanical refactor | `references/techniques.md` |
| Replace conditionals/boundaries with a design pattern | `references/patterns.md` |
| Preserve behavior, add characterization tests, handle performance or modernization risk | `references/safety.md` |

Load only the reference needed for the current decision.

## Output Format

Use this structure for refactor work:

```markdown
## Refactor Scope

- Goal:
- Type: incremental | structural | performance-preserving | modernization migration
- Inputs reused: code-review finding / user-specified smell / lightweight smell scan

## Behavior Boundary

- Public behavior preserved:
- Explicitly out of scope:

## Refactor Plan

| Step | Smell/Finding | Change | Verification |
|------|---------------|--------|--------------|

## Changes Made

- ...

## Verification Evidence

- Command/check:
- Result:

## Deferred / Not Done

- ...

## Follow-up Review Suggestion

- Needed / not needed, with reason.
```

## Common Failure Modes

| Failure | Correct Response |
|---------|------------------|
| "While refactoring, add this setting" | Split feature work; defer it unless the user switches task |
| No tests but broad structural change requested | Add characterization tests or propose a staged plan before editing |
| Performance optimization changes ordering/errors/return shape | Treat as behavior change; stop and ask |
| Modernization requires API changes | Keep an adapter or request explicit approval for migration |
| Pattern seems elegant but smell is local | Prefer simpler local technique |
| Review finding is actually a bug | Route to debugging/TDD, not refactor |
| Refactor touches auth, persistence, money, or security | Keep changes smaller and request follow-up review |

## Final Check

Before saying the refactor is complete, confirm:

- The refactor goal was met.
- External behavior boundary was named and preserved.
- No feature or bugfix was mixed in.
- Verification evidence is reported.
- Deferred items are explicit.
