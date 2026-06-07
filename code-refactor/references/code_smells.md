# Code Smells Reference

Use this reference to decide whether a refactor is justified. A smell is not proof that code is wrong; it is evidence that future change, review, or testing may be harder than necessary.

## How to Use This Reference

For each suspected smell, record:

- **Symptom:** what you observed in code
- **Cost:** why it makes change harder
- **Direction:** what kind of refactor may help
- **Avoid:** what not to do

If you cannot name a smell or cost, do not refactor just because the code looks unfamiliar.

## Structural Smells

### Long Function

**Symptoms**
- Function mixes validation, transformation, IO, error handling, and formatting.
- You need to scroll to understand one branch.
- Local variables are reused across unrelated phases.

**Refactor direction**
- Extract functions by phase or decision.
- Split query code from command/side-effect code.
- Add characterization tests before extracting if behavior is unclear.

**Avoid**
- Extracting tiny helpers with vague names like `handleData`.
- Changing control flow and extraction in the same step.

### Large Module or God Object

**Symptoms**
- One file/class handles unrelated responsibilities.
- Changes for different reasons repeatedly touch the same file.
- Private helpers form clusters that do not interact.

**Refactor direction**
- Identify responsibility clusters.
- Extract modules/classes around stable boundaries.
- Keep the old public entry point as a facade until callers migrate.

**Avoid**
- Moving every function at once.
- Creating abstract layers before the concrete responsibility boundary is clear.

### Divergent Change

**Symptoms**
- A module changes for unrelated reasons: UI wording, persistence, validation, billing, logging.
- Review comments point to multiple responsibilities in one file.

**Refactor direction**
- Split by reason to change.
- Move policy decisions away from transport or formatting code.

**Avoid**
- Splitting by technical layer when the actual coupling is by business workflow.

### Shotgun Surgery

**Symptoms**
- One conceptual change requires edits across many files.
- Similar constants, conditionals, or mapping logic appear in several places.

**Refactor direction**
- Centralize the concept behind a single API.
- Introduce a parameter object, registry, strategy, or mapping table.

**Avoid**
- Adding another copy of the condition as a quick fix.

### Circular Dependency

**Symptoms**
- Modules import each other directly or through index barrels.
- Tests require awkward mocking because dependencies loop.

**Refactor direction**
- Extract shared types or ports.
- Introduce dependency inversion for the lower-level boundary.
- Move orchestration to a higher-level module.

**Avoid**
- Fixing cycles by hiding imports behind dynamic loading unless runtime behavior requires it.

## Logic Smells

### Duplicated Code

**Symptoms**
- Same validation, calculation, or mapping appears in multiple places.
- Copies differ by small constants or field names.

**Refactor direction**
- Extract shared function only after identifying the invariant.
- Use parameters or strategy for real variation.

**Avoid**
- Merging code that merely looks similar but has different business meaning.

### Nested Conditionals

**Symptoms**
- Arrow-shaped code with deep indentation.
- Error cases are mixed into happy path.
- Readers must track many negated conditions.

**Refactor direction**
- Use guard clauses.
- Decompose complex predicates into named functions.
- Consider strategy only when branches represent stable variants.

**Avoid**
- Reordering checks when order is externally observable.

### Primitive Obsession

**Symptoms**
- Strings/numbers represent domain concepts such as status, currency, IDs, email, or permissions.
- Same validation appears anywhere the primitive is accepted.

**Refactor direction**
- Introduce named types, enums, value objects, or validation boundaries.
- Start at module boundaries before changing all internals.

**Avoid**
- Changing serialized formats without approval.

### Long Parameter List

**Symptoms**
- Functions accept many related values.
- Call sites pass repeated clusters of arguments.
- Boolean flags make behavior unclear.

**Refactor direction**
- Introduce parameter object.
- Split commands when flags represent different operations.

**Avoid**
- Passing a giant untyped object that hides required fields.

### Feature Envy

**Symptoms**
- A function reads another object deeply and makes decisions from its internals.
- One module knows too much about another module's structure.

**Refactor direction**
- Move behavior closer to the data owner.
- Add a narrow method on the owned abstraction.

**Avoid**
- Exposing more getters to make the envy easier.

## Boundary Smells

### Leaky Abstraction

**Symptoms**
- Callers must know internal states, retries, storage details, or transport errors.
- Wrapper APIs expose implementation-specific options.

**Refactor direction**
- Introduce a facade or adapter.
- Translate internal errors into boundary-level results.

**Avoid**
- Hiding important failure modes; preserve error semantics.

### Stringly Typed Logic

**Symptoms**
- Behavior depends on ad hoc string keys or event names.
- Typos create runtime-only failures.

**Refactor direction**
- Introduce constants, enums, literal unions, or schema validation.

**Avoid**
- Renaming persisted or external string values without migration.

### Dead Code

**Symptoms**
- Unused imports, unreachable branches, commented-out implementations, obsolete flags.

**Refactor direction**
- Remove only after confirming no external reflection/config/runtime use.
- Prefer compiler/linter evidence and search evidence.

**Avoid**
- Deleting code that is externally invoked by convention.

### Speculative Generality

**Symptoms**
- Abstract base classes, factories, or configuration exist for one implementation.
- The code supports hypothetical variants no caller uses.

**Refactor direction**
- Inline unused abstraction.
- Keep extension points only where a real second case exists or is imminent.

**Avoid**
- Replacing one speculative abstraction with another pattern.

## Performance Smells

### Repeated Expensive Computation

**Symptoms**
- Same derived value is recalculated in loops or renders.
- Pure transformations repeat for unchanged inputs.

**Refactor direction**
- Cache within a safe lifetime.
- Precompute once per request/render/job.

**Avoid**
- Caching without invalidation rules.

### N+1 Query or Request Pattern

**Symptoms**
- Loop performs database queries or network calls per item.
- Runtime grows linearly with item count and latency.

**Refactor direction**
- Batch queries.
- Load related data in one call.
- Preserve ordering and missing-data semantics.

**Avoid**
- Returning a different shape or silently dropping partial failures.

### Avoidable Blocking IO

**Symptoms**
- Synchronous file/network work blocks request paths or UI paths.
- Slow IO happens under locks or transactions.

**Refactor direction**
- Move IO outside critical sections.
- Use async APIs where the environment supports them.

**Avoid**
- Changing concurrency behavior without tests.

### Unbounded Memory Growth

**Symptoms**
- Caches, arrays, listeners, or maps grow without eviction.
- Long-lived process accumulates per-request data.

**Refactor direction**
- Introduce bounded cache or cleanup lifecycle.
- Tie stored data to request/job lifetime.

**Avoid**
- Adding global mutable state as a quick optimization.
