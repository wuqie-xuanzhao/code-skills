---
name: code-explore
description: |
  Directed code exploration that produces evidence-based, searchable reports following an "ask → read → conclude" workflow.
  Use this skill whenever the user wants to understand code, investigate a question about the codebase, or explore before making changes.
  Trigger phrases: "explore first", "how does X work", "understand this module", "investigate X", "explore the codebase",
  "look into X", "quickly understand", "map this module", "what does X do", "trace the flow of X",
  "这个模块怎么工作的", "探索一下", "看看这段代码", "调查一下", "理解这个模块", "分析一下流程",
  "feature research", "feasibility check", "are there similar products", "方案调研", "技术选型",
  "archive exploration results", "document what was observed".
  Also use when the user asks a question about code that requires reading multiple files to answer — don't just guess, explore and produce evidence.
---

# Code Exploration

## Overview

The same question takes two hours to investigate the first time, but should be answerable in five minutes the second time — provided the first investigation left documented evidence.

code-explore captures "question → code reading → conclusion" into searchable exploration reports, stored in `docs/superpowers/explore/`.

This skill is solely responsible for evidence-based recording of "what was observed." If the user's intent is different (decision-making / prescription / bug fixing), let the user choose the appropriate skill.

## When to Use

**Should use:**
- Onboarding: quickly understand module boundaries, call chains, and entry points
- User asks a specific question but doesn't yet require a solution or fix
- Before feature design or bug analysis, do a round of evidence-based exploration first
- Technical direction still under discussion, need a lightweight spike (explore only, no decisions)

**Not applicable:**
- User already knows what to do and has a clear implementation plan → execute directly
- User wants to fix a bug → exploration helps locate issues, but the goal is fixing, not documenting
- User wants a new feature → exploration helps design, but the output is a plan/spec, not an explore document

## Four Exploration Types

| Type | Use When |
|------|----------|
| **question** | Investigate a specific question in the codebase and give a conclusion |
| **module-overview** | Quickly map a module's structure, boundaries, entry points, and dependencies |
| **spike** | Lightweight technical investigation of multiple possible directions (no final decision) |
| **feature-research** | Feasibility and approach investigation for a NEW feature, including market/competitive research |

Output format differences by type:
- `question`: Quick-answer directly answers the question; key evidence supports the answer with code references; Mermaid diagrams generally unnecessary (unless cross-module call chains benefit from one)
- `module-overview`: Quick-answer includes a Mermaid architecture diagram; key evidence covers entry points, core flows, and boundaries
- `spike`: Quick-answer includes a Mermaid multi-option comparison diagram; key evidence grouped by option; conclusions only state "feasible / infeasible / risky", don't choose for the user
- `feature-research`: Quick-answer includes feasibility verdict + competitive landscape summary + recommended approach; key evidence grouped by product/solution found; Mermaid comparison diagram of approaches/products is mandatory; web-sourced findings classified by confidence level

## Workflow

### Phase 1: Narrow the Exploration Question

At most two questions:

1. "What is the single most important question you want answered first?"
2. "Which module / directory should we focus on?"

If the user's description is already clear, proceed directly to Phase 1.5.

### Phase 1.5: Check for Overlap & Intent Routing

Match against existing documents in `docs/superpowers/explore/`:

- Match by filename keywords
- Match by frontmatter fields (`type`, `status`, `confidence`, `scope`)
- Match by heading / content keywords

When an old document is found, determine the current intent:

- **New**: No old document found, or found but marked `status: outdated` → proceed to Phase 2 for normal exploration
- **Update**: Old document still in scope, code hasn't changed much, only supplementing evidence or correcting local conclusions → read old document → supplement evidence → write back to original file, append `updated: YYYY-MM-DD` to frontmatter
- **Replace**: Old document's core conclusions invalidated by code changes → mark old document `status: outdated` + `superseded-by: <new filename>` → create replacement document

Trigger phrases: user says "explore again", "re-check", "update that previous explore", "has X changed since last time".

### Phase 2: Evidence-Based Exploration

#### Tool Selection Priority

When exploring code, select tools in this priority order:

