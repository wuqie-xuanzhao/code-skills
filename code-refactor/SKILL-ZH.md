---
name: code-refactor-zh
description: 【中文阅读版】code-refactor 技能的中文参考副本，供人类日常阅读。AI 执行时请使用英文版 SKILL.md。本文件不参与技能触发。
---

> **📖 中文阅读副本**
> 这是 `code-refactor` 技能的中文版本，仅供人类日常参考阅读。AI 执行时使用同目录下的英文版 `SKILL.md`。

# 代码重构

## 概述

重构是在保持外部可观察行为不变的前提下，改变代码结构。它是受控演进，不是重写，也不是夹带新功能的捷径。

本技能用于把明确的可维护性、结构优化、现代化迁移或行为保持型性能优化目标，转成小步、可验证的代码修改。如果已有 `code-review` 发现，应优先复用：review finding 解释"为什么值得改"，本技能控制"怎样安全地改"。对目标区域不熟悉或结构边界不清晰时，先做一次 `code-explore`——探索负责画出地图，重构负责改变地形。

## 何时使用

**适用：**

- 重构、清理、可维护性提升、代码坏味道治理
- 拆分长函数、大模块、上帝对象、重复逻辑或纠缠依赖
- 执行已确认的 `code-review` 重构建议
- 保持行为不变的性能优化
- 保持公共契约不变的现代化迁移
- 为后续功能开发改善 seam 和边界

**不适用：**

- 新功能或产品行为变化
- 当前行为已知错误的 bug 修复
- 完整重写或 repo 重建
- 只做 code review、不打算改代码
- 没有维护性、安全性或性能目标的纯风格改动
- 用户只想探索代码、不打算改代码 → 使用 `code-explore`

如果用户请求混合了重构、功能和 bugfix，先拆分意图。除非用户明确切换任务，否则只执行重构部分。

## 重构类型

| 类型 | 适用场景 | 典型动作 |
|------|----------|----------|
| **Incremental** | 局部代码难读，但边界清晰 | rename、extract function、去重复、简化条件 |
| **Structural** | 职责、模块或依赖关系纠缠 | extract class/module、move logic、introduce seam、split phase |
| **Performance-preserving** | 代码慢，但行为必须一致 | 缓存派生值、批处理、减少重复计算、消除 N+1 |
| **Modernization migration** | 旧 API、回调、类型或框架惯用法需要升级 | adapter、兼容 wrapper、分阶段 API 迁移、类型边界 |

## 工作流

### Phase 1：明确目标和行为边界

改代码前，先用一句话说明重构目标，并定义不能改变的行为。

不清楚时最多问：

1. “哪些外部行为必须保持一致？”
2. “有没有已有 review 报告或 finding 需要复用？”

行为边界包括公共 API、返回结构、错误、被用户或系统依赖的日志、配置键、数据库 schema、权限逻辑、时序/顺序保证、生成文件和 UI 可见输出。

如果说不清行为边界，就还没有准备好重构。阅读 `references/safety.md`。

#### 加载已有探索上下文

从头读代码之前，先检查 `docs/superpowers/explore/` 下是否有 scope 与重构目标重叠的探索报告。如果有，加载为背景——它们可能已经记录了调用链、依赖关系和边界信息，对行为边界定义和重构计划有直接帮助。

### Phase 2：复用已有 Review Finding

当存在 `code-review` 报告或评论时：

1. 先读取相关 finding。
2. 对每个 item 分类：
   - **Refactor now** — 结构 / 可维护性 / 行为不变的性能项
   - **Bugfix** — 当前行为错误，应转 debugging/TDD
   - **Feature** — 行为新增，应进入 feature 流程
   - **Defer** — 有价值但本轮不做
3. 只执行 **Refactor now** 项。

不要重新做完整 review，除非用户要求。如果没有 review，只做轻量 smell 定位，可参考 `references/code_smells.md`。

### Phase 3：建立安全网

没有安全网的重构只是带着希望编辑代码。改动行为邻近代码前：

- 如果已有聚焦测试，先运行。
- 行为测试不足时，先补 characterization tests。
- 性能优化要记录性能基线和行为等价检查。
- 现代化迁移要识别兼容点和迁移阶段。
- 多步骤修改要记录回滚点。

如果没有测试且重构非平凡，先停下，提出最小 characterization tests。

### Phase 4：规划小步验证

编辑前写短计划。每一步都说明：

- 解决哪个 smell 或 review finding；
- 触碰哪些文件 / 函数；
- 保持哪个行为边界；
- 该步后的验证命令或手动检查。

每一步尽量只使用一种重构手法。不要把 rename、extract、API 迁移和性能优化混在一个 edit 中。

### Phase 5：一次只做一种重构

每个小改之后：

1. 运行聚焦验证。
2. 如果失败，先回退或修正，再继续。
3. 不要为了让下一步更容易而扩大范围。
4. 除非用户明确批准接口迁移，否则保持公共接口稳定。

具体手法参考 `references/techniques.md`；只有 smell 需要时才读 `references/patterns.md`。

### Phase 6：验证并总结

声称完成前，运行约定验证并总结证据。如果无法验证，要明确说明原因和剩余风险。

如果重构触碰关键路径、公共 API、安全敏感代码或多个模块，建议后续再做一次 `code-review`。如果重构目标是不熟悉的区域，模块边界不清、依赖隐藏或调用链未记录，建议先做一次 `code-explore`。

## Reference 加载指引

| 需求 | 阅读 |
|------|------|
| 判断代码是否值得重构 | `references/code_smells.md` |
| 选择小步机械重构手法 | `references/techniques.md` |
| 用设计模式替换条件 / 边界 | `references/patterns.md` |
| 保持行为、补 characterization tests、处理性能或迁移风险 | `references/safety.md` |

只加载当前决策需要的 reference。

## 输出格式

重构任务使用以下结构：

```markdown
## Refactor Scope

- Goal:
- Type: incremental | structural | performance-preserving | modernization migration
- Inputs reused: code-review finding / user-specified smell / lightweight smell scan

## Behavior Boundary

- Public behavior preserved:
- Explicitly out of scope:

## Refactor Plan

| Step | Smell/Finding | Change | Verification |
|------|---------------|--------|--------------|

## Changes Made

- ...

## Verification Evidence

- Command/check:
- Result:

## Deferred / Not Done

- ...

## Follow-up Review Suggestion

- Needed / not needed, with reason.
```

## 常见失控模式

| 失控模式 | 正确处理 |
|---------|----------|
| “重构时顺便加这个设置” | 拆成 feature，除非用户切换任务，否则 defer |
| 没测试但要求大结构调整 | 先补 characterization tests 或提出分阶段计划 |
| 性能优化改变排序 / 错误 / 返回结构 | 这是行为变化，停止并询问 |
| 现代化要求改 API | 保留 adapter 或请求明确迁移批准 |
| 模式很优雅但 smell 很局部 | 优先使用更简单的局部手法 |
| Review finding 实际是 bug | 转 debugging/TDD，不当作 refactor |
| 触碰 auth、持久化、金钱或安全 | 缩小步长，并建议后续 review |

## 最终检查

说重构完成前，确认：

- 重构目标已达成；
- 外部行为边界已命名且被保持；
- 没有混入 feature 或 bugfix；
- 验证证据已报告；
- deferred items 已明确。
