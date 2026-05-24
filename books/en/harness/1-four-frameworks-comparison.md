# Four Claude Code Framework Comparison and Harness Engineering Recommendations

## I. Individual Profiles

### OpenSpec (Fission-AI) - Living Specification Engine

Core proposition: "Specifications as living documents, not one-time prompts." Workflow `/opsx:propose → /opsx:apply → /opsx:archive`. When creating new requirements, it automatically generates proposal.md (why), specs/ (requirements and scenarios), design.md (technical solution), and tasks.md (implementation checklist) in the `openspec/changes/<feature>/` directory. Completed changes are `archive`d to a timestamped archive directory, preserving specifications as future references. Philosophy is "fluid not rigid → iterative not waterfall" - any artifact can be modified at any time without rigid stage gates.

Advantages: Strongest traceability; naturally suited for multi-person collaboration and cross-session handoffs; archive mechanism prevents chat history bloat.
Weaknesses: Doesn't handle TDD, parallel execution, or quality gates on its own; needs to be combined with other frameworks to be complete; somewhat heavy for small changes.

### GSD / Get Shit Done (glittercowboy / TACHES) - Context Anti-Corrosion Engine

Core proposition: "Solving context rot." Projects are split into waves - independent plans run in parallel, dependent plans run serially. Each plan runs in a fresh 200K token context subagent, and context is discarded after submission. Four core documents are persisted: PROJECT.md / REQUIREMENTS.md / ROADMAP.md / STATE.md plus CONTEXT.md / PLAN.md / SUMMARY.md / VERIFICATION.md for each phase. 6-step process: new-project → discuss-phase → plan-phase → execute-phase → verify-work → ship. Each plan is an XML structure with `<action>` `<verify>` `<done>` sections.

