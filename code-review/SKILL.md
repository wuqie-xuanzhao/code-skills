---
name: code-review
description: Systematic AI-assisted code review that produces structured, evidence-based review reports. Trigger when the user says "review this", "review my changes", "check this PR", "code review", "look at this code", "is this code good".
---

# Code Review

## Overview

Code review is a safety net — catching bugs before they ship and raising the team's collective code quality. But a good review is more than "find bugs": it verifies intent, checks assumptions, and documents the reasoning so the next reader understands *why* the code is correct.

This skill produces structured review reports. By default the report is delivered in the conversation. Only write to file (`docs/superpowers/reviews/`) when the user explicitly asks to save/archive the report.

This skill is solely responsible for reviewing "what the code does and whether it's correct." If the user's intent is different (exploring architecture → `code-explore`, fixing bugs → debugging skill, planning changes → writing-plans), let the user choose the appropriate skill.

## When to Use

**Should use:**
- Before merging a PR or feature branch
- After implementing a feature or bugfix — verify before claiming done
- User asks "is this code good?" or "can you review this?"
- Periodic quality audit of a module or subsystem
- Onboarding: review a module to establish quality baselines

**Not applicable:**
- User wants to explore architecture without judgment → use `code-explore`
- User already knows the bug and wants to fix it → use debugging skill
- User wants to plan a new feature → use writing-plans skill
- User wants to refactor → use refactor skill

## Three Review Types

| Type | Use When |
|------|----------|
| **quick** | Small change (< 200 lines), single-file or tightly scoped, low risk |
| **standard** | Feature-level change, multi-file, moderate complexity |
| **deep** | Critical path change, security-sensitive, large refactor, or pre-release |

Output differences by type:
- `quick`: Summary + findings table only; no detailed sections unless a critical finding needs explanation
- `standard`: Summary + findings table + detailed findings + positive notes
- `deep`: Full report including cross-file analysis, security section, and recommendations for process improvement

## Workflow

### Phase 1: Scope & Context

Establish what's under review and why:

1. **Identify the target** — diff, branch, PR, specific files, or directory
2. **Understand intent** — read PR description, commit messages, or ask the user: "What is this change trying to achieve?"
3. **Establish baseline** — what was the code like before? What invariants existed?

Ask at most two questions:
1. "What's the main goal of this change?"
2. "Any specific areas you're worried about?"

If the user's description is already clear, proceed directly to Phase 2.

#### Suggest Review Type

Based on scope, suggest the review type and let the user confirm or override:

- **quick** — diff < 200 lines, single-file or tightly scoped, low risk
- **standard** — multi-file feature change, moderate complexity
- **deep** — critical path, security-sensitive, large refactor, or pre-release

If the diff clearly maps to one type, state it briefly: "This looks like a quick review — confirm?" If ambiguous, ask.

#### Load Existing Context

Before reading code from scratch, check `docs/superpowers/explore/` for exploration reports whose `scope` overlaps with the review target. If found, load them as background context to avoid redundant code reading. Reference them in the report's "Review Scope" section.

### Phase 2: Read the Code

#### Reading Strategy

Read in this order:

1. **Diff first** — understand what changed and why
2. **Enclosing functions** — bugs in unchanged lines of a touched function are in scope
3. **Callers and callees** — does the change break or assume anything about how the function is called?
4. **Tests** — do existing tests cover the changed behavior? Are new tests needed?

#### Tool Selection Priority

1. **Diff / git tools** — see what changed, not what exists
2. **Code graph / index** — trace callers, callees, and impact
3. **Read source** — confirm suspicious patterns with actual code
4. **Grep / Glob** — find patterns across the codebase

> Most coding agents expose equivalent tools — use whatever yours provides. The category is what matters, not the tool name:
>
> | Category | Claude Code | Cursor | Cline | Aider | omp | Codex |
> |----------|-------------|--------|-------|-------|-----|-------|
> | 1. Diff / git | `Bash` (git diff) | `@terminal` / run git diff | `execute_command` | `/diff` | `bash` + `read pr://` | `shell` (git diff) |
> | 2. Code graph / index | codegraph MCP | `@codebase` | `search_files` | repo map (auto) | `lsp` + `ast_grep` | `shell` (ctags/grep) |
> | 3. Read source | `Read` | open file / `@file` | `read_file` | `/add` | `read` | `read_file` |
> | 4. Search | `Grep` / `Glob` | Find in files | `search_files` | `/search` | `search` + `find` | `shell` (grep/find) |

#### Impact Scope Mapping

Before reading code in detail, map the blast radius of the change. This is critical for AI-generated code where local correctness can mask global breakage.

