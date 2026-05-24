# Harness Engineering: Complete Practice Handbook for AI-Driven Engineering Teams

> Synthesizing Anthropic · InfoQ · Hacker News · X.com practice精华 + Claude tool-specific guidance
>
> March 2026

---

This handbook has two parts: **Part I** systematically organizes core Harness Engineering practices from Anthropic Engineering Blog, InfoQ, Hacker News, and X.com; **Part II** uses Claude Code CLI and Claude Agent SDK as concrete carriers to provide directly usable configuration templates, Hook scripts, and multi-Agent orchestration patterns.

---

# Part I: Core Concepts and Multi-Source Practice Synthesis

---

## I. What is Harness Engineering

> *Harness Engineering is the most important emerging paradigm shift in software engineering in 2026—transforming engineers' core work from "writing code" to "designing environments where AI agents work reliably."*

"Harness" derives from the horse harness metaphor: the model is the horse—powerful but unaware of direction; Harness is the reins, saddle, and bit—guiding power in the right direction.

> **📖 Mitchell Hashimoto (Terraform/HashiCorp founder) definition**
>
> "Whenever an agent makes a mistake, take the time to design a solution that ensures this mistake never happens again."

### Three Evolution Stages

| Stage | Period | Core Focus |
|-------|--------|------------|
| Prompt Engineering | 2022–2024 | Optimize instruction quality for single inference |
| Context Engineering | 2025 | Ensure model gets correct context during inference |
| **Harness Engineering** | **2026–** | **Architect constraints, feedback loops, and verification mechanisms at system level** |

> **🧠 Hacker News Core Insight**
>
> "More accurate understanding: AI = cybernetic system of LLM + Harness. When Harness improvements provide benefits comparable to model improvements themselves, both must be equally valued." *(logicprog, HN)*

### 1.1 Four Core Components of Harness

| Component | Content | Core Source |
|-----------|---------|-------------|
| **Context Engineering** | Continuously enriched knowledge base (CLAUDE.md, design documents, architecture diagrams) and dynamic observability data access | OpenAI / Anthropic |
| **Architecture Constraints** | Mechanically enforce dependency hierarchies, module boundaries, data structure specifications through Linters and structured tests | OpenAI Codex Team |
| **Verification & Feedback** | CI pipelines, unit tests, integration tests; each failure triggers Harness improvement rather than manual fix | Mitchell Hashimoto |
| **Garbage Collection** | Periodically run cleanup agents to detect document staleness, architecture drift, code entropy, automatically submit fix PRs | OpenAI / Martin Fowler |

---

## II. Anthropic Practice: Long-Running Task Harness Design

> 📌 Source: Anthropic Engineering Blog — *"Effective harnesses for long-running agents"* (Nov 2025) & *"Harness design for long-running application development"* (2026)

### 2.1 Core Challenge: Memory Fragmentation

Each new session starts with the Agent having no memory of previous events. Two typical failure patterns:

1. **Greedy Execution Mode**: Agent tries to complete entire task at once, causing context overflow, leaving next session with half-completed and undocumented code
2. **Premature Completion Mode**: Later sessions see "existing progress" and declare completion, leaving unimplemented features

### 2.2 Dual-Agent Solution

> **🏗️ Initializer Agent**
>
> Runs only once, establishes Git repository structure, creates JSON-formatted feature list, generates progress tracking file, laying solid foundation for subsequent sessions.

> **⚙️ Coding Agent**
>
> Ritual startup each session: confirm location → read progress document → review feature list → run existing tests → begin implementation. Leaves clean code state after completing each feature for next session.

### 2.3 Structured Handoff Artifacts

- **JSON-formatted feature list**: More respected by Agent than Markdown, won't be accidentally modified
- **Git history**: Can be read by subsequent sessions to understand completed work
- **Progress file**: Explicitly records "completed / in-progress / pending" status

### 2.4 GAN-Inspired Three-Agent Architecture (Advanced)

| Role | Responsibility | Key Constraints |
|------|----------------|-----------------|
| **Planner** | Convert high-level Brief into product specifications, maintain high-level perspective | Avoid introducing implementation error cascades |
| **Generator** | Implement features in sprint batches, each batch verifiable | Single-point breakthrough, reduce context pollution |
| **Evaluator** | Interactive testing of running application with Playwright, four-dimension scoring | Separate creator and reviewer roles |

> **💰 Empirical Data**
>
> - No evaluation architecture: 20 minutes, $9 — produces unusable features
> - Complete three-agent Harness: 6 hours, $200 — delivers fully functional application with significantly better UX
>
> Evaluator agent caught issues like routing order errors, missing entity connections, and improper tool implementations that Generator agent "confidently released."

### 2.5 Key Principles

- **Context reset is better than infinite compression**: For context-anxious models, periodic clearing and structured handoff is more effective than continuous accumulation
- **Never let creators independently review their own output**: Models cannot reliably self-assess; separating generation and evaluation roles is fundamental to reliability
- **Simplify Harness as models evolve**: When new models solve certain failure types, proactively remove corresponding scaffolding

---

## III. OpenAI Practice: One Million Lines of Code, Zero Human Written

> 📌 Source: OpenAI Engineering Blog *"Harness engineering: leveraging Codex in an agent-first world"* (Feb 2026) · InfoQ coverage

OpenAI Codex team used five months and three engineers to guide Codex agents in generating over 1 million lines of production-grade code, with zero manual coding.

### 3.1 Core Engineering Insight

"Early progress was slow, not because Codex lacked capability, but because **the environment was underspecified**. When failing, the solution was almost never 'try harder,' but rather ask: what capability is missing, and how to make it legible and enforceable for the agent?"

### 3.2 Knowledge Base Architecture: Map Not Encyclopedia

❌ **Anti-pattern** — A "giant CLAUDE.md":
- Large context footprint, important constraints get buried
- Agent matches local patterns rather than global navigation
- Immediately stale, cannot be mechanically verified

✅ **Correct pattern** — CLAUDE.md ~60 lines as "table of contents", pointing to structured knowledge base in `docs/` directory:
- `docs/architecture.md` — architecture diagram (domain map)
- `docs/design/` — design specifications (execution plan)
- `docs/quality.md` — quality scoring document (current state per domain)
- `docs/decisions/` — decision records (ADR)

All documents cross-linked, consistency enforced by Linter and CI.

