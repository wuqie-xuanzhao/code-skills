# code-skills

Open-source AI Coding Skills library. Compatible with [superpowers](https://github.com/simonw/superpowers) skill format (path-compatible and supplementary).

## Skills

| Skill | Description |
|-------|-------------|
| **code-explore** | Directed code exploration that produces evidence-based, searchable reports following an "ask → read → conclude" workflow |
| **code-review** | Systematic AI-assisted code review that produces structured, evidence-based review reports |

## Directory Structure

```
code-skills/
├── CLAUDE.md              # Project constraints and document map
├── AGENTS.md              # Same as CLAUDE.md (kept in sync)
├── scripts/
│   ├── check_docs.mjs     # Sync CLAUDE.md ↔ AGENTS.md
│   └── lint_skills.mjs    # Validate skill frontmatter and structure
├── code-explore/
│   ├── SKILL.md           # Skill definition (AI execution version)
│   ├── SKILL-ZH.md        # Chinese reading copy (human reference only)
│   └── references/        # Document templates (Markdown + HTML)
└── code-review/
    ├── SKILL.md
    ├── SKILL-ZH.md
    └── references/
```

## Usage

Skills are designed for AI coding agents (Claude Code, Cursor, Cline, etc.). Place the skill directory in your agent's skill path and it will be automatically loaded.

### Output Directories

Skills produce documents in `docs/superpowers/`:

- `docs/superpowers/explore/` — exploration reports (from code-explore)
- `docs/superpowers/reviews/` — review reports (from code-review)

## Development

```bash
# Sync CLAUDE.md and AGENTS.md
node scripts/check_docs.mjs

# Lint all skills
node scripts/lint_skills.mjs
```

## Bilingual Convention

Each skill maintains two versions:

- **SKILL.md** — English, the authoritative version that AI agents execute
- **SKILL-ZH.md** — Chinese reading copy for human reference, not used by AI

## License

MIT
