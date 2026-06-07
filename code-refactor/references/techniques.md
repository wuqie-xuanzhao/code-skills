# Refactoring Techniques Reference

Use this reference when you know the smell and need a safe mechanical move. Keep each move small enough that one focused test command can validate it.

## Technique Template

For every technique:

1. Name the behavior boundary.
2. Make one mechanical change.
3. Run focused verification.
4. Continue only after green verification.

## Extraction Techniques

### Extract Function

**Use when**
- A function has a coherent block with a clear purpose.
- The block can be named by what it means, not how it works.

**Steps**
1. Identify input variables read by the block.
2. Identify output values written by the block.
3. Move the block into a new function with explicit parameters and return value.
4. Replace the block with a call.
5. Run tests that cover the original function.

**Safety check**
- The extracted function does not read hidden mutable state unless the original block did.
- Exceptions and early returns preserve original behavior.

### Extract Class or Module

**Use when**
- A group of functions/data changes together.
- A file contains multiple responsibility clusters.

**Steps**
1. Extract one responsibility cluster, not the whole file.
2. Keep the old public entry point delegating to the new class/module.
3. Move tests or add tests around the old entry point first.
4. Migrate internal calls gradually.

**Safety check**
- External import paths remain valid unless migration is explicitly approved.

### Extract Facade

**Use when**
- Callers know too much about subsystem internals.
- You need a stable public entry point before moving internals.

**Steps**
1. Add a narrow facade that calls existing implementation.
2. Point one caller at the facade.
3. Verify behavior.
4. Migrate remaining callers in small batches.

**Safety check**
- Facade translates errors and return values exactly as callers expect.

## Simplification Techniques

### Rename

**Use when**
- Names hide intent or preserve outdated concepts.

**Steps**
1. Rename one symbol at a time using language tooling when possible.
2. Update references.
3. Run typecheck/tests.

**Safety check**
- Do not rename external API fields, persisted keys, event names, or CLI flags without migration approval.

### Inline Function

**Use when**
- A function adds indirection without naming a useful concept.
- The abstraction has only one caller and obscures behavior.

**Steps**
1. Copy the function body into the caller.
2. Substitute parameters with arguments.
3. Remove the old function.
4. Run tests.

**Safety check**
- Preserve evaluation order, especially when arguments have side effects.

### Replace Nested Conditional with Guard Clauses

**Use when**
- Error or edge cases obscure the happy path.

**Steps**
1. List the original branch order.
2. Convert the first edge-case branch into an early return.
3. Verify.
4. Repeat one branch at a time.

**Safety check**
- Error precedence remains the same. If two invalid inputs previously returned error A before error B, keep that order unless approved.

### Decompose Conditional

**Use when**
- A condition mixes multiple business concepts.

**Steps**
1. Extract the predicate into a named boolean function.
2. Keep the expression identical at first.
3. Add tests for boundary cases if missing.
4. Simplify internals only after verification.

**Safety check**
- Do not change truthiness behavior for `0`, empty string, null, or undefined unless intended.

### Replace Magic Value with Named Constant

**Use when**
- Numeric or string literals encode a policy, timeout, status, permission, or threshold.

**Steps**
1. Add a constant near the policy owner.
2. Replace one cluster of equivalent literals.
3. Run tests.

**Safety check**
- Do not merge literals that happen to share a value but mean different things.

## Boundary Techniques

### Introduce Parameter Object

**Use when**
- Several parameters travel together.
- Call sites repeat the same argument cluster.

**Steps**
1. Create a typed object/interface for the cluster.
2. Add an overload/wrapper or migrate one internal caller.
3. Preserve the old public signature until callers are migrated or approval is given.

**Safety check**
- Required and optional fields are explicit.

### Move Function

**Use when**
- A function uses another module's data more than its current module's data.

**Steps**
1. Add the function to the target owner.
2. Delegate from the old location.
3. Move callers gradually.
4. Remove old delegate only after all callers migrate.

**Safety check**
- Avoid creating cycles; if a cycle appears, extract a shared lower-level dependency or invert the dependency.

### Isolate Side Effects

**Use when**
- Pure calculations are mixed with IO, mutation, logging, or network calls.

**Steps**
1. Extract pure calculation without changing IO.
2. Test pure calculation directly.
3. Keep orchestration responsible for side effects.

**Safety check**
- Side-effect order remains unchanged until explicitly tested.

### Split Query from Command

**Use when**
- A function both returns data and mutates state.

**Steps**
1. Identify the query part and command part.
2. Extract a pure query helper.
3. Keep the original command API delegating to both pieces.
4. Migrate internal use of the pure query only where safe.

**Safety check**
- Do not remove mutation from callers that relied on it.

### Introduce Seam

**Use when**
- Code is hard to test because dependencies are created internally.

**Steps**
1. Add optional dependency injection with the current dependency as default.
2. Keep runtime behavior identical.
3. Write tests using the seam.
4. Refactor internals behind the seam.

**Safety check**
- Defaults must preserve production behavior.

## Test and Baseline Techniques

### Characterization Test

**Use when**
- Existing behavior is unclear but must be preserved.

**Steps**
1. Pick representative inputs from current behavior.
2. Assert current outputs, errors, ordering, and side effects.
3. Watch the test pass before refactoring.
4. Refactor under that test.

**Safety check**
- Characterization tests document existing behavior, even if it looks odd. Do not "fix" behavior during refactor.

### Golden Master

**Use when**
- Output is broad, textual, serialized, or hard to assert field-by-field.

**Steps**
1. Capture current output for stable inputs.
2. Store it as a fixture or snapshot according to project conventions.
3. Compare post-refactor output exactly or with approved normalizers.

**Safety check**
- Normalize only unstable values such as timestamps or generated IDs.

### Performance Baseline

**Use when**
- Refactor claims performance improvement.

**Steps**
1. Define representative workload.
2. Measure current runtime, allocation, query count, or render count.
3. Add behavioral equivalence checks.
4. Implement one optimization.
5. Re-measure and compare.

**Safety check**
- Faster code with changed return shape, ordering, caching lifetime, or error behavior is not a refactor.

## Migration Techniques

### Compatibility Adapter

**Use when**
- Modernization changes the internal API but callers need stability.

**Steps**
1. Add new implementation behind old public signature.
2. Translate old inputs/outputs/errors through an adapter.
3. Migrate callers deliberately.
4. Remove adapter only after approval and complete migration.

**Safety check**
- Callback vs async/await migration must preserve sync/async timing and error delivery semantics where callers depend on them.

### Strangler Migration

**Use when**
- A large old subsystem cannot be safely replaced in one step.

**Steps**
1. Route one narrow use case through the new path.
2. Keep old path for all other cases.
3. Verify equivalence for the migrated case.
4. Expand coverage gradually.

**Safety check**
- Routing decisions must be explicit and observable in tests or logs.