### 3.3 Enforced Architecture Layers

Dependency flows unidirectionally, mechanically enforced through custom Linter and structured tests:

```
Types  →  Config  →  Repo  →  Service  →  Runtime  →  UI
```

Each layer can only import dependencies from layers to its left — enforced by structural tests, not suggestions.

| Layer | Responsibility | Can Depend On | Typical Content |
|-------|----------------|---------------|-----------------|
| **Types** | Globally shared data structures, interfaces, enums, constants | None | `User`, `OrderStatus`, `MAX_RETRY` |
| **Config** | Read environment variables, parse configuration, unified external exposure | Types | `dbConfig`, `appConfig` |
| **Repo** | Single read/write entry point for database/cache/external storage | Types, Config | `findUserById()`, `saveOrder()` |
| **Service** | Business logic, validation, transaction orchestration | Types, Config, Repo | `promoteToAdmin()`, `placeOrder()` |
| **Runtime** | Expose Service externally: HTTP routes, queue consumers, scheduled tasks | All above | `handleRequest()`, `consumeEvent()` |
| **UI** | Frontend components and pages, communicate with backend only via API | Types + Runtime API | React components, page routes |

**Meaning for Agent**: Layer constraints prevent Agent from writing SQL directly in UI, scattering `process.env` in Service, structural tests automatically intercept cross-layer erroneous references in CI, violating rules causes Build failure.

### 3.4 Quantified Results

| Metric | Value | Context |
|--------|-------|---------|
| Code Output | Over 1 million lines, 1500+ PRs | 5 months |
| PRs per Engineer per Day | 3.5 PRs / engineer / day | Initial 3-person team |
| Velocity Change | Throughput continued to increase as team expanded to 7 | Better Harness amplified human efficiency |
| Relative Time Efficiency | Approximately 1/10 of manual coding time | OpenAI estimate |

---

## IV. Community Wisdom: Practice Insights from Hacker News and X.com

> 📌 Source: HN — *"Improving 15 LLMs at Coding in One Afternoon. Only the Harness Changed"* / *"Effective harnesses for long-running agents"*

### 4.1 Hacker News Core Discussion

> **🎯 "The model is the moat, Harness is the bridge"**
>
> "The gap between 'cool demo' and 'reliable tool' is not model magic, but serious, tedious empirical engineering at tool boundaries." *(chrisweekly, HN)*

> **💸 "Tokens are resources, manage like CPU/RAM"**
>
> "Using Claude Code `/cost` command to see session dollar cost is a good benchmark for measuring CLAUDE.md and various Harness components." *(chasd00, HN)*

> **⚠️ "MCP overuse is a trap"**
>
> "MCP is overused for everything — using billion-parameter models to decide how to call is usually completely unnecessary. MCP is the hammer that makes everything look like a nail." *(robbomacrae, HN)*

### 4.2 Mitchell Hashimoto's Six-Stage AI Adoption Path

> 📌 Source: mitchellh.com *"My AI Adoption Journey"* · X.com @mitchellh

| Stage | Content | Key Insight |
|-------|---------|-------------|
| Stage 1 | Switch from Chat interface to Agent (tool call loop body) | Chat interface not suitable for coding tasks |
| Stage 2 | Explore boundaries of what Agent excels at and struggles with | Understanding boundaries more valuable than blind usage |
| Stage 3 | Efficiency approaches manual — not faster but not slower | Force yourself to complete same task twice for calibration |
| Stage 4 | Block time method: launch Agent for asynchronous work 30 minutes before end of day | Deep research, parallel exploration, issue classification most valuable |
| **Stage 5 ★** | **Build Harness: every Agent mistake, engineer to prevent recurrence** | **This is the core stage, benefits compound** |
| Stage 6 | Keep Agent running continuously — if no Agent running, ask "what task is suitable" | Agent background execution occupies 10–20% of workday |

### 4.3 Stripe "Minions" Enterprise-Scale Practice

- Produces over **1000 merged Pull Requests** weekly
- Developers post tasks in Slack, Agent writes code, passes CI, opens PR — fully non-interactive
- Agent runs in isolated "devbox", connected to **400+ internal tools** via MCP server
- **Key Insight**: Give Agent same tools and context as human engineers, rather than after-the-fact patchwork integration

---

## V. Team Practice Guide: Gradual Implementation Path

### 5.1 Immediately Actionable (Day 1)

1. **Create CLAUDE.md** — Tech stack, test commands, prohibited rules, coding conventions, strictly controlled within 60 lines
2. **Review Pre-commit Hooks** — Ensure Linter, formatter, type checking run locally — provide immediate feedback for Agent
3. **Establish "Failure = Improvement" Reflex** — When Agent makes mistake, first reaction is "how to prevent it forever?" then update configuration or add tools

### 5.2 Complete This Week (Week 1)

1. **Establish `docs/` knowledge base structure** — Create architecture diagrams, domain maps, ADRs; streamline CLAUDE.md to table of contents pointing to these documents
2. **Introduce Initializer + Coding dual-Agent pattern** — Initializer Agent creates JSON feature list and progress file; Coding Agent reads status on each startup
3. **Measure baseline** — Record Token cost per session, establish comparison benchmark

### 5.3 Establish This Month (Month 1)

1. **Mechanize architecture constraints** — Enforce dependency hierarchy with custom Linter or structural tests, CI automatically fails on violation
2. **Separate generation and evaluation roles** — Introduce independent Evaluation Agent, never let creator independently review their own output
3. **Establish "garbage collection" mechanism** — Periodically run cleanup Agent, scan for stale documents, architecture drift, automatically create PR fixes
4. **Build Skills library** — Package high-frequency tasks as independent instruction files, load on demand

> **🔁 Core Loop**
>
> Agent fails → Identify missing capability → Engineer fix (update document / add Linter / build tool) → This failure **never happens again**.
>
> This loop is the essence of Harness Engineering.

### 5.4 Continuous Evolution Principles

- **Simplify Harness as models iterate**: Proactively remove unnecessary scaffolding after new model releases
- **Constraints empower, not restrict**: Stricter architecture constraints lead to more reliable Agent output — counterintuitive but empirically supported
- **Context is scarce resource**: Critically examine every addition to context window
- **Keep humans at decision points**: For irreversible operations, security changes, Harness should automatically introduce human approval

---

