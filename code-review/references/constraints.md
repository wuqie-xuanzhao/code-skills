# Code Review Constraints Reference

Machine-readable version: `constraints.json`

This document defines patterns that indicate incomplete, placeholder, or stub implementations. These patterns should be flagged during code review as they indicate code that is not production-ready.

## 1. Comment Placeholders

Markers left by developers (or AI) indicating work is not done. These should never ship to production.

| Pattern | Example |
|---------|---------|
| `TODO` | `// TODO: add error handling` |
| `FIXME` | `// FIXME: race condition here` |
| `XXX` | `# XXX temporary workaround` |
| `HACK` | `// HACK: bypass validation for now` |
| `TBD` | `// TBD: decide on cache strategy` |

**Rationale:** A TODO means someone acknowledged the code is incomplete but chose to skip it. In production this is a latent bug — the "later" never comes.

## 2. Unimplemented Code

Statements that explicitly mark code as not implemented. These crash or silently fail at runtime.

| Pattern | Language | Example |
|---------|----------|---------|
| `pass` | Python | `def authenticate(): pass` |
| `NotImplementedError` | Python | `raise NotImplementedError` |
| `todo!()` | Rust | `todo!("implement later")` |
| `unimplemented!()` | Rust | `unimplemented!()` |
| `panic!("TODO` | Rust | `panic!("TODO: implement")` |
| `throw new Error("not implemented")` | JS/TS | `throw new Error("not implemented")` |
| `return null // TODO` | JS/TS | `return null; // TODO: implement` |
| `new Error("stub")` | JS/TS | `throw new Error("stub")` |

**Rationale:** These are explicit admissions that code is missing. They cause crashes (throw/raise/panic) or silently return wrong values (return null).

## 3. Empty Control Structures

Function bodies or branches that contain no logic. Even without explicit markers, an empty body is a strong signal of incomplete work.

| Pattern | Example |
|---------|---------|
| Empty function body | `fn handler() {}` |
| Empty `if`/`else` branch | `if (condition) { /* nothing */ }` |
| Empty `catch` block | `catch (e) {}` (with no logging or rethrow) |
| `yield` without logic | `yield;` with no surrounding code |
| Single `return` | `return;` or `return null;` as entire function body |

**Exception:** Empty constructors, empty override stubs in frameworks that require them, and `pass` in Python abstract base classes are acceptable. Use judgment.

**Rationale:** An empty catch block silently swallows errors. An empty handler does nothing when it should do something. These are bugs waiting to happen.

## 4. Soft Markers

Words in comments or code that suggest temporary or placeholder status, even without explicit TODO/FIXME markers.

| Pattern | Example |
|---------|---------|
| `stub` | `// stub implementation` |
| `dummy` | `const dummyData = [...]` |
| `placeholder` | `// placeholder until API is ready` |
| `temporary` / `temp` | `// temporary fix` |
| `testing only` | `// testing only, remove before merge` |
| `hardcoded` (in prod paths) | `// hardcoded for now` |
| `hard code` | `// hard code this value` |

**Severity:** These are **warnings**, not failures. Some uses are legitimate (e.g., test fixtures named `dummy`, temporary CLI flags). Flag them for review but don't block on them automatically.

## 5. Severity Classification

| Category | Default Severity | Auto-block? |
|----------|-----------------|-------------|
| Comment placeholders | **major** | Yes — ship blocker |
| Unimplemented code | **critical** | Yes — will crash at runtime |
| Empty control structures | **major** | Yes — likely bug |
| Soft markers | **minor** | No — review and decide |

## 6. Building a Check Script

The `constraints.json` file in this directory provides all patterns in a machine-readable format. Example usage:

```bash
# Scan staged files for placeholder patterns
node scripts/check_constraints.mjs --diff HEAD

# Scan specific files
node scripts/check_constraints.mjs src/**/*.ts

# Output GitHub Actions format
node scripts/check_constraints.mjs --github-actions
```

A check script reads `constraints.json`, applies each rule's regex patterns to source files, and reports matches. Each rule specifies:
- `id`: unique identifier
- `category`: one of the 4 categories above
- `severity`: critical / major / minor
- `patterns`: array of `{ regex, languages, flags }` objects
- `message`: human-readable explanation to show on match
