# code-skills

开源 AI Coding Skills 库，兼容 [superpowers](https://github.com/simonw/superpowers) 技能格式（路径兼容和补充）。

Open-source AI Coding Skills library. Compatible with [superpowers](https://github.com/simonw/superpowers) skill format (path-compatible and supplementary).

---

## 技能列表 / Skills

| 技能 | 说明 |
|------|------|
| **code-explore** | 证据化代码探索，按"提问 → 读代码 → 得结论"工作流产出可检索的探索报告 |
| **code-review** | 系统化 AI 辅助代码审查，多角度分析产出结构化审查报告 |

| Skill | Description |
|-------|-------------|
| **code-explore** | Directed code exploration that produces evidence-based, searchable reports following an "ask → read → conclude" workflow |
| **code-review** | Systematic AI-assisted code review that produces structured, evidence-based review reports |

---

## 目录结构 / Directory Structure

```
code-skills/
├── CLAUDE.md              # 项目约束与文档地图
├── AGENTS.md              # 与 CLAUDE.md 保持同步
├── scripts/
│   ├── check_docs.mjs     # 同步 CLAUDE.md ↔ AGENTS.md
│   └── lint_skills.mjs    # 校验技能 frontmatter 与结构
├── code-explore/
│   ├── SKILL.md           # 技能定义（AI 执行版本）
│   ├── SKILL-ZH.md        # 中文阅读副本（仅供人类参考）
│   └── references/        # 文档模板（Markdown + HTML）
└── code-review/
    ├── SKILL.md
    ├── SKILL-ZH.md
    └── references/
```

---

## 使用方式 / Usage

技能为 AI 编码代理设计（Claude Code、Cursor、Cline 等）。将技能目录放入代理的技能路径即可自动加载。

Skills are designed for AI coding agents (Claude Code, Cursor, Cline, etc.). Place the skill directory in your agent's skill path and it will be automatically loaded.

### 产出目录 / Output Directories

技能产出存放在 `docs/superpowers/` 下：

- `docs/superpowers/explore/` — 探索报告（code-explore 产出）
- `docs/superpowers/reviews/` — 审查报告（code-review 产出）

Skills produce documents in `docs/superpowers/`:

- `docs/superpowers/explore/` — exploration reports (from code-explore)
- `docs/superpowers/reviews/` — review reports (from code-review)

---

## 开发 / Development

```bash
# 同步 CLAUDE.md 和 AGENTS.md
node scripts/check_docs.mjs

# 校验所有技能
node scripts/lint_skills.mjs
```

---

## 双语约定 / Bilingual Convention

每个技能维护两个版本：

- **SKILL.md** — 英文，AI 代理执行的权威版本
- **SKILL-ZH.md** — 中文阅读副本，仅供人类参考，不参与技能触发

Each skill maintains two versions:

- **SKILL.md** — English, the authoritative version that AI agents execute
- **SKILL-ZH.md** — Chinese reading copy for human reference, not used by AI

---

## License

MIT