1. **Code graph / index first** — locate symbols, trace call chains. An order of magnitude faster than text search, and can trace dynamic dispatch and callbacks.
2. **Bulk scanning second** — search across multiple directories / naming conventions at scale, collecting an overview rather than full text.
3. **Source code close reading fallback** — key evidence must be read from actual source files to confirm line numbers, avoiding line number drift from index cache lag.
4. **Text search backup** — when the first two are unavailable, use filename matching + content regex to explore.

> Most coding agents expose equivalent tools — use whatever yours provides. The category is what matters, not the tool name:
>
> | Category | Claude Code | Cursor | Cline | Aider | omp | Codex |
> |----------|-------------|--------|-------|-------|-----|-------|
> | 1. Code graph / index | codegraph MCP | `@codebase` | `search_files` | repo map (auto) | `lsp` + `ast_grep` | `shell` (ctags/grep) |
> | 2. Bulk scanning | Explore Agent | `@codebase` / multi-file search | `list_files` + `search_files` | `/search` | `search` + `find` | `shell` (grep/find) |
> | 3. Source reading | `Read` | open file / `@file` | `read_file` | `/add` | `read` | `read_file` |
> | 4. Text search | `Grep` / `Glob` | Find in files | `search_files` | `/search` | `search` | `shell` (grep/find) |

#### Web Search Tools (for feature-research)

When the exploration requires web research — searching for similar products, reading documentation of alternatives, or evaluating competitive landscape — use these tools:

| Category | Claude Code | OpenAI Codex | OpenCode | Pi (oh-my-pi) |
|----------|-------------|--------------|----------|----------------|
| Web search | `WebSearch` | `web_search` | MCP-based* | MCP-based* |
| Web page read | `WebFetch` / MCP | `web_search_preview` | MCP-based* | MCP-based* |

> *MCP-based agents (OpenCode, Pi): tool names depend on the user's MCP server configuration. Look for tools with "web", "fetch", "search", or "browser" in the name. Common patterns: `mcp__web_reader__webReader`, `mcp__fetch__fetch`, `mcp__puppeteer__puppeteer_navigate`.

#### Web Research for feature-research Type

When the exploration type is `feature-research`, Phase 2 includes web research alongside code exploration:

1. **Search priority** — open-source first, then commercial/closed-source:
   - Open-source products with accessible source code (preferred — read actual source)
   - Open-source products without source code access (read official docs)
   - Commercial/closed-source products (read official docs, reviews, comparisons)
2. **Confidence classification for web-sourced findings:**

   | Source Type | Confidence | Example |
   |-------------|------------|---------|
   | Source code read | **high** | Cloned repo, read implementation directly |
   | Official documentation | **medium** | API docs, architecture guide, README |
   | Blog / forum / third-party | **low** | Reddit thread, medium article, StackOverflow |

3. **Existing feature investigation** — when the feature has analogues in mature products, include insights from those products' approaches: what works well, what doesn't, and why. Apply the same confidence classification.
4. **Evidence from web research** follows the same rules as code evidence: each item must state which conclusion it supports. Web evidence includes a URL or product name instead of `file:line`.

- **Read real code, don't guess.** Every piece of evidence must come from actual code or config files.
- Accumulate evidence while reading; **simultaneously think about which conclusion each piece supports** — evidence that supports no conclusion is not recorded.
- Target 3–8 key evidence items (comfort zone). When exceeding, check whether each supports an independent conclusion — two items supporting the same point should be merged. Baseline: each item must support at least one conclusion.
- Every evidence item must include a `file:line` reference.
- Multi-module collaboration or `module-overview` / `spike` types → prepare a Mermaid diagram for the quick-answer section.
- After forming preliminary conclusions, proactively check: would the current evidence convince a skeptical reader? If yes, stop — no need to expand the search.

Why "stop when enough": exploration is not exhaustive — it builds an evidence chain up to the point where "the reader can be convinced." Continuing to expand only makes the document longer, not more credible.

### Phase 3: Draft & Confirm