## VI. Team Harness Health Checklist

### 6.1 Agent Legibility Score (OpenAI Scorecard)

| Evaluation Dimension | Check Question | Action Suggestion |
|---------------------|----------------|-------------------|
| Bootstrap Self-Sufficiency | Can Agent complete first configuration self-test without human intervention? | Check if init script is automated |
| Task Entrypoints | Are entry tasks clearly discoverable? | Check task navigation in CLAUDE.md |
| Validation Harness | Can CI / tests automatically verify Agent output? | Check CI coverage and speed |
| Lint + Format Gates | Does format checking run automatically in pre-commit? | Check for local Hooks |
| Agent Repo Map | Does repository have clear domain architecture diagram? | Check docs/architecture.md |
| Structured Docs | Are design documents structured, versioned, cross-linked? | Check docs/ directory completeness |
| Decision Records | Are architecture decisions recorded and maintained in ADRs? | Check adr/ or docs/decisions/ |

### 6.2 Weekly Harness Maintenance Ritual

1. **Failure Analysis (10 minutes)** — Review this week's Agent failure cases, convert each failure into a Harness improvement
2. **Document Freshness Check (5 minutes)** — Confirm CLAUDE.md and docs/ contain no stale rules or broken links
3. **Cost Baseline Comparison (5 minutes)** — Compare this week vs last week Token usage trends, identify abnormal growth
4. **Harness Simplification (as needed)** — With model updates, evaluate and remove unnecessary scaffolding components

---

# Part II: Claude Tool-Specific Practice Guide

> *Engineering practice handbook using Claude Code CLI · Claude Agent SDK as examples*

---

## A. Claude Code Harness Six-Layer Model

> *Claude Code's Harness is not a single configuration file, but six collaborating layers. Understanding each layer's responsibility is key to avoiding "more configuration = more confusion."*

| Layer | Component / Location | Core Responsibility |
|-------|---------------------|---------------------|
| ① Memory Layer | `CLAUDE.md` (project root / subdirectory / `~/.claude/CLAUDE.md`) | Static knowledge: architecture conventions, prohibited rules, test commands — always visible to Agent |
| ② Rules Layer | `.claude/settings.json` (permissions, model, output style) | Deterministic behavior: settings.json-controlled behavior won't be forgotten or ignored by Agent |
| ③ Skills Layer | `.claude/skills/` + `.claude/commands/` | On-demand knowledge: Skills auto-activate, Slash Commands manually triggered |
| ④ Agent Layer | `.claude/agents/` (dedicated Subagent definitions) | Context isolation: delegate file re-reading / large output tasks, keep main thread clean |
| ⑤ Hooks Layer | Hooks (PreToolUse / PostToolUse / Stop etc.) | Deterministic enforcement: doesn't depend on model judgment, mechanical guarantee |
| ⑥ Tools Layer | MCP Servers (external service access) | Capability extension: database, GitHub, Slack, Playwright etc., access on demand |

> **⚠️ Single-Layer Failure Trap**
>
> CLAUDE.md rules used alone get occasionally ignored; Hooks alone cannot handle judgment tasks; Settings.json alone lacks context. **All three working together are truly effective.**

---

## B. CLAUDE.md Engineering Design

> *ETH Zurich research: AI-generated CLAUDE.md causes performance degradation and 20% more Token consumption; manually written and streamlined files are truly effective.*

### B.1 Layer Override Mechanism

```
~/.claude/CLAUDE.md             ← Personal global rules (applies to all projects)
project-root/CLAUDE.md          ← Project-level rules (team-shared, tracked in Git)
project-root/backend/CLAUDE.md  ← Subdirectory rules (appended, not overridden)
project-root/frontend/CLAUDE.md
```

### B.2 Streamlined Template (≤60 Line Principle)

```markdown
# Project: [Name] — CLAUDE.md

## Tech Stack
- TypeScript strict mode, Node.js 22, React 18, PostgreSQL via Prisma
- Package manager: pnpm (npm / yarn prohibited)

## Key Commands
- Test: `pnpm test` | Watch: `pnpm test:watch`
- Build: `pnpm build` | Type check: `pnpm typecheck`
- Database migration: `pnpm db:migrate`

## Architecture Conventions
- Dependency direction: types → config → repo → service → api → ui (reverse prohibited)
- All public APIs must have JSDoc comments
- New code must have corresponding tests (coverage >80%)

## Prohibited Rules
- Never delete database migration files
- Never hardcode secrets / API keys in code
- Must pass typecheck before commit (see Stop Hook)

## More Context
- Architecture diagram: docs/architecture.md
- Design decisions: docs/decisions/
- Long task progress: docs/claude-progress.json
```

✅ **Good rule example**: "Never delete migration files" — specific, verifiable, corresponds to past real Agent failures

❌ **Bad rule example**: "Write high-quality code" — vague, unverifiable, consumes Tokens without producing binding force

### B.3 Three Mechanisms Division of Labor

| Mechanism | Suitable Scenario |
|-----------|-------------------|
| `CLAUDE.md` (static) | Team-shared conventions; tracked in Git; generate draft with `/init` then manually streamline |
| Auto Memory (dynamic) | Claude automatically saves session learning (build commands, debugging insights); persists across sessions; manage with `/memory` |
| `settings.json` (deterministic) | Any behavior that "must happen, independent of Claude judgment" (like `attribution.commit`) goes here |

### B.4 docs/architecture.md Detailed Explanation

> *This is the file linked by `- Architecture diagram: docs/architecture.md` in CLAUDE.md. Its core goal is simple: enable Agent to quickly establish spatial awareness of the entire system at the start of a new session — knowing where code is, how modules are divided, and where to find what.*

#### Typical Content Structure

**1. System Overview Map**

Describe "what this system is, what components it has" in simplest terms:

```markdown
## System Overview

This is a SaaS collaboration platform where users can create projects, invite members, and manage tasks.
Mainly consists of three subsystems:

- **API Service**: Handles all client requests (REST + WebSocket)
- **Worker Service**: Handles asynchronous tasks (emails, notifications, data exports)
- **Admin Service**: Internal management backend, only accessible on intranet
```

**2. Directory Structure Explanation**

Tell Agent "what goes in each directory", more precise than README:

