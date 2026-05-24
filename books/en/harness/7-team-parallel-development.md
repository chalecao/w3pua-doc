# Multi-Person Full-Stack Team Parallel Development Guide

> Synthesizing Anthropic Agent Teams official documentation, OpenAI Codex team practices, C compiler parallel Agent stress test cases,
> Focus: **How to maximize efficiency for multi-person full-stack teams through features.json design and tool selection.**
>
> Updated: April 6, 2026

---

## Core Insight: Parallelism Requires "Independence"

From three real cases of vastly different scales, one lesson repeats:

> **Parallelization failures are almost never due to insufficient Agent capability, but rather implicit dependencies caused by task splitting methods.**

**C Compiler Project (16 Agent parallel stress test)**: Initially failed completely when all Agents attacked the Linux kernel simultaneously - Agents encountered the same bugs and overwrote each other's fixes. The solution was to assign each Agent to a different file set and introduce a file-lock-based task claiming mechanism.

**OpenAI Codex Team (3 → 7 people)**: Early progress was slow not because of the model, but because of "underspecified environment". Throughput continued to increase as the team expanded to 7 people - demonstrating that Harness quality amplifies human efficiency, not just headcount.

**Conclusion**: Investment in parallel development should prioritize "how tasks are split" over "adding more people".

---

## I. features.json Parallel Support Upgrade

The current basic skeleton works for solo workflows; supporting multi-person parallel requires adding several key fields:

### Complete Schema

```json
{
  "project": "User Collaboration Platform",
  "updated": "2026-04-06",
  "coordination": {
    "max_parallel": 5,
    "worktree_mode": true,
    "claim_strategy": "git-commit-race"
  },
  "features": [
    {
      "id": "F-001",
      "title": "User Authentication Module",
      "status": "in_progress",
      "priority": "high",
      "layer": "backend",
      "owner": "simon",
      "worktree": "feature-auth",
      "files_owned": [
        "src/auth/",
        "src/middleware/auth.ts",
        "tests/auth/"
      ],
      "depends_on": [],
      "blocks": ["F-003", "F-005"],
      "description": "JWT authentication + session management. API key in .env JWT_SECRET. Return 401 on failure, no exceptions. Token valid 7 days, refresh token 30 days.",
      "acceptance": [
        "Login endpoint returns access_token + refresh_token",
        "Expired token returns 401 not 500",
        "All tests pass: pnpm test src/auth"
      ]
    }
  ]
}
```

### New Field Description

| Field | Purpose | Parallel Importance |
|-------|---------|---------------------|
| `owner` | Task ownership, prevents two people from claiming simultaneously | ⭐⭐⭐ Most critical |
| `files_owned` | File ownership boundaries | ⭐⭐⭐ Fundamental way to avoid merge conflicts |
| `worktree` | Corresponding git worktree name | ⭐⭐ Supports worktree isolation mode |
| `depends_on` / `blocks` | Explicit dependency graph | ⭐⭐⭐ Makes parallelizable tasks immediately visible |
| `layer` | frontend / backend / infra | ⭐ Filtering basis when dividing by layer |
| `acceptance` | Acceptance criteria | ⭐⭐ Reduces Agent's need to ask humans |
| `coordination.max_parallel` | Maximum simultaneous tasks | ⭐ Cost control |

---

## II. Task Claiming Mechanism: Prevent Duplicate Claims

### Option A: Git Commit Race (Recommended, no extra tools needed)

Leverage Git's synchronization mechanism to naturally prevent simultaneous claiming:

```bash
# Standard task claiming process
git pull origin main                      # Pull latest first, ensure owner field is current
# Check if F-002 owner is still unassigned
# If yes, edit features.json to change owner to your name
git add docs/features.json
git commit -m "claim(F-002): alice claims User Management UI"
git push origin main                      # Push immediately, first to push wins
# If push rejected (someone else claimed first), pull and re-check
```

The key to this pattern: **The claim action itself is a git commit + push**. First push wins; later pushers see the owner is already taken after pulling.

### Option B: Agent Teams Shared Task List (Auto coordination)

Claude Code v2.1.32+ Agent Teams feature has built-in task list + file locking:

```text
# Start multi-Agent team, let Agents automatically claim and coordinate
Create an agent team to implement these 5 features.
Each teammate claims tasks from features.json and works independently.
No two teammates should touch the same files_owned list.
```

Task status automatically maintained: `pending → in_progress → done`, dependent tasks automatically unlocked upon completion.

---

## III. Three Division Models

### Model A: Layer Ownership

Each person focuses on one layer within a Sprint, highest parallelism:

```
Simon  → backend features (F-001, F-003, F-007)
Alice  → frontend features (F-002, F-006, F-008)
Bob    → infra/devops (F-004, F-009)
```

**Advantages**: Files rarely overlap, minimal merge conflicts, Agents can truly run in parallel.

