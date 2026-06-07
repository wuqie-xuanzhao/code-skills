# Communication & Feedback Reference

Practical patterns for writing review feedback that is clear, respectful, and actionable.
Covers both English and Chinese team conventions.

---

## 1. Severity Labels (Bilingual)

Use one labeling system per review, based on the author's preferred communication language.

### English (default)

| Label | Meaning | Action |
|-------|---------|--------|
| 🔴 `[blocking]` | Critical — blocks merge | Must fix before approval |
| 🟡 `[important]` | Major — should fix | Discuss if you disagree |
| 🟢 `[nit]` | Minor — nice to have | Non-blocking |
| 💡 `[suggestion]` | Alternative approach | Consider, optional |
| 📚 `[learning]` | Educational, no action | Informational |
| 🎉 `[praise]` | Good work | Celebrate |

### Chinese (when user communicates in Chinese)

| Label | Meaning | Action |
|-------|---------|--------|
| `[必须修复]` | 安全漏洞/数据丢失/逻辑错误 | 不修不能合 |
| `[建议修改]` | 性能/可维护性/校验缺失 | 本次或下次迭代修复 |
| `[仅供参考]` | 命名/风格/替代方案 | 不改也行 |
| `[问题]` | 不确定，需作者解释 | 等回复 |
| `[肯定]` | 做得好的地方 | 表扬 |

---

## 2. Feedback Expression

### English feedback patterns

Every review comment should be **specific, actionable, and focused on the code** — not the person.

```markdown
# BAD — vague and judgmental
"This is wrong."

# GOOD — specific, educational, suggests a fix
"This could cause a race condition when multiple users
access simultaneously. Consider using a mutex here."

---

# BAD — condescending question
"Why didn't you use X pattern?"

# GOOD — collaborative suggestion with evidence
"Have you considered the Repository pattern? It would
make this easier to test. Here's an example: [link]"

---

# BAD — imperious command
"Rename this variable."

# GOOD — labeled nit, respectful of author's choice
"[nit] Consider `userCount` instead of `uc` for clarity.
Not blocking if you prefer to keep it."
```

### Chinese feedback patterns

Use "suggest" instead of "command" (建议代替命令):

| Avoid (命令式) | Recommend (建议式) |
|---------------|-------------------|
| 你必须改成 X | 建议考虑用 X，因为 Y |
| 这里写错了 | 这里可能存在一个问题，是否考虑过 Z 的情况？ |
| 不要用这个方法 | 这个方法在 A 场景下可能有性能问题，可以看看 B 方案 |
| 这段代码不行 | 这段逻辑我理解得对吗？如果输入为空的话会怎样？ |

Use "questions" instead of "negation" (用提问代替否定):

```markdown
# BAD — blunt rejection
这里不应该用 sync 方式读文件。

# GOOD — ask intent, then explain risk
这里用 sync 方式读文件是出于什么考虑？
如果并发量上来，可能会阻塞事件循环。
```

---

## 3. Chinese Team Anti-Patterns

Four common dysfunctions in Chinese-speaking teams and how to counter them.

### Anti-Pattern 1: Excessive Politeness (过度客气)

All comments sound like "I think maybe perhaps there might be a small issue here."
Critical bugs get buried in hedging language; the author cannot tell what matters.

Counter: Use severity labels. Tone can be warm, but the level must be accurate.

```markdown
# BAD
不知道我理解得对不对，这里好像可能有一点点并发问题，不过也许我看错了...

# GOOD
[必须修复] 并发安全问题

这里的 map 在多个 goroutine 中同时读写，会触发 panic。
建议加 sync.RWMutex，或者换成 sync.Map。
复现方式：加 -race flag 跑测试就能看到。
```

### Anti-Pattern 2: Skipping Feedback for Senior Developers (不敢给高级开发者提意见)

Senior devs' PRs get instant Approve without real review. Dual standards erode trust.

Counter: Code Review is about the code, not the person. Use question-based framing.

```markdown
# Question-style (suitable for senior colleagues)
想请教一下，这里选择用递归而不是迭代，是出于什么考虑？
我在想如果递归深度超过 1000 层会不会有栈溢出的风险？

# Learning-style
学到了一个新写法！不过有个小疑问——这里的类型断言在运行时不会做检查，
如果上游数据结构变了，这里会静默通过。是否考虑加个 runtime validation？
```

### Anti-Pattern 3: Review Becomes a Style War (风格之争)

Dozens of comments about indentation, braces, and spaces while real bugs go unnoticed.

Counter: Delegate style to automated tools (ESLint, Prettier, gofmt, Black).
Focus reviews on logic, security, performance, and architecture.

### Anti-Pattern 4: Rubber-Stamp "LGTM" (只写 LGTM)

Approve without substance. Review becomes a formality; nobody is accountable.