- **Write the quick-answer section first, then backfill key evidence** — conclusions first, then verify evidence actually supports them. This order forces you to check each piece's actual effectiveness.
- Draft the complete document in one pass.
- After drafting, self-check: tick off each exit condition. For uncertain evidence or conclusions, clearly mark them in the document (using `<!-- comments -->` or downgrade confidence). Points requiring user confirmation go into follow-up suggestions — don't block archiving.
- When user provides feedback, revise based on feedback before finalizing.

### Phase 4: Archive

- Write to `docs/superpowers/explore/YYYY-MM-DD-{descriptive-slug}.md`
- Capture the current VCS commit hash into frontmatter `commit` field (e.g. run `git rev-parse --short HEAD`). Use `HEAD` for uncommitted changes
- If replacing: old document must be marked `status: outdated` + `superseded-by` before writing the new document
- If updating: write back to original file

### Phase 5: Suggest Next Steps

- Offer a next-step suggestion ("Want to design a plan based on this exploration?"). If the user says "no", skip. The user decides their own next steps.

## Multi-Subagent Orchestration (Optional)

When the exploration scope is large, a single agent pass may miss cross-cutting concerns. This optional mode splits work across subagents for parallel investigation.

### Trigger Conditions

Activate when ANY of:
- Scope covers 3+ independent modules
- `feature-research` type with 3+ products/approaches to evaluate
- User explicitly requests parallel investigation

### Pattern

1. **Main agent maps scope** — identify independent work units (typically one per module or product)
2. **Dispatch subagents** — each receives a mandate (scope + questions + output format)
3. **Subagents investigate** — each produces a structured mini-report
4. **Main agent aggregates** — deduplicate findings, resolve conflicts, build unified conclusion
5. **Main agent writes final document** — single coherent report with merged evidence

### Subagent Mandate Template

```
Explore mandate:
  Scope: {module path or product name}
  Questions: {1-2 specific questions to answer}
  Type: {question | module-overview | spike | feature-research}
  Output format:
    - Quick-answer: 2-3 sentences + Mermaid diagram if applicable
    - Key evidence: 3-5 items with file:line (or URL for web research)
    - Confidence: high/medium/low with justification
    - Open questions: any unresolved items
  Constraints:
    - Do NOT explore outside the assigned scope
    - Do NOT make decisions — record observations only
    - If scope overlaps with {other subagent scope}, note it but do not investigate
```

### Aggregation Rules

- **Deduplication**: when two subagents report overlapping findings, keep the one with stronger evidence
- **Conflict resolution**: when subagents disagree, investigate the conflict point directly and document both views
- **Evidence merging**: evidence items from different subagents are numbered sequentially in the final report
- **Confidence**: overall confidence is the minimum across subagents for cross-cutting conclusions; individual sections retain their own confidence levels

## Document Format

Frontmatter / body structure / section writing guidelines and examples are in `references/template.md`. Core constraints:

The quick-answer section is the most important part of the entire document — most people only read this section.

| Rule | Good | Bad |
|------|------|-----|
| **Conclusions first** | "Module entry is X, core flow is Y → Z" | List 20 lines of files before giving a conclusion |
| **Actionable** | "Add new handler at routes/index.ts line 42" | "Probably somewhere in the routes directory" |
| **Has architecture diagram** | module-overview / spike includes Mermaid diagram | Pure text description of module relationships |
| **Confidence labeled** | "confidence: medium — test files not covered" | confidence: high but only looked at 2 files |

## Output Language & Format

**Language:** The report MUST be written in the same language the user is communicating in. If the user speaks Chinese, write in Chinese. If English, write in English. Follow the user's language throughout the entire document — section headings, evidence descriptions, and conclusions all match the user's language.

**Format:** Default is Markdown (`.md`). The user may request HTML format (`.html`) instead. When HTML is requested:

- Use a polished, professional stylesheet — not a bare Markdown-to-HTML conversion. The HTML output should look distinctly different from the Markdown source: richer typography, purposeful color, and visual hierarchy.
- Leverage HTML capabilities that Markdown lacks:
  - Collapsible `<details>` sections for detailed evidence (keeps the quick-answer scannable)
  - Color-coded severity / confidence badges (e.g., 🔴 critical, 🟡 medium, 🟢 high)
  - A floating or sticky table of contents for navigation
  - Styled callout boxes (`<aside>`, `<blockquote>` variants) for key findings vs. supplementary notes
  - Code blocks with syntax highlighting and line-number anchors
