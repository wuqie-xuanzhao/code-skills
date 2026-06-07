> **📖 中文阅读副本**
> 这是 `code-review` 文档模板的中文版本，仅供人类日常参考阅读。
> AI 执行时使用同目录下的英文版 `template.md`。

# Review 报告参考模板

本文件提供 `code-review` 使用的 frontmatter、正文结构和写作说明。

## 1. Frontmatter

```yaml
---
type: quick | standard | deep
date: YYYY-MM-DD
status: active | outdated
scope: {分支/PR/描述}
commit: <短哈希或标签>
reviewer: AI-assisted
---
```

- `commit`：审查时代码库的 VCS 短哈希（如 git `abc1234`）或标签。读者可以检查代码是否已变更。审查未提交改动时用 `HEAD`
- `status: outdated`：审查后代码已被大幅修改
- `scope` 描述审查了什么（分支名、PR 编号或描述）
- 更新已有审查时追加 `updated: YYYY-MM-DD`

文件名：`docs/superpowers/reviews/YYYY-MM-DD-{描述性标题}.md`。

## 2. 正文结构

```markdown
## 摘要

<!-- 2–3 句话：审查了什么、整体评估、关键风险 -->

## 发现

| # | 严重程度 | 概要 | 位置 |
|---|----------|------|------|
| 1 | critical | {一句话描述} | `file:line` |

## 详细发现

### 发现 1：{标题}

- **严重程度：** critical / major / minor / suggestion
- **位置：** `file:line`
- **问题：** {哪里错了}
- **证据：** {展示问题的实际代码}
- **故障场景：** {具体输入/状态 → 错误输出/崩溃}
- **修复：** {如何修复}

## 值得肯定

<!-- 标注好的模式、巧妙的解决方案、结构清晰的代码 -->

## 建议

<!-- 流程或架构层面的建议，不是个别修复 -->

## 审查范围

- 范围：{审查了什么}
- 涉及文件：{数量} 文件，{数量} 行
- 跳过：{未审查的部分和原因}
```

## 3. 各节写法说明

### 摘要（最重要）

- 最多 2–3 句话
- 包含：审查了什么 → 整体评估 → 最大风险
- 读者只看这一节就应该理解审查结论

示例：
```markdown
## 摘要

审查了 PR #42（新增用户认证流程，12 个文件，340 行改动）。
整体实现扎实——认证逻辑遵循既有模式，边界情况处理得当。
**一条严重发现**：session token 存入 localStorage 时未做过期校验，
在共享设备上存在会话劫持风险。
```

### 发现表

- 每条发现按严重程度排序（critical → major → minor → suggestion）
- 概要只有一句话——详细内容放在详细发现节
- 位置必须是 `file:line` 格式

示例：
```markdown
## 发现

| # | 严重程度 | 概要 | 位置 |
|---|----------|------|------|
| 1 | critical | Session token 存入 localStorage 未做过期校验 | `auth/session.ts:47` |
| 2 | major | 并发登录竞态——第二个请求覆盖第一个 session | `auth/handler.ts:89` |
| 3 | minor | `validateToken` 每次调用都重新解码 JWT，未缓存 | `auth/jwt.ts:23` |
| 4 | suggestion | 考虑将重试循环提取为公共工具函数 | `auth/oauth.ts:156` |
```

### 详细发现

- 每条发现一个子节
- 每个字段都必须填写（suggestion 的 Fix 可选）
- 证据引用文件中的实际代码
- 故障场景必须具体："当 X 发生时，Y 出错"

示例：
```markdown
### 发现 1：Session Token 未做过期校验

- **严重程度：** critical
- **位置：** `auth/session.ts:47`
- **问题：** Session token 存入 `localStorage` 但从未在页面加载时检查过期时间。
  已过期或已撤销的 token 在用户显式登出前一直可用。
- **证据：**
  ```typescript
  // auth/session.ts:47
  localStorage.setItem('session_token', token);
  // 整个文件中没有任何过期检查
  ```
- **故障场景：** 用户在公用电脑登录 → 管理员撤销 token → 用户关闭浏览器
  → 下一个人打开浏览器 → token 仍在 localStorage → 已撤销的会话被静默恢复。
- **修复：** 存储 token 时同时存入 `expires_at`，每次页面加载时检查：
  ```typescript
  const session = JSON.parse(localStorage.getItem('session') || '{}');
  if (Date.now() > session.expires_at) {
    localStorage.removeItem('session');
    redirectToLogin();
  }
  ```
```

### 值得肯定

- 真诚的认可，不是凑数
- 标注具体好的模式或决策
- 帮助平衡 review 的基调，维护团队士气

示例：
```markdown
## 值得肯定

- **错误处理模式**：`errors/index.ts` 中的集中错误处理器配合类型化错误类
  简洁且可扩展——添加新错误类型几乎不需要改动。
- **测试覆盖率**：认证流程有 94% 的覆盖率，包含有意义的边界测试
  （过期 token、并发请求、格式错误的 JWT），高于项目平均水平。
- **类型安全**：使用可辨识联合表示认证状态（`AuthState | UnauthState`），
  在编译期消除了一整类 null 检查 bug。
```

### 建议

- 流程或架构层面的建议，不是个别修复
- 每条建议应能预防一类问题，而非仅一处
- 可选——如果 review 没有发现系统性模式就跳过

示例：
```markdown
## 建议

1. **添加 `session-expiry` lint 规则**：session token 问题是一种可能复现的模式，
   考虑添加 lint 检查，标记没有附带过期字段的 `localStorage.set` 调用。
2. **公共重试工具函数**：发现 4 是我们第三次看到手写的重试循环。
   考虑将其提取到 `utils/retry.ts`，支持可配置的退避策略。
```

### 审查范围

- 明确说明审查了什么、没审查什么
- 让读者了解审查的边界

示例：
```markdown
## 审查范围

- 范围：PR #42 — 用户认证流程
- 涉及文件：12 个文件，340 行（+287 / -53）
- 跳过：`vendor/` 目录（第三方代码）、`auth/migrations/`（数据库 schema 变更，由 DBA 单独审查）
```

## 4. 发现严重程度决策树

```
是否会导致崩溃、数据丢失或安全问题？
├── 是 → critical
└── 否
    是否会导致错误结果或破坏边界情况？
    ├── 是 → major
    └── 否
        是否让代码更难维护或理解？
        ├── 是 → minor
        └── 否
            是风格或命名改进？
            └── 是 → suggestion
```

## 5. 反模式对照

| 反模式 | 正确做法 |
|--------|----------|
| 发现不带 `file:line` | 每条发现必须有具体位置 |
| 发现不带故障场景 | 必须描述触发问题的具体输入/状态 |
| 严重程度模糊 | 用上面的决策树 |
| 只有负面发现 | 包含值得肯定的内容——好代码值得被认可 |
| 发现重复了已有发现 | 合并为一条，汇总证据 |
| 把被删除的代码当新代码审查 | 先读 diff——理解删了什么以及为什么 |
| 建议当作严重发现 | 主观意见保持在 suggestion 级别 |