```markdown
## Directory Structure

src/
├── types/        # Shared type definitions, interfaces, enums (no business logic)
├── config/       # Configuration reading, unified environment variable access
├── repo/         # Database access layer, only CRUD, no business judgment
├── service/      # Business logic layer, all core computation here
├── runtime/      # Application entry, route registration, middleware
└── ui/           # Frontend components

tests/
├── unit/         # Unit tests, no database startup
├── integration/  # Integration tests, use test database
└── architecture/ # Architecture constraint tests (dependency direction check) ← See below

docs/
├── architecture.md        ← This file
├── decisions/             # Architecture decision records (ADR)
├── design/                # Design documents for each functional module
└── claude-progress.json   # Agent long task progress tracking
```

**3. Layer Dependency Rules (Most Important)**

Write architecture constraints clearly so Agent knows boundaries. This is the expanded version of "Architecture Conventions" line in CLAUDE.md:

```markdown
## Dependency Direction Rules

Allowed dependency directions (only rightward references: Agent sometimes likes shortcuts):

  types → config → repo → service → runtime → ui

Prohibited rules:
- repo layer cannot import service layer (data layer cannot have business logic)
- types layer cannot import any other layer (pure type definitions)
- ui components cannot directly import repo layer (must go through service)

Cross-cutting concerns (auth, logging, feature flag) are uniformly injected through Providers interface, cannot be passed directly between layers.

These rules are automatically verified by structured tests in tests/architecture/.
CI automatically fails on violation, error message includes specific fix.
```

**4. Key Module Explanation**

One-sentence explanation for complex modules, tell Agent where to find them:

```markdown
## Key Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| Authentication | src/service/auth/ | JWT issuance, refresh, revocation |
| Permission | src/service/permission/ | RBAC rules, all permission judgment entry points |
| Notification | src/service/notification/ | Unified sending of emails, in-app messages, Webhooks |
| Task Queue | src/service/queue/ | Async task enqueue and scheduling |
| File Storage | src/repo/storage/ | S3 upload/download wrapper |
```

**5. External Dependency Explanation**

```markdown
## External Dependencies

| Service | Purpose | Access Location |
|---------|---------|----------------|
| PostgreSQL | Primary database | src/repo/db/ |
| Redis | Session cache, queue | src/repo/cache/ |
| S3 | File storage | src/repo/storage/ |
| SendGrid | Email sending | src/service/notification/ |
| Stripe | Payment processing | src/service/billing/ |
```

**6. Links to Deeper Documentation**

```markdown
## Further Reading

- Authentication system detailed design → docs/design/auth.md
- Payment flow sequence diagram → docs/design/billing-flow.md
- Database Schema → docs/design/schema.md
- Important architecture decisions → docs/decisions/
```

#### Writing Principles

architecture.md and CLAUDE.md share several counterintuitive requirements:

| Principle | Wrong Approach | Correct Approach |
|-----------|---------------|------------------|
| **Write for Agent, not human** | "Everyone knows this" | Write down any information affecting Agent decisions |
| **Precision over comprehensiveness** | "Code should be elegant" | "All public functions must have JSDoc, otherwise lint fails" |
| **Verifiability over readability** | Soft suggestions | Clearly write "where automatic checks occur, what happens when violated" |
| **Keep short, use links for layering** | Put everything in one file | Keep this file to 100–150 lines, complex subsystems have separate design documents |

> This is the concrete implementation of OpenAI's emphasis on "map not encyclopedia" — architecture.md is the index, not the entire book.

### B.5 docs/decisions/ Detailed Explanation (ADR Architecture Decision Records)

> *The directory linked by "Important architecture decisions → docs/decisions/" in architecture.md. It solves one core problem: Agent has no historical memory, starting fresh each session. Without ADR, it may "helpfully" rewrite code in what it thinks is a better way, destroying intentional design.*

#### Why Agents Particularly Need It

Without ADR, there are many "unexplained constraints" in code:

```
// Why not use Redis directly here, need to go through cache/?
// Why not use JWT for sessions, store in database?
// Why does this interface go through message queue instead of synchronous call?
```

Human engineers can ask colleagues, Agent doesn't have this option. It can only guess — and guessing wrong destroys deliberate design.

ADR solidifies these "why" reasons in the repository. When Agent reads them, it knows: **This is a deliberate decision, don't change it.**

#### Single ADR File Template

Filename with number and title, e.g., `0012-use-redis-for-session.md`:

```markdown
# ADR-0012: Use Redis for User Sessions

**Status**: Accepted
**Date**: 2025-11-03
**Deciders**: @zhang-wei, @li-fang

---

## Context

User session data is currently stored in PostgreSQL. As DAU grows to 500,000,
querying the database on every request causes P99 latency to exceed 800ms, which is unacceptable.

## Considered Options

**Option A: PostgreSQL + Connection Pool Optimization**
- Pros: No new components, simple operations
- Cons: Session read/write is hot spot, connection pool only treats symptoms

**Option B: Redis**
- Pros: In-memory read/write, latency <1ms; TTL naturally supports session expiration
- Cons: Requires persistence configuration, one more maintenance component

**Option C: JWT Stateless Scheme**
- Pros: No storage needed at all
- Cons: Cannot actively revoke Token, security team explicitly opposed

## Decision

Choose Option B (Redis). Session data is a typical scenario of "read-heavy, write-light, with expiration time".
Security team requires retaining active revocation capability, eliminating JWT.

## Consequences (Binding for Agent)

- ❌ Prohibited: repo layer directly imports Redis client
  → Must go through src/repo/cache/ wrapper
- ❌ Prohibited: store objects larger than 10KB in Redis
  → Store large objects in S3, Redis only stores reference ID
- ✅ Session TTL uniformly managed in SessionRepo, don't hardcode separately
- Next review: Re-evaluate whether Redis Cluster is needed when DAU exceeds 2 million
```

**The "Consequences" section is what Agent most needs to read** — it translates decisions into enforceable constraints, telling Agent "don't touch this, must go there".

#### Directory Organization

```
docs/decisions/
├── README.md              ← Decision index, one-line summary of all ADRs
├── 0001-monorepo.md
├── 0002-typescript.md
├── 0003-postgresql.md
├── 0012-redis-session.md
└── 0015-deprecate-rest.md ← Deprecated decisions also retained
```

`README.md` is Agent's entry point, read index first, then dive deeper as needed:

```markdown
# Architecture Decision Index

| Number | Title | Status | Date |
|--------|-------|--------|------|
| 0001 | Adopt Monorepo Structure | Accepted | 2024-03 |
| 0002 | TypeScript Strict Mode | Accepted | 2024-03 |
| 0012 | Redis for User Sessions | Accepted | 2025-11 |
| 0015 | Migrate Some Interfaces to GraphQL | **Deprecated** | 2025-08 |
```

**"Deprecated" decisions are equally important** — let Agent know "this path was tried, abandoned, reasons here", preventing it from repeating mistakes.

#### Writing Tips

| Tip | Explanation |
|-----|-------------|
| **Write trigger conditions in context** | Not "we want to use Redis", but "P99 latency exceeds 800ms, unacceptable" — Agent needs to know constraint urgency |
| **Must list rejected options** | Agent may independently think of these options; seeing they were rejected and why prevents it from bringing them up again |
| **Write prohibited rules in consequences** | Use "❌ Prohibited X, must go Y" format, more binding for Agent than prose |
| **Must maintain status field** | When decision is overturned, change status to "Deprecated" and explain why, don't delete file |
| **Keep to one screen length** | ADR is not design document, 50–80 lines of core content sufficient, details link to design/ |

#### Division of Labor with Other Documents

```
CLAUDE.md          → "Prohibited: service layer directly uses Redis" (rule itself)
architecture.md    → "Redis access location: src/repo/cache/" (location info)
docs/decisions/    → "Why designed this way, what was excluded, when to re-evaluate" (decision context)
docs/design/       → Specific implementation details of Redis wrapper layer
```

Four files each have their role. Agent decides where to read based on task type — implement new feature reads CLAUDE.md and architecture.md, encounter unclear constraints reads decisions/, need implementation details reads design/.

---

## C. Hooks System: Deterministic Quality Gates

> *Hooks are Claude Code Harness's "deterministic enforcement layer" — regardless of Agent's judgment, Hooks always execute. They are the most powerful tool for implementing the "make mistakes never happen again" principle.*

**Judgment criterion**: "Must this behavior always occur, regardless of Claude's judgment?" → If yes, use Hook; otherwise use CLAUDE.md.

### C.1 Hook Event Types

| Hook Event | Trigger Timing | Typical Use Case |
|------------|---------------|------------------|
| `PreToolUse` | Before tool call, can intercept or modify parameters | Block dangerous commands; restrict file access scope |
| `PostToolUse` | Immediately after tool completion | Auto-formatting; measure Token consumption |
| `Stop` | After main Agent completes response | TypeScript type checking; test coverage report |
| `UserPromptSubmit` | Before user submits Prompt | Inject additional context; injection prevention detection |
| `TaskCompleted` | When task marked complete (new in 2026) | Trigger CI; update progress file |

### C.2 Practical Hook Examples

#### Stop Hook — TypeScript Type Checking Enforcement Gate

```bash
#!/bin/bash
# .claude/hooks/stop-typecheck.sh
cd "$CLAUDE_PROJECT_DIR"

# Run formatting and type checking in parallel (accelerate feedback loop)
biome check --write . > /dev/null 2>&1 || biome check --write . > /dev/null 2>&1

TYPECHECK=$(pnpm typecheck 2>&1)
if [ $? -ne 0 ]; then
  echo "Type checking failed, please fix the following errors:" >&2
  echo "$TYPECHECK" >&2
  exit 2   # exit 2 = Feed error back to Claude, Claude will continue working
fi
exit 0    # Silent exit on success, don't pollute context
```

#### PreToolUse Hook — Block Dangerous File Operations

```bash
#!/bin/bash
# .claude/hooks/pre-protect-env.sh
TOOL_INPUT=$(cat)
FILE_PATH=$(echo "$TOOL_INPUT" | jq -r '.tool_input.path // empty')

if [[ "$FILE_PATH" == *".env"* ]] || [[ "$FILE_PATH" == *"secret"* ]]; then
  echo "Rejected: Access to sensitive file $FILE_PATH prohibited" >&2
  exit 2
fi
exit 0
```

#### PostToolUse Hook — Auto Formatting (Silent on Success, Visible on Failure)

```bash
#!/bin/bash
# .claude/hooks/post-format.sh
# Key principle: completely silent on success, only output on failure
# 4000 lines of pass logs cause Agent to lose task focus (HumanLayer lesson)
cd "$CLAUDE_PROJECT_DIR"
FORMAT_OUTPUT=$(pnpm lint:fix 2>&1)
if [ $? -ne 0 ]; then
  echo "Formatting failed:" >&2
  echo "$FORMAT_OUTPUT" >&2
fi
# Success = completely silent
```

### C.3 Hooks Configuration Example (settings.json)

```json
// .claude/settings.json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [{ "type": "command", "command": ".claude/hooks/stop-typecheck.sh" }]
    }],
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{ "type": "command", "command": ".claude/hooks/pre-protect-env.sh" }]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{ "type": "command", "command": ".claude/hooks/post-format.sh" }]
    }]
  }
}
```

---

## D. Subagents and Context Isolation Strategy

> *Subagent's core value is not parallelism, but isolation — delegate tasks producing large output, main thread only receives summary.*

### D.1 Two Orchestration Patterns

| Pattern | Suitable Scenarios & Trade-offs |
|---------|-------------------------------|
| **Master-Clone Architecture (Recommended)** | Main Agent context contains full CLAUDE.md; use built-in `Task(...)` to clone itself for subtasks; Agent autonomously decides when to delegate, dynamically flexible; enables cross-domain holistic reasoning |
| **Lead-Specialist Architecture (Caution)** | Predefine dedicated Subagents in `.claude/agents/`; high rigidity, manual triggering required; suitable for security-sensitive tasks requiring permission isolation |

> **💡 Master-Clone Core Advantage**
>
> Main Agent can reason holistically about changes ("What's the impact of modifying this API endpoint on all downstream consumers?"), while Lead-Specialist pattern's Specialists can only see their own context and cannot cross-domain reason.

### D.2 Security Review Subagent Definition Template

```yaml
# .claude/agents/security-reviewer.md
---
name: security-reviewer
description: >
  Professional security code review. Auto-invoke in following cases: pre-commit review,
  new authentication/authorization logic, external API integration, user input handling.
tools: Read, Grep, Glob, Bash
model: opus
---
You are a senior security engineer specializing in:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication and authorization flaws
- Secrets or credentials in code

Do not modify code — only provide review reports with filenames and line numbers.
```