1. **List every touched module/directory** — not just files, but the subsystem they belong to
2. **Identify exported interfaces** — any changed function, type, or constant that other modules import
3. **Check data shape changes** — database columns, API response fields, config keys, environment variables
4. **Trace the call chain** — who calls the changed code? What depends on its output?

Write a short impact scope note (3–5 lines). This note becomes the "Review Scope" section of the report and guides where to focus deeper review.

Why this matters: AI-generated code often looks correct in isolation but breaks hidden constraints — an internal helper's behavior change ripples through 15 callers, or a return type change breaks a downstream serializer that nobody remembered. Mapping scope first prevents tunnel vision.

### Phase 3: Multi-Angle Review

Run these review angles. Each angle may surface findings independently — do NOT let one angle's conclusions suppress another's.

#### Angle 1: Correctness

For every changed line, ask: what input, state, timing, or platform makes this wrong?

- Inverted / wrong conditions, off-by-one errors
- Null / undefined dereference
- Missing `await`, unhandled promises
- Wrong-variable copy-paste
- Error swallowed in catch block
- Edge cases: empty input, max values, concurrent access

#### Angle 2: Removed Behavior

For every deleted or replaced line, name the invariant it enforced. Search the new code: is that invariant re-established? If not, that's a finding.

- Removed guards or validations
- Dropped error paths
- Narrowed type constraints
- Deleted tests that covered real cases

#### Angle 3: Cross-File Impact

For each changed function, check callers and callees:

- New preconditions not satisfied by existing callers
- Changed return shape breaking consumers
- New exceptions not caught upstream
- Timing / ordering dependencies introduced

#### Angle 4: Language & Framework Pitfalls

Scan for classic pitfalls of the diff's language and framework:

- JS: falsy-zero, `==` coercion, closure-captured loop var, floating point equality
- Python: mutable default args, late-binding closures, `is` vs `==`
- Go: nil-map write, range-var capture, goroutine leaks
- SQL: injection, missing parameterization
- General: timezone/DST drift, race conditions, resource leaks

#### Angle 5: Quality & Maintainability

Flag issues that make the code harder to understand, modify, or test:

- Re-implements existing utility — should call what's already there
- Unnecessary complexity: derivable state, deep nesting, dead code
- Copy-paste with slight variation — extract shared logic
- Missing or misleading comments
- Poor naming that obscures intent

#### Angle 6: Security (when applicable)

Only when the change touches: auth, input handling, data storage, network communication, or configuration.

- Input validation gaps
- Authentication / authorization bypass
- Sensitive data exposure
- Injection vectors
- Insecure defaults

#### Angle 7: Regression Verification

This angle is what separates "the new code works" from "the old stuff still works too." For AI-generated changes this is the most critical angle — AI can satisfy the immediate requirement while silently breaking existing behavior.

Run these checks systematically:

**a) Test execution & gaps**
- Run the existing test suite. Report: pass / fail / skip counts
- If any test fails, investigate: did this change break it, or was it already broken?
- Identify changed behavior that lacks test coverage — list each as a regression risk
- For bugfix PRs: is there a test that reproduces the original bug? If not, write one before reviewing

**b) Interface & contract compatibility**
- Changed function signatures → do all callers still compile / work?
- Changed return types or shapes → do consumers handle the new shape correctly?
- Changed error codes or exception types → are catch blocks upstream still correct?
- New required parameters → do existing call sites provide them?
- Changed API endpoints → check for breaking changes in path, method, headers, body schema

**c) Data compatibility**
- Database schema changes → are migrations reversible? Does historical data still work?
- Changed config keys or env vars → do existing deployments break?
- Changed file formats or serialization → can old data still be read?

**d) Performance regression**
- New loops inside hot paths → N+1 queries, O(n²) where O(n) existed
- Removed caching or memoization
- Larger payloads or responses
- New blocking calls in async contexts

**e) Behavioral side effects**
- Does the change alter logging, metrics, or observability? (Silent regression: monitoring stops catching issues)
- Does the change modify default behavior that other code implicitly depends on?
- Does the change introduce new ordering or timing dependencies?