Counter: Even when code is excellent, document what you reviewed.

```markdown
LGTM

审查了以下方面：
- 并发安全：锁的粒度合理
- 错误处理：所有外部调用都有 error handling
- 向下兼容：新增字段都有默认值，不影响老版本

一个小建议 [仅供参考]：第 78 行的变量名 `d` 可以改成 `duration`，更易读。
```

---

## 4. Bilingual Comment Conventions

When reviewing code in Chinese-speaking teams, follow these rules for when to use
Chinese vs English in code and comments.

### Use Chinese for

- **Business logic comments** — explain business context and requirement source
- **Complex algorithm notes** — write thought process so the whole team understands
- **TODO / FIXME** — describe action items in Chinese for easy search and tracking
- **Doc comments (internal projects)** — JSDoc/Javadoc description text in Chinese

```typescript
/**
 * 计算用户的会员等级折扣
 *
 * 业务规则：
 * - 普通会员 9.5 折
 * - 银卡会员 9 折
 * - 金卡会员 8.5 折
 * - 钻石会员 8 折
 *
 * @param level - 会员等级（MemberLevel enum）
 * @param amount - 原始金额（单位：分）
 * @returns 折后金额（单位：分）
 */
function calculateDiscount(level: MemberLevel, amount: number): number {
  // ...
}
```

### Use English for

- **Variable, function, and class names** — always English, follow team conventions
- **Git commit messages** — see Section 5
- **Open-source project comments** — English for international community
- **Error messages and logs** — avoid encoding issues in production
- **External-facing API docs** — English for public interfaces

### Mixed-language formatting

```typescript
// GOOD: space between Chinese and English text
// 使用 Redis 缓存来减少 MySQL 的查询压力

// BAD: no space between Chinese and English
// 使用Redis缓存来减少MySQL的查询压力

// GOOD: keep technical terms in English
// 这里用 debounce 防抖处理，避免频繁触发 API 请求

// BAD: force-translate technical terms
// 这里用防抖动处理，避免频繁触发应用程序接口请求
```

---

## 5. Commit Message Conventions

### Conventional Commits — bilingual formats

For internal Chinese teams, use Chinese descriptions:

```
<类型>(<范围>): <简要描述>

<详细说明（可选）>

<关联信息（可选）>
```

| Type | Meaning | Example |
|------|---------|---------|
| feat | New feature | feat(用户): 新增手机号登录功能 |
| fix | Bug fix | fix(支付): 修复微信支付回调重复处理的问题 |
| docs | Documentation | docs: 更新 API 接口文档 |
| style | Formatting | style: 统一缩进为 2 个空格 |
| refactor | Refactor | refactor(订单): 拆分订单服务，提取公共逻辑 |
| perf | Performance | perf(列表): 虚拟滚动优化长列表渲染性能 |
| test | Tests | test(auth): 补充登录模块单元测试 |
| chore | Build/tooling | chore: 升级 Node.js 至 v20 |

Full example:

```
fix(支付): 修复支付宝异步回调签名校验失败的问题

原因：升级 SDK 后签名算法从 RSA 变为 RSA2，但回调校验仍使用旧算法。
方案：回调处理中同时兼容 RSA 和 RSA2 签名校验。

Closes #1234
```

For international or mixed-language teams, use English commit messages:

```
fix(payment): fix Alipay async callback signature verification failure

The SDK upgrade changed the signature algorithm from RSA to RSA2,
but the callback handler still used the old algorithm.

Closes #1234
```

---

## 6. Red Flags (Universal Patterns Indicating Trouble)

Regardless of language, these patterns in a review signal deeper problems.

| Red Flag | What It Means | What To Do |
|----------|---------------|------------|
| PR has no description | Author assumes context; reviewers will guess | Ask author to add background and testing notes |
| PR exceeds 400 lines | High risk of superficial review | Suggest splitting into focused PRs |
| No tests changed | Feature or fix without test coverage | Request tests covering new behavior |
| `// TODO: fix later` | Known debt shipped without a plan | Ask for a linked issue with timeline |
| Massive copy-paste blocks | Divergent duplicates will drift and break | Suggest extraction into shared utility |
| Deep nesting (3+ levels) | Hidden edge cases, hard to reason about | Suggest early returns or guard clauses |
| Caught exceptions silently swallowed | Errors invisible in production | Request logging or explicit justification |
| String concatenation for SQL/HTML | Injection vulnerability | Flag as `[blocking]`, suggest parameterized query |
| Reviewer only comments on style | Real issues are being missed | Shift focus: logic, security, performance first |
| All comments are `[nit]` | Reviewer is avoiding substantive feedback | Encourage use of `[important]` and `[blocking]` |

---

*This reference is part of the code-review skill. For language-specific review guidance,
see the other files in the `references/` directory.*