- Maintain the same section structure and content as the Markdown template — HTML is a presentation layer, not a restructuring
- Include inline `<style>` CSS so the document is self-contained and portable (no external dependencies)

## Confidence Standards

| Level | Meaning | When to Use |
|-------|---------|-------------|
| **high** | Read core code, conclusions have sufficient evidence | Evidence ≥ 3 items and covers key paths |
| **medium** | Read some code, direction is correct but details may differ | Only looked at entry points / interfaces, didn't go deep into implementation |
| **low** | Inferred from indirect evidence, needs further verification | Only looked at config / type definitions, didn't see runtime logic |

When evidence is insufficient, confidence **MUST** be downgraded. Writing high but only looking at 2 files = deceiving the reader.

## Anti-Patterns

| Anti-Pattern | Why It's Wrong |
|-------------|----------------|
| Giving conclusions without reading code | Conclusions are guesses, not credible |
| Evidence says "looks like" without `file:line` | Readers cannot verify |
| Conclusions written after evidence | Quick-answer section must come before key evidence section |
| Evidence section several times longer than quick-answer | Trim evidence — remove anything that doesn't support a conclusion |
| Cross-module flow without Mermaid diagram | Text alone cannot convey the flow |
| Making decisions prematurely | explore only records "what was observed", not "what should be done later" |
| Continuing to cite outdated explorations | Citing without marking is spreading misinformation |
| Citing old exploration without checking `status` | When reading old docs, check frontmatter `status` field first; `outdated` docs are reference-only and must be marked |

## References — When to Read What

References are loaded on demand. **Do not read them upfront** — only open them when the situation calls for it.

| When | Read |
|------|------|
| Drafting the document (Phase 3) — need exact frontmatter schema, section structure, or Mermaid example | `references/template.md` |
| User requests HTML output instead of Markdown | `references/template.html` (English headings) **or** `references/template_zh.html` (bilingual Chinese+English headings — use when user communicates in Chinese) |
| User says "explore again" / "re-check" (Phase 1.5) — need decision rules for update vs. replace | `references/template.md` Section 4 (Searching Existing Documents) |
| Need a Mermaid example for module-overview or spike | `references/template.md` Section 5 (Mermaid Diagram Examples) |

**Repository-level context:** Read `CLAUDE.md` at the start of any exploration — it contains global hard constraints and the document map (boundaries to respect during exploration).

> HTML template note: `template.html` and `template_zh.html` are not just Markdown-to-HTML conversions — they have inline CSS, collapsible sections, confidence badges, floating TOC, and styled callout boxes. The `_zh` variant has bilingual section headings (Chinese + English). Pick the one matching the user's language.

## Exit Conditions

Before marking exploration as complete:

- [ ] Exploration question and scope are clearly defined
- [ ] Quick-answer section gives core conclusions (conclusions first)
- [ ] 3–8 key evidence items, each with `file:line` and explanation of which conclusion it supports
- [ ] module-overview / spike / feature-research types have a Mermaid diagram in the quick-answer section
- [ ] feature-research type: web-sourced findings classified by confidence level
- [ ] Confidence matches evidence sufficiency
- [ ] Frontmatter includes `scope` (paths explored) and `commit` (VCS hash)
- [ ] Document archived to `docs/superpowers/explore/`
- [ ] If replacing: old document marked `status: outdated` + `superseded-by`
- [ ] If updating: original file has `updated: YYYY-MM-DD` appended
- [ ] Follow-up suggestions provided
- [ ] If multi-subagent mode was used: aggregation notes included, cross-unit conflicts resolved, confidence reflects minimum across subagents

## Final Rules

```
Read code before concluding — conclusions must trace back to file:line
Quick-answer first — readers see conclusions before evidence
Stop when enough — build the evidence chain to "reader can be convinced"
No decisions — explore only records "what was observed"
```

No exceptions without your human collaborator's approval.
