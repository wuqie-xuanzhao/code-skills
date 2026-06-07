# code-skills

开源 AI Coding Skills 库，兼容 [superpowers](https://github.com/simonw/superpowers) 技能格式（路径兼容和补充）。当前正式公开发布 3 个技能：`code-explore`、`code-review`、`code-refactor`。

## 技能列表

| 技能 | 说明 |
|------|------|
| **code-explore** | 证据化代码探索，按“提问 → 读代码 → 得结论”工作流产出可检索的探索报告。支持 4 种探索类型：question / module-overview / spike / feature-research |
| **code-review** | 系统化 AI 辅助代码审查，8 个审查角度，17 种语言/框架深度参考，多子代理协同模式 |
| **code-refactor** | 面向既有代码的安全重构，聚焦行为不变前提下的可维护性改进、结构优化，以及基于 `code-review` 结论的落地 |

## 目录结构

```text
code-skills/
├── CLAUDE.md              # 项目约束与文档地图
├── AGENTS.md              # 与 CLAUDE.md 保持同步
├── scripts/
│   ├── check_docs.mjs          # 同步 CLAUDE.md ↔ AGENTS.md
│   ├── check_constraints.mjs   # 扫描源文件占位符模式（26 条规则）
│   └── lint_skills.mjs         # 校验技能 frontmatter 与结构
├── code-explore/
│   ├── SKILL.md           # 技能定义（AI 执行版本）
│   ├── SKILL-ZH.md        # 中文阅读副本（仅供人类参考）
│   └── references/
│       ├── template.md         # 探索报告模板（Markdown）
│       ├── template.html       # 探索报告模板（英文 HTML）
│       ├── template_zh.html    # 探索报告模板（中英双语 HTML）
│       └── template_zh.md      # 模板中文版
├── code-review/
│   ├── SKILL.md
│   ├── SKILL-ZH.md
│   └── references/
│       ├── template.md         # 审查报告模板（Markdown）
│       ├── template.html       # 审查报告模板（英文 HTML）
│       ├── template_zh.html    # 审查报告模板（中英双语 HTML）
│       ├── template_zh.md      # 模板中文版
│       ├── communication.md    # 反馈技巧、双语严重度标签、中文团队反模式
│       ├── constraints.md      # 占位符检测模式（人类可读）
│       ├── constraints.json    # 占位符检测规则（机器可读，26 条）
│       ├── lang/               # 17 种语言/框架审查指南
│       └── crosscut/           # 6 份跨切面深度指南
└── code-refactor/
    ├── SKILL.md
    ├── SKILL-ZH.md
    ├── evals/
    │   └── evals.json          # 代表性评测用例
    └── references/
        ├── code_smells.md      # 异味识别与适用边界
        ├── techniques.md       # 常见重构手法
        ├── patterns.md         # 分阶段重构模式
        ├── safety.md           # 行为边界与风险控制
        └── template.md         # 可选的归档报告模板
```

## 使用方式

技能为 AI 编码代理设计（Claude Code、Codex、OpenCode、Pi Coding Agent 等）。将技能目录放入代理的技能路径即可自动加载。

技能产出默认在对话中给出；需要归档时，约定存放在 `docs/superpowers/` 下：

- `docs/superpowers/explore/` — 探索报告（`code-explore` 产出）
- `docs/superpowers/reviews/` — 审查报告（`code-review` 产出）
- `docs/superpowers/refactors/` — 重构报告（`code-refactor` 归档产出）

## 开发

```bash
# 同步 CLAUDE.md 和 AGENTS.md
node scripts/check_docs.mjs

# 扫描变更中的占位符模式
node scripts/check_constraints.mjs --diff HEAD

# 校验所有技能
node scripts/lint_skills.mjs
```

## 双语约定

每个技能维护两个版本：

- **SKILL.md** — 英文，AI 代理执行的权威版本
- **SKILL-ZH.md** — 中文阅读副本，仅供人类参考，不参与技能触发

## 许可证

MIT

---

Open-source AI Coding Skills library. Compatible with the [superpowers](https://github.com/simonw/superpowers) skill format (path-compatible with a few repository-specific additions). This repository currently publishes three formal public skills: `code-explore`, `code-review`, and `code-refactor`.

## Skills

| Skill | Description |
|-------|-------------|
| **code-explore** | Directed code exploration that produces evidence-based, searchable reports. Supports 4 exploration types: question, module-overview, spike, and feature-research |
| **code-review** | Systematic AI-assisted code review with 8 review angles, 17 language-specific references, and multi-subagent orchestration |
| **code-refactor** | Safe refactoring for existing code, focused on maintainability, structural improvement, and applying `code-review` findings without changing externally observable behavior |

## Directory Structure

```text
code-skills/
├── CLAUDE.md              # Project constraints and document map
├── AGENTS.md              # Same as CLAUDE.md (kept in sync)
├── scripts/
│   ├── check_docs.mjs          # Sync CLAUDE.md ↔ AGENTS.md
│   ├── check_constraints.mjs   # Scan changed source files for placeholder patterns (26 rules)
│   └── lint_skills.mjs         # Validate skill frontmatter and structure
├── code-explore/
│   ├── SKILL.md           # Skill definition (AI execution version)
│   ├── SKILL-ZH.md        # Chinese reading copy (human reference only)
│   └── references/        # Exploration templates (Markdown + HTML, bilingual)
├── code-review/
│   ├── SKILL.md
│   ├── SKILL-ZH.md
│   └── references/        # Review templates, language guides, and cross-cutting guides
└── code-refactor/
    ├── SKILL.md
    ├── SKILL-ZH.md
    ├── evals/             # Representative evaluation prompts
    └── references/        # Refactor safety, smells, patterns, techniques, report template
```

## Usage

These skills are designed for AI coding agents such as Claude Code, Codex, OpenCode, and Pi Coding Agent. Put a skill directory on your agent's skill search path and it can be loaded automatically.

Outputs are usually delivered directly in the conversation. When archived to disk, the repository convention is:

- `docs/superpowers/explore/` — exploration reports (from `code-explore`)
- `docs/superpowers/reviews/` — review reports (from `code-review`)
- `docs/superpowers/refactors/` — refactor reports (from `code-refactor`)

## Development

```bash
# Sync CLAUDE.md and AGENTS.md
node scripts/check_docs.mjs

# Check placeholder patterns in changed files
node scripts/check_constraints.mjs --diff HEAD

# Lint all skills
node scripts/lint_skills.mjs
```

## Bilingual Convention

Each skill maintains two versions:

- **SKILL.md** — English, the authoritative version executed by AI agents
- **SKILL-ZH.md** — Chinese reading copy for humans, not used for skill triggering

## License

MIT
