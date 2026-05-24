# Harness Engineering Quick Reference

> This file is a condensed reference of Harness Engineering core concepts for Skills and Commands to load on demand.
> For complete handbook: [references/HarnessEngineering.md](./2-HarnessEngineering.md) (compiling Anthropic · OpenAI · InfoQ · HN practice精华)

## Core Definition

Harness Engineering transforms the engineer's core work from "writing code" to "designing environments where AI agents work reliably."

The model is the horse—powerful but unaware of direction; Harness is the reins, saddle, and bit—guiding power in the right direction.

## Three Evolution Stages

| Stage | Period | Core Focus |
|-------|--------|------------|
| Prompt Engineering | 2022–2024 | Optimize instruction quality for single inference |
| Context Engineering | 2025 | Ensure model gets correct context during inference |
| **Harness Engineering** | **2026–** | **Architect constraints, feedback loops, and verification mechanisms at system level** |

## Four Core Components

| Component | Content |
|-----------|---------|
| Context Engineering | Continuously enriched knowledge base (CLAUDE.md, design documents, architecture diagrams) |
| Architecture Constraints | Mechanically enforced through Linters and structured tests |
| Verification & Feedback | CI pipelines, tests; each failure triggers Harness improvement |
| Garbage Collection | Periodic cleanup runs to detect document staleness, architecture drift, code entropy |

## Six-Layer Model

| Layer | Component | Core Responsibility |
|-------|-----------|---------------------|
| ① Memory Layer | CLAUDE.md | Static knowledge: architecture conventions, prohibitions, test commands |
| ② Rules Layer | settings.json | Deterministic behavior: permissions, models, output configuration |
| ③ Skills Layer | skills/ + commands/ | On-demand knowledge and manually triggered workflows |
| ④ Agent Layer | agents/ | Context-isolated dedicated Subagents |
| ⑤ Hooks Layer | Hooks | Deterministic enforcement: independent of model judgment |
| ⑥ Tools Layer | MCP Servers | Capability extension: external service integration |

**Single-Layer Failure Trap**: All three must work together—CLAUDE.md rules alone get occasionally ignored; Hooks alone can't handle judgment tasks; settings.json alone lacks context.

## Core Principles

1. **Context reset is better than infinite compression**: Periodic clearing and structured handoff are more effective than accumulation
2. **Never let creators independently review their own output**: Separate generation and evaluation roles
3. **Simplify Harness as models evolve**: When new models solve certain failure types, proactively remove scaffolding
4. **Constraints empower, don't restrict**: Stricter architecture constraints lead to more reliable Agent output
5. **Context is a scarce resource**: Critically examine everything added to the context window
6. **Separate permission enforcement from model reasoning**: CLAUDE.md explains why, Hooks enforce

## Core Loop

```
Agent fails → Identify missing capability → Engineer fix (update docs/add Linter/build tool) → Failure never happens again
```

## "On the Loop" Role Positioning

```
Outside the loop (Vibe Coding)  → Human gives requirements, Agent improvises → May work, but uncontrollable
In the loop (Micromanagement)   → Review every line of code → Quality guaranteed, but human is bottleneck
On the loop (Harness Engineering) → Design constraints, maintain Harness → Quality guaranteed, fast
```

Correct approach: When unsatisfied with Agent output, improve the Harness that produced it, not the output directly.

## Feedforward & Feedback System

| Control Direction | Type | Typical Implementation |
|-------------------|------|-----------------------|
| Feedforward (Guides) | Computational | CLAUDE.md architecture conventions, dependency rules |
| Feedforward (Guides) | Inferential | Skills domain knowledge injection |
| Feedback (Sensors) | Computational | Stop Hook type checking, CI structure tests |
| Feedback (Sensors) | Inferential | Security review Sub-agent |

Principle: Use Computational to cover 80% of common issues, then Inferential for remaining 20% semantic cases.

## Anti-Pattern Quick Reference

| Anti-Pattern | Fix |
|--------------|-----|
| CLAUDE.md > 100 lines | Trim to <60 lines, move to docs/ |
| Overusing MCP (20+ Servers) | Connect on demand, disable when not needed |
| 4000 lines of test output on success | Silent on success, only output on failure |
| All conventions in CLAUDE.md | Must-execute = Hook, should-follow = CLAUDE.md |
| 10+ features in single session | One feature per session + /harness:dump |
| Rely on Compaction for memory | Use claude-progress.json for structured handoff |

## Three-Layer Protection

```
Layer 1: settings.json     → Control which tools Agent can call (system level)
Layer 2: PreToolUse Hook   → Check parameters within allowed tools (interception layer)
Layer 3: CLAUDE.md         → Explain constraint reasons, help Agent proactively avoid (understanding layer)
```

## MCP Usage Decision Framework

```
Decision 1: Does the model have built-in knowledge?
  git/npm/docker/gh CLI... → Use CLI directly (model trained on these)
  Your company's internal API → Need MCP or custom CLI wrapper

Decision 2: How many operations does the tool have?
  Only 3 operations → Write CLI wrapper + CLAUDE.md explanation (~100 tokens)
  20+ operations → Use MCP Server (~3000-9000 tokens)

Decision 3: Is CLI output efficient?
  Concise and structured → Use CLI
  Verbose and noisy → Use MCP (controlled return format)
```

## Harness Maturity Path

```
Phase 1: Human builds Harness, Agent works within it (current state for most teams)
Phase 2: Agent identifies issues, records in progress.json, human periodically reviews and converts to improvements (recommended target)
Phase 3: Agent identifies issues and directly creates PRs, human approves and merges (OpenAI garbage collection Agent pattern)
Phase 4: Harness optimizes itself automatically (Meta-Harness, experimental)
```

## Correct Metrics for Measuring Effectiveness

```
❌ Wrong: "Fixed 20 Agent bugs this week"
✅ Correct: "Added 3 new architecture Linter rules this week, preventing this class of bugs forever"

❌ Wrong: "Wrote detailed CLAUDE.md to prevent Agent mistakes"
✅ Correct: "Implemented Hook + settings.json to physically prevent those mistakes"
```