### D.3 Explore Subagent — Context-Efficient Exploration

```bash
# Explicitly use Explore in Prompt
"use subagent to research how our authentication system handles token refresh,
  and whether there are reusable OAuth utility functions."

# Effect: Claude uses Haiku model to scan files (low cost),
# only returns summary to main thread, main thread tokens unaffected
```

---

## E. Context Management: Most Critical Engineering Decision

> *Context is Claude Code's most scarce resource. Context pollution is the primary cause of long task failure.*

### E.1 Context Health Metrics

| Metric | Target Value & Action Suggestion |
|--------|-------------------------------|
| Baseline Cost (New Session) | `< 20k Token` (~10% of 200k window); check with `/context` |
| CLAUDE.md Size | `< 2000 Token`; split to `docs/` subdirectory if exceeded |
| MCP Tools Total Token | `< 20k Token`; too many tools cause selection noise, access on demand |
| Manual `/compact` Timing | Manually compress when reaching 50% usage, avoid waiting for Agent auto-trigger |
| Context Clear Frequency | Use `/clear` every 60k Token or when switching tasks |
| Test Pass Output | **Completely silent** on success, only show failure — pass logs pollute context |

### E.2 Model Selection Strategy (Cost × Capability)

| Scenario | Recommended Model | Reason |
|----------|------------------|--------|
| Plan Mode / Architecture Design | **Opus** | Complex reasoning, worth higher cost; planning errors most expensive |
| Daily Coding Implementation | **Sonnet** | Best balance of speed and quality; optimal choice for 90% of tasks |
| File Exploration / Explore Agent | **Haiku** | Massive file reading, cost-sensitive; summary quality sufficient |
| Parallel Tasks (Git Worktrees) | **Sonnet × N** | Multi-instance parallel, prioritize individual cost control |
| Deep Debug / Complex Refactoring | **Opus (deep mode)** | 30+ minute tasks, prioritize quality over speed |

### E.3 Git Worktrees Parallel Development

```bash
# Claude Code automatically manages Worktree lifecycle
claude --worktree feature-auth
claude --worktree feature-payment
claude --worktree refactor-db

# Each Worktree: independent branch + independent filesystem state + independent Claude session

# Manual way
git worktree add ../myapp-auth -b feature/auth
cd ../myapp-auth && claude "Implement JWT authentication system"
```

> **📌 Parallel Limit Recommendation**: 2–3 concurrent locally is optimal; more instances consider cloud development environments (each Agent in separate container).

---

## F. Claude Agent SDK: Long-Running Task Implementation

> *For tasks requiring hours or even days (or multi-person tasks), need to build dedicated Harness with Claude Agent SDK to achieve persistent engineering across context windows.*

### F.1 SDK Harness File Structure

```
project-root/
├── docs/
│   ├── claude-progress.json     ← Progress tracking (JSON format, not Markdown)
│   ├── features.json            ← Feature list (structured, Agent won't accidentally modify)
│   ├── architecture.md
│   └── decisions/              ← ADR records
├── .claude/
│   ├── agents/                 ← Subagent definitions
│   ├── skills/                 ← Skills directory
│   ├── commands/               ← Custom Slash Commands
│   ├── hooks/                  ← Hook scripts
│   └── settings.json
├── CLAUDE.md                   ← Streamlined table of contents (< 60 lines)
└── CLAUDE.md                   ← Team-level Agent conventions (optional)
```

### F.2 Progress File Design and Maintenance (claude-progress.json)

Use JSON instead of Markdown: Agent respects structured data significantly more than plain text, won't accidentally overwrite or delete records.

**Maintenance principle: Written by Agent, supervised by humans.** Human engineers only edit directly in two cases: requirements change causing task list change, Agent wrote incorrectly needing correction.

#### Complete Structure Example

```json
{
  "project": "User Collaboration Platform",
  "created_at": "2026-03-30T08:00:00Z",
  "last_updated": "2026-03-30T11:30:00Z",
  "current_phase": "implementation",

  "completed_features": [
    {
      "id": "F001",
      "name": "User Registration & Login",
      "status": "done",
      "commit": "a3f8c2d",
      "completed_at": "2026-03-30T11:30:00Z",
      "test_coverage": "87%",
      "notes": "Password reset deferred to F006, not included in current implementation"
    }
  ],

  "in_progress": {
    "id": "F002",
    "name": "JWT Authentication Refresh",
    "started_at": "2026-03-30T11:30:00Z",
    "current_step": "Token issuance completed, refresh logic not started",
    "files_touched": [
      "src/service/auth/jwt.service.ts",
      "src/repo/token.repo.ts"
    ],
    "blockers": []
  },

  "pending_features": [
    {"id": "F003", "name": "OAuth Third-Party Login", "priority": 3},
    {"id": "F004", "name": "RBAC Permission Management", "priority": 4},
    {"id": "F005", "name": "Audit Logs", "priority": 5}
  ],

  "session_startup_checklist": [
    "Run pwd to confirm working directory",
    "Read this file to understand current status",
    "Read docs/features.json to understand complete requirements and acceptance criteria",
    "Run pnpm test to confirm baseline, record failure count",
    "Confirm in_progress feature, continue or mark complete before taking next"
  ],

  "notes": [
    {
      "type": "scope_concern",
      "feature_id": "F003",
      "message": "OAuth implementation discovered data consistency risk with same-email account auto-merging, recommend human confirmation of acceptance criteria",
      "raised_at": "2026-03-30T14:00:00Z",
      "resolved": false
    }
  ]
}
```

#### File Lifecycle

```
Initializer Agent (first run)
  → Create file skeleton, write all pending_features
  → Establish session_startup_checklist

Coding Agent (before each session ends)
  → Move completed feature from in_progress to completed_features
  → Move next feature from pending_features to in_progress
  → Update current_step and files_touched
  → Record blockers or notes
  → Update last_updated timestamp

/harness:dump command (human manually triggered)
  → Agent appends key session decisions to notes
```

#### Recording Blockers

When Agent gets stuck, it should record the blocker and stop, waiting for human intervention instead of guessing:

