# Review Report Reference Template

This file provides the frontmatter, body structure, and writing guidelines used by `code-review`.

## 1. Frontmatter

```yaml
---
type: quick | standard | deep
date: YYYY-MM-DD
status: active | outdated
scope: {branch/PR/description}
commit: <short hash or tag>
reviewer: AI-assisted
---
```

- `commit`: short VCS hash (e.g. git `abc1234`) or tag of the reviewed codebase state. Readers can check whether the code has since changed. Use `HEAD` when reviewing uncommitted changes
- `status: outdated` when the reviewed code has been significantly changed since the review
- `scope` describes what was reviewed (branch name, PR number, or description)
- When updating an existing review, append `updated: YYYY-MM-DD`

Filename: `docs/superpowers/reviews/YYYY-MM-DD-{descriptive-slug}.md`.

## 2. Body Structure

```markdown
## Summary

<!-- 2–3 sentences: what was reviewed, overall assessment, key risk -->

## Findings

| # | Severity | Summary | Location |
|---|----------|---------|----------|
| 1 | critical | {one-sentence finding} | `file:line` |

## Detailed Findings

### Finding 1: {title}

- **Severity:** critical / major / minor / suggestion
- **Location:** `file:line`
- **Problem:** {what's wrong}
- **Evidence:** {actual code that demonstrates the issue}
- **Failure scenario:** {concrete inputs/state → wrong output/crash}
- **Fix:** {how to fix it}

## Positive Notes

<!-- Call out good patterns, clever solutions, well-structured code -->

## Recommendations

<!-- Process or architectural suggestions, not individual fixes -->

## Review Scope

- Scope: {what was reviewed}
- Files changed: {count} files, {count} lines
- Skipped: {what was not reviewed and why}
```

## 3. Section Writing Guidelines

### Summary (Most Important)

- 2–3 sentences maximum
- State: what was reviewed → overall assessment → biggest risk
- The reader should understand the review's conclusion from this section alone

Example:
```markdown
## Summary

Reviewed PR #42 (add user authentication flow, 12 files, 340 lines changed).
Overall the implementation is solid — auth logic follows established patterns
and edge cases are well-handled. **One critical finding**: the session token
is stored in localStorage without expiry validation, creating a session hijack
risk on shared devices.
```

### Findings Table

- Every finding ranked by severity (critical → major → minor → suggestion)
- Summary is one sentence — save details for the detailed findings section
- Location must be `file:line` format

Example:
```markdown
## Findings

| # | Severity | Summary | Location |
|---|----------|---------|----------|
| 1 | critical | Session token stored in localStorage without expiry check | `auth/session.ts:47` |
| 2 | major | Race condition in concurrent login — second request overwrites first session | `auth/handler.ts:89` |
| 3 | minor | `validateToken` re-decodes JWT on every call instead of caching | `auth/jwt.ts:23` |
| 4 | suggestion | Consider extracting the retry loop into a shared utility | `auth/oauth.ts:156` |
```

### Detailed Findings

- One subsection per finding
- Every field must be filled (except Fix for suggestions which are optional)
- Evidence quotes actual code from the file
- Failure scenario is concrete: "when X happens, Y goes wrong"

Example:
```markdown
### Finding 1: Session Token Without Expiry Validation

- **Severity:** critical
- **Location:** `auth/session.ts:47`
- **Problem:** The session token is stored in `localStorage` but its expiry is never
  checked on page load. An expired or revoked token remains usable until the user
  explicitly logs out.
- **Evidence:**
  ```typescript
  // auth/session.ts:47
  localStorage.setItem('session_token', token);
  // No expiry check anywhere in the file
  ```
- **Failure scenario:** User logs in on a shared computer → admin revokes the token
  → user closes browser → next person opens the browser → token is still in
  localStorage → the revoked session is silently restored.
- **Fix:** Store the token's `expires_at` alongside it, and check on every page load:
  ```typescript
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  if (Date.now() > session.expires_at) {
    localStorage.removeItem('session');
    redirectToLogin();
  }
  ```
```

### Positive Notes

- Genuine appreciation, not filler
- Call out specific patterns or decisions that are good
- Helps balance the review and maintain team morale

Example:
```markdown
## Positive Notes

- **Error handling pattern**: The centralized error handler in `errors/index.ts` with
  typed error classes is clean and extensible — adding new error types is trivial.
- **Test coverage**: The auth flow has 94% coverage with meaningful edge case tests
  (expired tokens, concurrent requests, malformed JWT). This is above the project average.
- **Type safety**: Using discriminated unions for auth state (`AuthState | UnauthState`)
  eliminates an entire class of null-check bugs at compile time.
```

### Recommendations

- Process or architectural suggestions, not individual fixes
- Each recommendation should prevent a class of issues, not just one instance
- Optional — skip if the review doesn't surface any systemic patterns

Example:
```markdown
## Recommendations

1. **Add a `session-expiry` linter rule**: Since the session token issue is a pattern
   that could recur, consider adding a linter check that flags `localStorage.set` calls
   without an accompanying expiry field.
2. **Shared retry utility**: Finding 4 is the third place we've seen a hand-rolled retry
   loop. Consider extracting it into `utils/retry.ts` with configurable backoff.
```

### Review Scope

- Clearly state what was and wasn't reviewed
- Let the reader know the boundaries of the review

Example:
```markdown
## Review Scope

- Scope: PR #42 — user authentication flow
- Files changed: 12 files, 340 lines (+287 / -53)
- Skipped: `vendor/` directory (third-party code), `auth/migrations/` (database schema
  changes reviewed separately by DBA)
```

## 4. Finding Severity Decision Tree

```
Does it cause crashes, data loss, or security issues?
├── Yes → critical
└── No
    Does it produce wrong results or break edge cases?
    ├── Yes → major
    └── No
        Does it make code harder to maintain or understand?
        ├── Yes → minor
        └── No
            Is it a style or naming improvement?
            └── Yes → suggestion
```

## 5. Anti-Pattern Reference

| Anti-Pattern | Correct Approach |
|-------------|-----------------|
| Finding without `file:line` | Every finding must have a specific location |
| Finding without failure scenario | Must describe concrete inputs/state that trigger the problem |
| Vague severity | Use the decision tree above |
| Only negative findings | Include positive notes — good code deserves recognition |
| Finding duplicates existing finding | Merge into one with combined evidence |
| Reviewing removed code as if it's new | Read the diff first — understand what was deleted and why |
| Suggestion presented as critical | Keep subjective opinions at suggestion level |
