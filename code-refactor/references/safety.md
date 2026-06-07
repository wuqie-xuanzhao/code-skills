# Refactor Safety Reference

Refactoring is safe only when you can prove the important behavior stayed the same. This reference defines what counts as behavior, how to protect it, and when to stop.

## Behavior Preservation

External behavior includes more than return values. Inventory the relevant items before editing:

- Public function/class/module signatures
- Return shape, ordering, nullability, and default values
- Error types, messages, codes, and timing
- Logs, metrics, events, and telemetry that users or systems consume
- Database schema, persisted values, config keys, environment variables
- API routes, request/response fields, status codes, headers
- Authorization, authentication, and permission checks
- UI-visible text, layout-affecting data, accessibility attributes
- File names, generated output, CLI flags, exit codes
- Performance characteristics when the task is performance-preserving

If an item must change, the task is no longer pure refactor. Ask for explicit approval and route to the appropriate flow.

## Safety Net Levels

Choose the minimum level that matches risk.

| Risk | Examples | Required Safety |
|------|----------|-----------------|
| Low | rename private helper, extract pure block | focused tests or typecheck/lint |
| Medium | split function with branches, move internal logic | characterization tests for affected behavior |
| High | public API boundary, persistence, money, auth, concurrency | tests + review findings + staged plan + rollback point |
| Performance | caching, batching, async changes | behavior tests + performance/query/render baseline |
| Modernization | callback to async, framework API migration | compatibility tests + adapter or staged migration |

## Characterization Tests

Use characterization tests when existing behavior is unclear or under-tested.

A good characterization test captures:

- Representative valid input
- Edge input
- Error behavior
- Ordering or timing if callers rely on it
- Side effects such as writes, emitted events, logs, or calls

These tests describe current behavior. Do not "correct" surprising behavior during refactor.

## Golden Master

Use golden master when output is broad or complex:

- Rendered HTML/text
- Serialized JSON/XML/CSV
- Generated files
- CLI output
- Large transformation output

Rules:

1. Capture stable inputs.
2. Normalize only values known to be unstable, such as timestamps or random IDs.
3. Compare old and new output.
4. Treat any unexplained difference as a behavior change.

## Performance Refactor Safety

Before performance work:

1. Name the performance smell: repeated work, N+1, blocking IO, memory growth, excessive renders.
2. Define the workload.
3. Record baseline: runtime, query count, allocation, render count, request count, or other relevant metric.
4. Record behavior baseline: output shape, ordering, errors, cache invalidation expectations.

After performance work:

- Report both metric change and behavior verification.
- If performance improves by changing semantics, say it is not a refactor.
- Cache only when invalidation/lifetime is clear.

## Modernization Migration Safety

Modernization often hides behavior changes. Protect these boundaries:

- Callback vs promise timing
- Error delivery: thrown, callback error, rejected promise, result object
- Cancellation behavior
- Retry behavior
- Framework lifecycle hooks
- Deprecated API quirks callers may rely on
- Public import paths

Prefer staged migration:

1. Characterize old public contract.
2. Add modern implementation behind an adapter.
3. Keep old public entry point stable.
4. Migrate internal callers.
5. Request approval before removing compatibility.

## Rollback Points

For multi-step refactors, define rollback points:

- Before first edit: current tests/lint status
- After each independent extraction or move
- Before public boundary changes
- Before deleting old code

A rollback point is valid only if verification is green at that point.

## No-Go Situations

Stop and ask before editing when:

- The user wants a feature mixed into the refactor.
- The requested change fixes incorrect behavior.
- No behavior boundary can be named.
- Critical code has no tests and the requested change is broad.
- Public API, schema, auth, permission, or persisted data shape would change.
- You cannot run or define any verification.
- You need to rewrite a subsystem rather than refactor it step by step.

## Red Flags During Implementation

These thoughts mean the refactor is drifting:

| Thought | Reality |
|---------|---------|
| "I'll add this small feature while I'm here" | That is scope mixing; defer it |
| "This bug is obvious, I'll fix it too" | That is a bugfix; switch to debugging/TDD |
| "Tests are missing, but the change is mechanical" | Mechanical changes still break behavior |
| "I'll update all callers at once" | Big-bang migration removes rollback points |
| "The new API is better, so behavior differences are acceptable" | That is a behavior change |
| "This pattern is cleaner" | Patterns need a named smell and safety proof |
| "I'll verify at the end" | Refactor safety comes from small-step verification |

## Verification Evidence

Report exact evidence, not confidence language.

Good:

```markdown
## Verification Evidence

- `npm test -- orders/processOrder.test.ts`: PASS, 18 tests
- `npm run typecheck`: PASS
- Behavior boundary checked: order validation errors, pricing totals, inventory update calls
```

Bad:

```markdown
Looks safe. The code is cleaner and should behave the same.
```

If verification was skipped:

```markdown
## Verification Evidence

- Not run: project has no test command in package scripts.
- Remaining risk: pricing edge cases were preserved by code inspection only, not executable tests.
- Recommended next step: add characterization tests for discount tiers before further extraction.
```

## Completion Gate

Do not say refactor is complete unless you can state:

1. What smell/finding was addressed.
2. What behavior boundary was preserved.
3. What verification ran and what it returned.
4. What was explicitly deferred.