```json
"in_progress": {
  "id": "F003",
  "blockers": [
    {
      "id": "B001",
      "description": "Google OAuth callback URL needs configuration in Google Console, no permission currently",
      "blocked_at": "2026-03-30T14:20:00Z",
      "needs_human": true,
      "workaround": "Can implement main flow with mock OAuth first, connect real interface after configuration"
    }
  ]
}
```

Human sees `needs_human: true` and intervenes, Agent continues in next session.

#### Three Designs to Prevent Agent Tampering

```
1. completed_features is append-only, never delete or modify
   → Clearly state in startup Prompt: completed_features is append-only
     historical record, never delete or modify existing entries

2. Use id instead of name for references
   → Avoid spelling ambiguities like "用户注册登陆" vs "用户注册登录"

3. Stop Hook automatically commits progress file
   → Full git history for each session, any error rollbackable
```

```bash
# .claude/hooks/stop-commit-progress.sh
cd "$CLAUDE_PROJECT_DIR"
if git diff --quiet docs/claude-progress.json; then
  exit 0  # No changes, skip
fi
git add docs/claude-progress.json
git commit -m "chore: update agent progress [skip ci]"
```

---

### F.3 Requirements File Design and Maintenance (features.json)

`features.json` is the "product requirements document", recording what to do. Reason for separating from `claude-progress.json`: **Requirements are relatively stable, progress changes frequently. Separating them prevents Agent from accidentally modifying requirements when updating progress.**

#### Complete Structure Example

```json
{
  "version": "1.0",
  "product": "User Collaboration Platform",
  "last_updated": "2026-03-30T08:00:00Z",
  "updated_by": "zhang-wei",

  "features": [
    {
      "id": "F001",
      "name": "User Registration & Login",
      "priority": 1,
      "status": "done",

      "description": "Support email registration, login, password reset. Does not include third-party login (see F003).",

      "acceptance_criteria": [
        "Email + password registration succeeds, duplicate email returns 409",
        "Login succeeds returns access_token and refresh_token",
        "Wrong password returns 401, does not reveal whether email exists or password wrong",
        "5 consecutive failures returns 429 and locks account for 15 minutes"
      ],

      "out_of_scope": [
        "Phone registration (excluded by product decision, see ADR-0018)",
        "Remember me feature (handled by F008)"
      ],

      "dependencies": [],

      "technical_notes": "Passwords use bcrypt, cost factor 12. Tokens stored in Redis, see ADR-0012.",

      "related_files": [
        "src/service/auth/",
        "src/repo/user.repo.ts",
        "tests/integration/auth.test.ts"
      ]
    }
  ],

  "constraints": {
    "implementation_order": "Strictly by priority, features with dependencies must wait for dependencies to complete",
    "code_state_rule": "Code must be mergeable after each feature completion (all tests pass, no TODOs, basic comments present)",
    "scope_rule": "Out_of_scope content not implemented, even if simple. Requirement changes must first update this file"
  }
}
```

#### Maintenance Responsibility Division

| Operation | Who Does It | Description |
|-----------|------------|-------------|
| **Initial Creation** | Initializer Agent | Human provides high-level description, Agent decomposes into structured entries, human reviews and corrects |
| **Daily Changes** | Human directly edits | Add, modify, cancel features |
| **Cancel Feature** | Human edits, change status to `cancelled` | Don't delete — prevents Agent from thinking it's missing and implementing it |
| **Mark Complete** | **Not done by human** | Updated by Coding Agent in progress.json, features.json status synchronized by Initializer Agent or human |
| **Issue Discovery** | Agent records in claude_progress.json notes | Agent doesn't directly modify features.json, waits for human decision |

#### Three Most Critical Fields

**`acceptance_criteria` (Acceptance Criteria)**

This is the sole basis for Agent to judge "is the feature complete". The more specific, the less likely Agent is to finish early:

```json
// ❌ Bad — Agent doesn't know how to verify
"acceptance_criteria": ["Implement user login"]

// ✅ Good — Agent can check each item
"acceptance_criteria": [
  "Login succeeds returns 200 with token containing userId, role, expiresAt",
  "Wrong password returns 401",
  "5 consecutive failures returns 429 and locks for 15 minutes"
]
```

**`out_of_scope` (What Not to Do)**

Prevent Agent from over-implementing — it sometimes "helpfully" implements related features, exceeding expected scope and affecting subsequent features:

```json
"out_of_scope": [
  "Phone registration (excluded by product decision, see ADR-0018)",
  "Remember me feature (handled by F008)"
]
```

**`dependencies` (Dependencies)**

Prevent Agent from implementing out of order, starting upper-layer logic before dependent features are built:

```json
"dependencies": ["F001", "F002"]
// Agent reads this, confirms F001 and F002 are done before starting
```

#### Four Files Complete Division of Labor

```
features.json        → What to do, acceptance criteria, boundaries (requirements, maintained by human, Agent read-only)
claude-progress.json → How far along, current status (progress, maintained by Agent, human supervised)
architecture.md      → How to do it, where modules are (technical conventions, maintained by human, Agent read-only)
docs/decisions/      → Why designed this way (decision records, maintained by human, Agent read-only)
```

---

### F.4 Coding Agent Startup Prompt Template

```
You are a Coding Agent responsible for implementing features for [Project Name].

Startup Checklist (execute in order, don't skip):
1. Run `pwd` to confirm current working directory
2. Read docs/claude-progress.json to understand current progress
3. Read docs/features.json to understand complete feature list and acceptance criteria
4. Run `pnpm test` to confirm test baseline (record failure count)
5. Confirm in_progress feature, continue or mark complete before taking next

Working Principles:
- Implement only one feature at a time, update claude-progress.json after completion
- Code must be in "clean state" after each feature completion
  (mergeable to main, all tests pass, necessary comments present)
- Verify against acceptance_criteria in features.json item by item,
  only mark as done when all satisfied
- Never implement content in out_of_scope, even if simple
- Never delete or modify tests for completed features
- If encountering blocker, record in in_progress.blockers,
  set needs_human: true, don't guess and continue
- If features.json modification needed, record in claude-progress.json notes,
  don't directly modify features.json
- After completing all features, mark current_phase: done in progress file
```

---

### F.5 Four Files vs Requirements Specification Relationship

> *Requirements specification is for humans to read, these four files "translate" the requirements specification into Agent-executable form.*

#### Three Fatal Problems with Traditional Requirements Specification for Agent

