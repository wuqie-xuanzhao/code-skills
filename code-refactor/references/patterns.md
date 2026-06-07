# Refactoring Patterns Reference

Use patterns only when a concrete smell needs a stronger boundary than a local technique can provide. A pattern is a cost: it adds names, files, and concepts. Pay that cost only when it removes a larger cost.

## Pattern Selection Rule

Before introducing a pattern, answer:

1. Which smell or review finding does this pattern address?
2. Why is a simpler technique insufficient?
3. Which public behavior must remain unchanged?
4. How will tests prove the migration is equivalent?

If any answer is missing, do not introduce the pattern yet.

## Behavioral Variation Patterns

### Strategy

**Use when**
- Conditional branches represent stable interchangeable algorithms.
- New variants are likely and should not edit a central switch repeatedly.

**Do not use when**
- There are only two small branches with no expected growth.
- Branches are simple data mapping.

**Refactor path**
1. Extract each branch body into a named function first.
2. Introduce a shared interface only after branch inputs/outputs match.
3. Keep the old dispatcher delegating to strategies.
4. Verify each variant with existing behavior tests.

### Command

**Use when**
- Operations need queuing, retry, undo, audit, or consistent execution handling.
- A large handler has many action branches with similar lifecycle.

**Do not use when**
- The operation is a direct function call with no lifecycle concerns.

**Refactor path**
1. Extract one action into a command object/function.
2. Keep the old handler as dispatcher.
3. Migrate actions one at a time.
4. Verify error and logging behavior per action.

### Pipeline

**Use when**
- Data goes through a clear sequence of transformations.
- Stages can be named and tested independently.

**Do not use when**
- Steps have complex bidirectional state dependencies.
- The current flow is small and readable.

**Refactor path**
1. Extract pure stages first.
2. Preserve stage order.
3. Add tests for intermediate edge cases only if they are stable concepts.
4. Keep orchestration explicit.

## Boundary Patterns

### Adapter

**Use when**
- You need to fit a new API or library behind an old interface.
- Modernization should not force all callers to change at once.

**Do not use when**
- You are free to change all callers and the interface is internal.

**Refactor path**
1. Define the old contract in tests.
2. Implement adapter translating old contract to new implementation.
3. Migrate internals behind the adapter.
4. Keep error and timing semantics compatible.

### Facade

**Use when**
- Callers know too much about subsystem internals.
- You need a stable entry point before splitting modules.

**Do not use when**
- It would simply rename one function without hiding complexity.

**Refactor path**
1. Add facade over current subsystem.
2. Migrate one caller.
3. Move internal pieces behind facade.
4. Keep facade small and intention-revealing.

### Repository or Service Boundary

**Use when**
- Persistence, API access, or external service calls are scattered across business logic.
- Tests are hard because storage/network concerns are mixed into policy.

**Do not use when**
- The module is already a thin integration layer.

**Refactor path**
1. Identify operations the domain actually needs.
2. Extract a narrow port/interface.
3. Move persistence/service code behind it.
4. Keep transactions and error semantics explicit.

### Dependency Inversion

**Use when**
- High-level policy imports low-level details directly.
- Circular dependencies block testing or modularization.

**Do not use when**
- A simple function parameter or local seam is enough.

**Refactor path**
1. Extract the minimal interface the high-level code needs.
2. Pass implementation from composition root or caller.
3. Remove direct import from high-level policy.
4. Verify production defaults still use the same low-level implementation.

## Construction Patterns

### Factory

**Use when**
- Object creation has meaningful policy, validation, environment choice, or dependency wiring.
- Call sites duplicate construction details.

**Do not use when**
- Constructor call is simple and clear.

**Refactor path**
1. Extract repeated construction into a function first.
2. Name the factory after the policy it enforces.
3. Keep defaults identical.

### Builder

**Use when**
- Construction has many optional fields and readable call sites matter.
- Test data setup is noisy and error-prone.

**Do not use when**
- A typed parameter object is enough.

**Refactor path**
1. Introduce builder in tests or internal construction first.
2. Preserve validation rules from the original constructor/API.
3. Avoid using builder to bypass required fields.

## Error and Absence Patterns

### Result Type / Explicit Error Boundary

**Use when**
- Error handling is inconsistent: sometimes throws, sometimes returns null, sometimes logs.
- Callers need to handle recoverable failures explicitly.

**Do not use when**
- Existing public API promises thrown exceptions and callers rely on them.

**Refactor path**
1. Define current error behavior with tests.
2. Introduce result type internally.
3. Translate result back to old public behavior at the boundary.
4. Migrate public API only with approval.

### Null Object

**Use when**
- Many callers repeat the same default behavior for absence.
- Absence has a safe, domain-meaningful default behavior.

**Do not use when**
- Missing data should be visible as an error.
- A default object could hide data corruption or authorization failures.

**Refactor path**
1. Capture current null handling behavior in tests.
2. Introduce null object for one boundary.
3. Replace repeated checks gradually.
4. Keep logging/metrics for unexpected absence if existing behavior had it.

## Composition Patterns

### Composition over Inheritance

**Use when**
- Subclasses override small pieces of behavior and inherit unrelated state.
- Base class changes are risky because they affect many subclasses.

**Do not use when**
- The inheritance hierarchy represents a stable framework contract.

**Refactor path**
1. Extract the varying behavior into a collaborator.
2. Pass collaborator into the existing class.
3. Move one subclass behavior at a time.
4. Keep public class names stable until migration is approved.

### Policy Object

**Use when**
- Business rules are mixed into orchestration or IO code.
- Rules need independent tests and names.

**Do not use when**
- The rule is a one-line local condition with no reuse or complexity.

**Refactor path**
1. Extract current rule exactly.
2. Test edge cases around the policy.
3. Replace inline rule with policy object/function.
4. Keep orchestration free of policy details.

## Anti-Pattern: Pattern Shopping

Do not introduce patterns because they sound professional. Introduce the smallest structure that removes the named smell while preserving behavior. If a rename or extracted function solves the problem, stop there.