Advantages: Most stable quality for long-cycle projects (fresh context doesn't degrade); significant parallel acceleration; built-in schema drift detection, safety anchors, and scope shrinkage detection.
Weaknesses: Over-engineered for small projects; large documentation volume; wave scheduling requires correct dependency graphs.

### gstack (Garry Tan / YC) - Role-Play Team

Core proposition: "Turn a single AI into a virtual team." 23-30 slash commands organized by role: CEO (/office-hours, /plan-ceo-review for product scope challenges), Designer (/design-consultation, /design-shotgun for multiple solutions, /design-html, /design-review), Eng Manager (/plan-eng-review, /autoplan for one-click full review), QA (/qa for real Chromium browser + atomic commits, /browse gives agent "eyes"), Release Manager (/ship, /land-and-deploy, /canary for canary monitoring, /benchmark for performance regression), Safety (/careful, /freeze, /guard for three levels of destructive action interception), Utilities (/investigate, /learn, /retro, /codex for cross-model review).

Advantages: Real browser end-to-end verification is unique in its class; diverse role perspectives expose blind spots; safety wrappers are elegantly designed; /canary + /benchmark cover production phase.
Weaknesses: Not spec-driven, weak planning layer; lacks strict pipeline between skills; better suited for frontend/product projects than backend infrastructure projects.

### Superpowers (obra / Jesse Vincent) - Five-Phase TDD Methodology

Core proposition: "Force Claude to follow a five-stage path: clarify → design → plan → code → verify, with TDD as a hard rule." 15 composable skills: brainstorming, writing-plans, dispatching-parallel-agents, using-git-worktrees, test-driven-development, systematic-debugging, executing-plans, subagent-driven-development, requesting-code-review, receiving-code-review, verification-before-completion, finishing-a-development-branch, writing-skills, using-superpowers. Emphasizes "call skill even for 1% relevance"; explicitly distinguishes rigid skills (TDD/debug, must follow) and flexible skills (patterns, discretionary).

Advantages: Clearest methodology, strictest TDD execution; skills are atomized for easy reuse; skill-writing skill enables self-expansion; already in Anthropic's official marketplace.
Weaknesses: No living specification archive; parallelism is capability not default; lacks production phase (canary, benchmark); doesn't handle product-level scope challenges.

## II. Capability Matrix

| Capability | OpenSpec | GSD | gstack | Superpowers |
|------------|----------|-----|--------|-------------|
| Spec Archive | ★★★★★ | ★★★ | ★ | ★ |
| Long-cycle Context Rot Resistance | ★★★ | ★★★★★ | ★★ | ★★★ |
| TDD Strictness | ★ | ★★★ | ★★ | ★★★★★ |
| Parallel Execution | ★ | ★★★★★ | ★★ | ★★★ |
| Product/Scope Challenge | ★★ | ★★ | ★★★★★ | ★★ |
| Real Browser E2E | - | - | ★★★★★ | - |
| Destructive Action Protection | - | ★ | ★★★★ | ★ |
| Production Release & Monitoring | ★★ | ★★ | ★★★★★ | ★★★ |
| Methodology Purity | ★★★★ | ★★★★ | ★★ | ★★★★★ |

## III. Recommendations for This Project (harness-engineering v1.10.0)

Currently forked superpowers and established `harness:init / writing-plans / test-driven-development / verification-before-completion / audit` namespace, features.json, three-agent GAN architecture, PreToolUse/Stop Hook system. Organized below by source → integration phase → problem to solve.

### 1. Borrow OpenSpec's "Living Specification Archive" → Enhance `harness:writing-plans` + Add `harness:archive`

When `harness:writing-plans` generates features.json, additionally produce `.harness/changes/<feature>/{proposal.md, design.md, tasks.md}`; upon completion, `harness:archive` moves the entire directory to `.harness/archive/YYYY-MM-DD-<feature>/`. Solves: Current features.json ends after completion, design decisions and "why" are scattered in git commits and hard to retrieve; archive mechanism provides single source of truth for future audits and personnel handoffs, corresponding to the garbage collection principle of "preventing document staleness and architecture drift" in HarnessEngineering.md.

### 2. Borrow GSD's "Wave Parallel + Fresh Context" → Enhance `harness:test-driven-development`

Analyze dependency graph of independent features in features.json, dispatch independent features to separate subagents (each with 200K fresh context) for parallel Red-Green-Refactor, dependent features run serially. Persist `{N}-SUMMARY.md` + `{N}-VERIFICATION.md` for each feature. Solves: Context bloat in main thread causes late-stage quality degradation in long-cycle projects - this is the biggest risk for OpenAI Codex-scale projects like three-engineers-5-months-1M-LOC. Hashimoto's "never repeat" + GSD's "never pollute context" are two complementary cornerstones of Harness Engineering.

### 3. Borrow GSD's XML Structured Plan → Standardize feature descriptions in features.json

Add `action / verify / done` three-part declaration to each feature in features.json (or link to external plan.md). Solves: Current features.json is declarative "what to do", but "how to verify completion" and "evidence of completion" are implicit, lacking unified contract when Evaluator agent judges completion status.

### 4. Borrow gstack's "Safety Hook Wrapper" → Enhance settings.json / PreToolUse Hook

Absorb `/careful` (confirm before destructive commands like rm -rf, DROP TABLE, force-push), `/freeze` (restrict editing to single directory during debugging), `/guard` (combination of both) as three-level Hook switches. Solves: Current PreToolUse only blocks writing .env, lacking protection against "agent roaming to unrelated directories and breaking things during debug" - this is the most frequently mentioned accident scenario for Harness Engineering in HN discussions.

### 5. Borrow gstack's "Real Browser QA" → Add `harness:e2e` or as subcommand of `harness:verification-before-completion`

Introduce Chromium automation (Playwright or CDP) for web projects as fifth layer of completion check: Lint → Unit Test → Integration Test → Review → Real Browser. Solves: Evaluator agent currently judges completion at code and test level, but cannot see user-side experience (LCP, interaction errors, accessibility) - equivalent to verifying "code is correct" but not "product is correct".

### 6. Borrow gstack's `/canary` + `/benchmark` → Add `harness:canary`

Monitor console errors, performance regression, core Web Vitals within N minutes after release, compare with baseline, trigger rollback or issue on threshold exceedance. Solves: Harness Engineering currently covers up to `harness:verification-before-completion`, missing closed-loop "first-line evidence" after release - feedback loop lacks final segment.

### 7. Borrow gstack's `/codex` (Cross-Model Review) → Enhance `harness:audit`

Embed second model (Codex or Opus→Sonnet cross) in Evaluator agent as independent review eye, three modes: review gate / adversarial challenge / consultation. Solves: Single model family prone to homologous blind spots, stronger version of Anthropic's "never let creator independently review their own output" principle.

### 8. Borrow Superpowers' "rigid vs flexible" Tag → Add metadata to .harness/skills/*/SKILL.md

Add `execution: rigid | flexible` field in each Skill's frontmatter, mark TDD and debug as rigid, architecture suggestions as flexible. Solves: Current skills are equal in trigger logic, but Claude Code lacks explicit distinction between "negotiable" and "non-negotiable" rules, causing rigid constraints to be ignored as suggestions - this is why TDD Guard exists.

### 9. Borrow Superpowers' `dispatching-parallel-agents` Skill → Extract to `.harness/skills/dispatch`

Current parallelism in features.json is implicit, explicitly make it a reusable skill so other harness:* commands (like audit, archive) can also parallelize. Solves: Parallel capability currently coupled with test-driven-development flow, needs reimplementation when migrating to other phases.

### 10. Borrow GSD's STATE.md → Enhance your existing claude-progress.json

STATE.md records current progress, blockers, next decisions in human-readable markdown, complementing machine-readable claude-progress.json. SessionStart Hook restores both. Solves: Current progress restoration is only for agent, not human-readable; STATE.md allows morning colleagues or cross-machine switching authors to get back on track in 10 seconds.

## IV. Priority Recommendations

Sorted by ROI, recommend implementing in three batches:

**P0 (Immediate, highest ROI)**: Adopt 3 (XML three-part feature), 8 (rigid/flexible tags), 10 (STATE.md) - small changes, high methodological benefit, fully compatible with existing system.

**P1 (Next minor version)**: Adopt 1 (living specification archive `harness:archive`), 4 (safety Hook three-level switch), 6 (`harness:canary` release monitoring) - fill gaps upstream and downstream of "plan→verify".

**P2 (Architecture-level iteration)**: Adopt 2 (Wave parallel fresh context), 5 (real browser E2E), 7 (cross-model audit) - requires refactoring or new dependencies, but can elevate project from "personal best practice" to "team-level infrastructure".

## Sources

* Fission-AI/OpenSpec on GitHub
* Spec-Driven Development with OpenSpec and Claude Code
* gsd-build/get-shit-done on GitHub
* The Complete Beginner's Guide to GSD Framework
* GSD Framework on CC for Everyone
* garrytan/gstack on GitHub
* gstack skills documentation
* obra/superpowers on GitHub
* Superpowers, GSD, and gstack: What Each Claude Code Framework Actually Constrains
* Claude Code + OpenSpec + Superpowers: When to Use All Three
* A Claude Code Skills Stack: Combining Superpowers, gstack, and GSD