A typical functional description in a requirements specification looks like this:

```
3.2 User Authentication Module

The system shall support user registration and login via email and password.
During registration, the system shall validate input data to ensure correct email format,
password meets security requirements. After successful login, the system shall generate session credentials...
```

This format has three fatal problems for Agent:

- **Cannot judge "is it done"**: "Ensure email format is correct" is not verifiable acceptance criteria
- **Don't know boundaries**: Which are in scope for this iteration, which are for later, requires reading extensive context to judge
- **Cannot track status**: The document itself doesn't record progress, Agent must re-understand the whole picture each time

#### Four Files Are Structured Decomposition of Requirements Specification

```
Requirements Specification
(Human-written, natural language, static)
         │
         ├── Functional Requirements Section ──────→ features.json
         │   (What to do)                           Structured, trackable, with acceptance criteria
         │
         ├── Architecture Design Section ──────→ architecture.md
         │   (How to organize code)                Directory structure, layer rules, module map
         │
         ├── Technical Selection Section ──────→ docs/decisions/
         │   (Why choose this option)             ADR, retains rejected options and reasons
         │
         └── (No corresponding section)  ──→ claude-progress.json
             Requirements specification         Generated during execution, records progress and status
             doesn't record execution progress
```

#### One-to-One Correspondence

**features.json ← Functional Requirements**

Prose descriptions in requirements specification become verifiable acceptance criteria after structured processing:

```
Requirements Specification:
"The system shall support user registration via email and password,
 registration shall validate email format, password length at least 8 characters..."

↓ Translated to

features.json:
{
  "acceptance_criteria": [
    "Duplicate email returns 409",
    "Password < 8 characters returns 400",
    "Registration succeeds returns 201 with userId"
  ],
  "out_of_scope": ["Phone registration", "Third-party registration"]
}
```

Key transformation: **Prose to list** (checkable item by item), **Implicit boundaries to explicit out_of_scope** (Agent won't exceed scope).

**architecture.md ← System Architecture Design**

Architecture descriptions in requirements specification are usually conceptual; architecture.md turns them into mechanical constraints:

```
Requirements Specification:
"The system adopts layered architecture, frontend-backend separation..."

↓ Translated to

architecture.md:
Dependency rules: types → config → repo → service → ui
CI automatically fails on violation (see tests/architecture/)
```

Key transformation: **Concept description to verifiable constraints**. "Layered architecture" is just a phrase; dependency rules are hard constraints that trigger CI failure.

**docs/decisions/ ← Technical Selection Description**

Technical selections in requirements specification only write conclusions; ADR retains decision process and rejected options:

```
Requirements Specification:
"Session management uses Redis storage..."

↓ Translated to

ADR-0012:
Rejected option: JWT (security team opposed, cannot actively revoke)
Consequence: Prohibited: service layer directly references Redis, must go through repo/cache/ wrapper
```

Key transformation: **Only conclusion to contextual decision process**. Agent knows "why not JWT", won't "optimize" to JWT during implementation.

**claude-progress.json ← No Corresponding Section in Requirements Specification**

This is the biggest difference. Requirements specification is a static document that doesn't record execution status. Traditional projects use Jira, Linear to track progress; Agent engineering internalizes it into the repository itself:

```
Requirements Specification: (No such section)

↓ Generated by Agent during execution

claude-progress.json:
{
  "in_progress": {"current_step": "Token issuance completed, refresh logic not started"},
  "blockers": [{"needs_human": true, "description": "Need to configure OAuth callback URL"}]
}
```

#### Project Startup Workflow

Recommended workflow for transforming requirements specification into four files:

```
Step 1  Human writes requirements specification (or product document)
           ↓
Step 2  Initializer Agent reads requirements specification
        → Generate features.json draft (functional decomposition, acceptance criteria)
        → Generate architecture.md draft (directory structure suggestions)
           ↓
Step 3  Human reviews and corrects both files
        → Add out_of_scope (where Agent most likely to exceed scope)
        → Add technical constraints and prohibited rules
        → Create ADRs for key selection decisions
           ↓
Step 4  Coding Agent starts working
        → Reads only the above files, not original requirements specification
        → Maintains claude-progress.json
```

> Requirements specification is too "human-friendly" for Agent — low information density, vague boundaries, not mechanically verifiable. The four files are its machine-readable version, and this translation process itself is an important part of Harness Engineering.

---

## G. Slash Commands and Skills: Team Workflow Standardization

> *Slash Commands and Skills are tools for solidifying "best practices" into "automatic behavior" — the former triggered by humans, the latter auto-activated by Agent.*

### G.1 Design Decisions: Command vs Skill vs Subagent

| Mechanism | Activation Method & Best Use Case | Example |
|-----------|----------------------------------|---------|
| **Slash Command** | Manually triggered `/command`; suitable for workflows with clear starting points | `/harness:review-pr`, `/deploy-staging` |
| **Skill** | Auto-activated by Claude (description matches task); suitable for "ongoing" knowledge injection | commit-message skill, api-endpoint skill |
| **Subagent** | Explicitly or automatically delegated; suitable for deep tasks requiring context isolation | security-review, performance-benchmark |
| **CLAUDE.md Rules** | Always present; suitable for conventions needed in all tasks | TypeScript strict, prohibit hardcoded secrets |
| **Hook** | Event-driven, must execute; suitable for non-negotiable quality gates | Stop hook type checking, PreToolUse permission control |

### G.2 Team Slash Commands Template

#### `/harness:review-pr` — PR Code Review

```markdown
# .claude/commands/harness:review-pr.md
---
description: Conduct comprehensive code review for current branch PR
---

Execute following steps with subagent then summarize:
1. Run `git diff main...HEAD` to get all changes
2. Check code quality (TypeScript errors, unused variables, logical vulnerabilities)
3. Check security issues (injection, authentication flaws, secret exposure)
4. Verify test coverage (new code must have corresponding tests)
5. Check API documentation updates (all public APIs must have JSDoc)

Output format:
- Must Fix (blocks merge)
- Suggested Improvements (optional)
- Positive Aspects
```

#### `/harness:dump` — Long Task Context Save

```markdown
# .claude/commands/dump.md
---
description: Save key decisions and progress of current session to document
---

Write following information to docs/claude-progress.json:
1. Features completed this session (update completed_features)
```