Record each regression risk as a finding with severity `major` (if likely to break production) or `minor` (if it's a latent risk). Risks that have been verified as safe (test passes, manual check done) go in the "Verification Checklist" section, not in findings.

### Phase 4: Classify & Prioritize

Classify each finding by severity:

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| **critical** | Will cause bugs, crashes, or security issues in production | Must fix before merge |
| **major** | Likely to cause issues under real conditions; broken edge case | Should fix before merge |
| **minor** | Code smell, suboptimal pattern, or maintainability concern | Fix when convenient |
| **suggestion** | Style preference, naming improvement, or optional enhancement | Consider, not blocking |

**Rules:**
- When uncertain between two levels, classify UP (err on the side of surfacing)
- Every finding MUST include `file:line` evidence
- Every finding MUST include a concrete failure scenario (what input/state triggers the problem)
- Suggestions without `file:line` evidence are allowed but must be labeled as subjective

### Phase 5: Write the Report

- **Summary first** — 2–3 sentences: what was reviewed, overall assessment, key risk
- **Findings table** — all findings ranked by severity
- **Detailed findings** — one subsection per finding with evidence and fix suggestion
- **Regression risk** — list of existing behaviors, interfaces, or data that could be broken by this change; tag each as verified or unverified
- **Verification checklist** — what was checked: tests run (with results), manual verification done, gaps remaining
- **Positive notes** — call out good patterns, clever solutions, well-structured code
- **Recommendations** — process or architectural suggestions (not individual fixes)

Draft the complete report. Self-check against exit conditions.

**Language & Format:**

- **Language:** The report MUST be written in the same language the user is communicating in. If the user speaks Chinese, write in Chinese. If English, write in English. Follow the user's language throughout — headings, findings, evidence, and recommendations all match the user's language.
- **Format:** Default is Markdown (`.md`). The user may request HTML format (`.html`) instead. When HTML is requested:
  - Use a polished, professional stylesheet — not a bare Markdown-to-HTML conversion. The HTML output should look distinctly different from the Markdown source: richer typography, purposeful color, and visual hierarchy.
  - Leverage HTML-specific capabilities: collapsible `<details>` for detailed findings, color-coded severity badges (🔴 critical, 🟠 major, 🟡 minor, 🔵 suggestion), a floating table of contents, styled callout boxes for critical findings vs. minor notes, and syntax-highlighted code blocks with line-number anchors.
  - Keep the same section structure as the Markdown template — HTML is presentation, not restructuring.
  - Include inline `<style>` CSS so the document is self-contained and portable.

### Phase 6: Deliver & Iterate

- Present the report to the user
- Discuss findings the user disagrees with — explain the reasoning, but accept their judgment on domain-specific tradeoffs
- Revise if new information comes up during discussion
- Only archive to `docs/superpowers/reviews/` if the user explicitly asks to save the report

## Anti-Patterns

| Anti-Pattern | Why It's Wrong |
|-------------|----------------|
| Reviewing without reading the diff | Only reviewing new code misses removed behavior |
| Findings without `file:line` | Reader cannot verify or locate the issue |
| Only hunting bugs | Missing quality and maintainability issues leads to tech debt |
| Nitpicking style over substance | Formatting opinions waste review time; focus on correctness first |
| No positive feedback | Demoralizing; good patterns deserve recognition |
| Reviewing your own code | Confirmation bias blinds you to your own mistakes |
| Vague findings ("this is bad") | Every finding must explain WHY and HOW to fix |
| Ignoring test coverage | Untested code is unverified code — flag it |
| Not running tests before reviewing | You're reviewing blind — run the suite first |
| Only checking new code works | The #1 AI coding risk: "new works, old breaks" |
| Skipping impact scope mapping | Tunnel vision on the diff misses downstream breakage |
| Assuming tests = verified | Tests may not cover the changed paths — check coverage, not just green/red |

## References

- `references/template.md` — report format, section writing guidelines, severity decision tree
- `references/template.html` — full HTML example with inline CSS, collapsible findings, color-coded severity badges, floating TOC, and styled callout boxes

## Exit Conditions

Before marking the review as complete:

- [ ] Review scope and intent clearly established
- [ ] Impact scope mapped: affected modules, interfaces, data shapes identified
- [ ] All changed files and enclosing functions read
- [ ] Cross-file impact analyzed (callers / callees)
- [ ] Existing test suite run; failures investigated
- [ ] Regression risks identified and tagged (verified / unverified)
- [ ] Each finding has `file:line` evidence and concrete failure scenario
- [ ] Findings classified by severity
- [ ] Report includes summary, findings, regression risk, verification checklist, positive notes, and recommendations
- [ ] Frontmatter includes `commit` (VCS hash of the reviewed state)
- [ ] Critical and major findings have clear fix suggestions
- [ ] Report delivered and discussed with the user

## Final Rules

```
Read the diff — review what changed, not just what exists
Every finding needs evidence — file:line or it didn't happen
Severity is honest — don't downgrade to avoid confrontation
Catch bugs over style — correctness always outranks formatting
Verify, don't assume — run tests, check callers, confirm data compatibility
No rubber stamp — if there's nothing to say, say why it's good
```

No exceptions without your human collaborator's approval.