**Use case**: Projects with clear frontend-backend separation architecture, many features within Sprint.

**Note**: Psychological resistance of full-stack engineers "only touching backend" significantly reduces in Agent-driven development - because personal focus is on review and direction decisions, not writing code themselves.

### Model B: Feature Ownership

Each person owns a complete end-to-end feature (API to UI), with strict file boundary isolation via `files_owned`:

```
Simon → F-001 Authentication (src/auth/ + src/pages/login/)
Alice → F-002 User Management (src/pages/users/ + src/api/users/)
Bob   → F-004 Infrastructure (infra/ + CI config)
```

**Advantages**: Each person maintains full-stack sense, good feature integrity.

**Use case**: Features share little code, team members prefer owning complete functionality independently.

**Note**: If two features both need to modify shared files like `BaseController` or `api/types.ts`, need advance coordination or serialize that work.

### Model C: Planner-Coder-Reviewer Triad (Quality First)

Latest Anthropic blog recommended pattern, specifically solves "AI reviewing its own output" problem:

```
Planner → Maintain features.json, decompose requirements, make architecture decisions
Coder → Launch Agent to implement code, maximize Agent parallelism
Reviewer → Independently review Agent output, never let creator self-review
```

In a 3-person full-stack team, rotate these three roles each Sprint to avoid stagnation.

**Advantages**: Highest quality gates, suitable for teams with explicit PR review requirements.

**Use case**: High code quality requirements, or early stage building quality culture.

---

## IV. Git Worktree Isolation: Infrastructure for Multi-Person Parallel

Git Worktree is the technical foundation for multi-person parallel development, allowing multiple Agent sessions to run simultaneously without interference:

```bash
# Each person (or feature) gets an independent worktree
claude --worktree feature-auth       # Simon's workspace
claude --worktree feature-users      # Alice's workspace
claude --worktree infra-setup        # Bob's workspace
```

Worktrees are created in `.claude/worktrees/<name>/`, each with its own branch but sharing the same `.git` history and remote connection.

**Key Configuration**:

```bash
# Ignore worktree directory in .gitignore
echo ".claude/worktrees/" >> .gitignore

# Declare local configs to copy in .worktreeinclude
cat > .worktreeinclude << EOF
.env
.env.local
config/local.json
EOF
```

**Worktree + features.json Integration**: The `worktree` field in features.json records the corresponding worktree name. Agent reads this field on startup and automatically enters the correct worktree.

---

## V. Design Principles to Reduce Human-Agent Dependency

> Agent waiting for human input = zero efficiency. Goal is to let Agent keep progressing even when humans are away.

### Principle 1: Pre-Answer Agent's Questions in features.json description

Answer the questions Agent is most likely to ask during implementation:

```json
{
  "id": "F-006",
  "title": "Email Notifications",
  "description": "Use SendGrid to send registration confirmation emails. API key in .env SENDGRID_KEY. Template in src/templates/email/welcome.html. Retry 3 times on failure (exponential backoff), write to dead_letter_queue table on timeout, do not throw exception to caller. Use mailtrap for testing: configured in .env.test."
}
```

The more specific the description (which library to use, where config lives, how to handle failure), the fewer times Agent needs to interrupt you.

### Principle 2: acceptance Field as Executable Acceptance Criteria

```json
"acceptance": [
  "pnpm test src/email -- --coverage (> 80% coverage)",
  "dead_letter_queue table has record when send fails",
  "Does not affect registration endpoint response time (< 200ms)"
]
```

Write acceptance as verifiable conditions so Agent can self-verify after completion without manual checking.

### Principle 3: depends_on Lets Agent Decide When to Start

After writing this rule in CLAUDE.md, Agent automatically checks dependencies on each startup:

```markdown
## features.json Collaboration Rules
- Before starting any task, confirm all features in depends_on have status done
- Confirm files you need to modify are not in files_owned of other in_progress tasks
- After completing task, change status of tasks in blocks from planned to ready (only allowed scenario for Agent to write features.json)
```

---

## VI. Efficiency Data Reference

| Team | Size | Configuration | Throughput |
|------|------|--------------|------------|
| OpenAI Codex Team | 3 people | Unlimited Agents | 3.5 PRs/engineer/day |
| OpenAI Codex Team (scaled) | 7 people | Better Harness | Throughput continued increasing |
| Stripe Minions | Enterprise | 400+ MCP tools | 1000+ PRs/week |
| C Compiler Stress Test | 1 person monitoring 16 Agents | Docker isolation + file locks | 2000 sessions, 100K lines |
| Community Report (Worktree mode) | Small team | 3-5 parallel worktrees | ~18% throughput improvement |

**Practical Limit**: Boris Cherny recommends **3-5 parallel worktrees** - this is the upper limit of reasonable human attention coverage; beyond that, cognitive cost of context switching starts offsetting parallel gains.