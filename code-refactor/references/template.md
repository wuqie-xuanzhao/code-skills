# Refactor Report Reference Template

This file provides an optional report structure for archived `code-refactor` results. By default, report in the conversation. Write a file only when the user asks to save or archive the refactor report.

## 1. Frontmatter

```yaml
---
type: incremental | structural | performance-preserving | modernization-migration
date: YYYY-MM-DD
status: active | outdated
scope:
  - path/to/file.ts
  - path/to/module
commit: <short hash or HEAD>
source:
  kind: code-review | user-request | smell-scan
  reference: <review file, PR comment, or short description>
---
```

- `type` is the dominant refactor type.
- `scope` lists files or directories changed.
- `commit` captures the codebase state after the refactor. Use `HEAD` for uncommitted changes.
- `source` records why the refactor happened.

Filename when archived: `docs/superpowers/refactors/YYYY-MM-DD-{descriptive-slug}.md`.

## 2. Body Structure

```markdown
## Summary

<!-- 2–3 sentences: what was refactored, why, and verification status. -->

## Refactor Scope

- Goal:
- Type:
- Inputs reused:
- Explicitly out of scope:

## Behavior Boundary

| Boundary | Preservation Evidence |
|----------|-----------------------|
| {public API / return shape / errors / performance semantics} | {test, check, or explanation} |

## Refactor Plan vs Actual Changes

| Step | Smell/Finding | Planned Change | Actual Change | Verification |
|------|---------------|----------------|---------------|--------------|

## Verification Evidence

- `{command}`: PASS/FAIL/SKIPPED — {details}

## Deferred / Not Done

- {feature, bugfix, risky migration, or follow-up review item not included}

## Follow-up Review Recommendation

- Needed / not needed:
- Reason:
```

## 3. Writing Guidelines

### Summary

- Keep it short.
- State whether verification passed, failed, or was skipped.
- Do not claim behavior preservation without evidence.

### Behavior Boundary

Include boundaries that matter for the refactor:

- Public APIs and import paths
- Return shape and ordering
- Error semantics
- Persistence/schema/config values
- Authorization behavior
- Performance baseline and output equivalence for performance work

### Deferred / Not Done

Use this section aggressively. It prevents scope mixing.

Examples:

- `Dark mode preference field` — deferred because it is a new feature, not refactor.
- `Fix incorrect tax rounding` — deferred because it is a bugfix and needs TDD/debugging flow.
- `Remove callback API` — deferred because public API migration needs explicit approval.

### Verification Evidence

Good evidence is exact:

```markdown
- `npm test -- orders/processOrder.test.ts`: PASS, 18 tests
- `npm run typecheck`: PASS
- Manual check: compared generated invoice JSON before/after; no diff
```

Weak evidence must be labeled:

```markdown
- Not run: no test command exists in repository.
- Remaining risk: behavior preservation based on code inspection only.
```
