# Harness Component Evaluation Handbook (HEval Handbook v1.0)

> This handbook defines the methodology, dimensions, task sets, and aggregation formulas used by Harness Engineering projects to evaluate AI Agent harness component capabilities.
>
> **Core Position**: HEval is not for scoring LLMs, but for scoring "engineering scaffolding that wraps LLMs" — the evaluation targets are harness frameworks themselves like OpenSpec, Superpowers, gstack, GSD, harness-engineering.
>
> **Historical Context**: This handbook supersedes [four-frameworks-comparison.md](./1-four-frameworks-comparison.md) as the authoritative evaluation method. The star matrix is retained as historical archive.

---

## Table of Contents

1. [Evaluation Objectives and Scope](#1-evaluation-objectives-and-scope)
2. [Definition of Evaluation Objects](#2-definition-of-evaluation-objects)
3. [Four-Layer Evaluation Method Overview](#3-four-layer-evaluation-method-overview)
4. [L1 Static Analysis](#4-l1-static-analysis)
5. [L2 Structured Scoring (Rubric)](#5-l2-structured-scoring-rubric)
6. [L3 Standard Task Set (Benchmark)](#6-l3-standard-task-set-benchmark)
7. [L4 User Feedback and Dogfooding](#7-l4-user-feedback-and-dogfooding)
8. [Aggregation Formula and Grades](#8-aggregation-formula-and-grades)
9. [`harness:evaluate` Automated Evaluation Architecture](#9-harnessevaluate-automated-evaluation-architecture)
10. [Report Schema and Examples](#10-report-schema-and-examples)
11. [Evaluator Neutrality and Bias Resistance](#11-evaluator-neutrality-and-bias-resistance)
12. [Validation Case: Sample Scores for 5 Existing Harnesses](#12-validation-case-sample-scores-for-5-existing-harnesses)
13. [Compatibility with four-frameworks-comparison.md](#13-compatibility-with-four-frameworks-comparisonmd)
14. [Appendix A: Complete Rubric Anchor Definitions](#appendix-a-rubric-anchor-complete-definitions)
15. [Appendix B: Benchmark Task Specifications](#appendix-b-benchmark-task-specifications)
16. [Appendix C: Complete Static Metric Formulas](#appendix-c-static-metric-complete-formulas)

---

## 1. Evaluation Objectives and Scope

### 1.1 Evaluation Objectives

HEval solves three specific problems:

1. **Selection Decision**: When teams/individuals choose a harness, they want to see a cross-vendor comparable total score + dimension distribution, rather than self-promotional READMEs.
2. **Evolution Monitoring**: When a harness evolves from v0.5 → v0.6, need to quantify "which capability changed this upgrade" — can't rely solely on changelog adjectives.
3. **Reference Decision**: When harness-engineering decides which capabilities to borrow from OpenSpec / GSD / gstack / Superpowers, use dimension distribution to identify gaps rather than intuition.

### 1.2 Scope

**HEval evaluates**:

- Harness framework (one git repository + one clear methodology)
- Single version (anchored by git tag or commit SHA)
- Default configuration (vendor README recommended installation/enablement method)

**HEval does NOT evaluate**:

- Individual prompt quality (belongs to prompt engineering category)
- Individual LLM model capabilities (SWE-bench / HumanEval / METR already cover this)
- Arbitrary AI programming tools (Cursor / Cline / Aider / Copilot and other IDE/agents are outside scope — they are harness hosts, not harnesses themselves)
- IDE plugins, third-party MCP servers, personal dotfiles

### 1.3 Relationship with harness:audit

| Tool | Evaluation Object | Purpose |
|------|------------------|---------|
| `harness:audit` | A **user project's** harness setup (health of your project's CLAUDE.md / Hooks / Skills) | Optimize your own project |
| **HEval** / `harness:evaluate` | A **harness framework itself** (products like OpenSpec / Superpowers) | Selection and comparison |

The two share some dimensions (both cover 6-layer structure, Hook enforcement, documentation completeness), but have different perspectives: audit looks at "how well this project uses harness", HEval looks at "what capabilities this harness provides".

---

## 2. Definition of Evaluation Objects

### 2.1 What Constitutes a Harness Component

A git repository meeting all following conditions qualifies as HEval evaluation object:

- **Discoverable**: Has public README explaining purpose and installation method.
- **Installable**: Can be deployed to a new project via git clone / npm install / `claude plugin install` or similar clear method.
- **Contains Engineering Capabilities**: Provides at least one of: skill / command / hook / agent / MCP / system prompt template / workflow script. README-only without executable/loadable artifacts doesn't qualify.
- **Has Methodology Proposition**: README or documentation can extract at least 1 clear SDLC philosophy ("enforce TDD", "spec as living document", "fresh context per wave", "role play" etc.).

### 2.2 Version Binding

Each evaluation must bind to a specific version:

```
<harness-name>@<version-locator>

Examples:
  superpowers@v0.5.2
  openspec@2026-04-15  (commit short SHA)
  harness-engineering@v1.10.0
```

Report metadata must record:

- `version_locator`: tag or SHA
- `evaluated_at`: evaluation date
- `benchmark_version`: Benchmark task set version used
- `evaluator_runtime`: Claude model version during evaluation (e.g., `claude-sonnet-4-6`)

### 2.3 Evaluation Time Window

L4 user feedback uses **rolling 90-day window** data. L1/L2/L3 are version snapshots, time-independent.

---

## 3. Four-Layer Evaluation Method Overview

```
                          HES Total Score (0-100, S/A/B/C/D Grade)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │           │               │               │
      15%         30%             40%             15%
        │           │               │               │
       L1          L2              L3              L4
     Static     Rubric         Benchmark        Feedback
   Static Analysis   Structured Scoring      Standard Task Set      User Feedback
   (Script)     (Review+LLM)       (Runtime)         (Data Collection)
        │           │               │               │
        ▼           ▼               ▼               ▼
   Repository Structure      7 Dimensions          6 Tasks          GitHub +
   Metadata Indicators       0-5 Anchors        SDLC Benchmark       Dogfooding
```

**Why these four layers**:

- **L1 Static**: Anti-cheating anchor. Only looks at mechanically computable facts (skill count, hook types, ADR count), reproducible by any reviewer, but cannot reflect quality.
- **L2 Rubric**: Connects subjective and objective. Assign clear anchors to 7 mutually exclusive dimensions, turning "I think this harness is strict" into "It scored 4 in 'Enforcement and Gates' dimension because it has Stop Hook but no PreToolUse to block force-push".
- **L3 Benchmark**: Behavioral ground truth. Make harness actually run SDLC tasks, see if it maintains quality across long cycles, parallel execution, regression, and archive scenarios. This layer has highest weight.
- **L4 Feedback**: Calibrate with real signals. Star count, issue resolution rate, third-party use cases dilute design-phase paper advantages.

Four layers cross-validate: If L2 gives high score but L3 benchmark fails, Rubric anchors are misaligned with actual capabilities, triggering handbook revision.

---

## 4. L1 Static Analysis

### 4.1 Design Principles

**L1 only measures "facts", not "quality"**. Any metric requiring semantic judgment belongs elsewhere. L1 total score is **0-100, weight 15%**.

### 4.2 Metric Matrix

| Metric | Measurement Method | Full Score Condition | Weight |
|--------|-------------------|---------------------|--------|
| Skill Atomicity | Number of SKILL.md in `skills/` ÷ average lines | ≥10 skills with average < 200 lines | 15 |
| Frontmatter Completeness | SKILL.md with complete `name + description + trigger phrase` / total | 100% | 10 |
| Hook Type Coverage | Number of hook event types triggered in settings.json | ≥4 types | 15 |
| Hook Silent Success | Test hooks produce no output on success path | 100% silent on success | 5 |
| ADR Count & Time Distribution | `docs/decisions/` count + updates in last 6 months | ≥5 articles with updates in 6 months | 10 |
| Documentation Density | Total words in docs/ + references/ ÷ lines of code | ≥0.5 words/line (manual type) | 10 |
| Self-test Script | Whether self-test.sh or equivalent CI exists | Exists and passes | 10 |
| Marketplace Discoverability | Whether available in Anthropic / third-party marketplace | Listed | 5 |
| Dependency Hygiene | Third-party dependency count + license compliance scan | ≤5 non-dev dependencies with compatible licenses | 5 |
| Meta-test Coverage | Tests for harness's own skill / hook | ≥1 skill category has tests | 5 |

Total 90 points, normalized proportionally to 0-100. Detailed calculation formulas in Appendix C.

### 4.3 Implementation

Produced automatically by static scanner embedded in `harness:evaluate` (`tools/static-scanner.py` in design). No LLM involved.

---

## 5. L2 Structured Scoring (Rubric)

### 5.1 7 Dimensions

| Dimension | Keywords | One-Sentence Definition |
|-----------|----------|------------------------|
| D1 Methodology Completeness | SDLC phase coverage | Covers clarify / design / plan / code / verify / ship / monitor phases |
| D2 Capability Layering | Six-layer model | Which layers provided among Memory / Rules / Skills / Agents / Hooks / Tools |
| D3 Enforcement and Gates | rigid / Hook | Clarity of rigid constraints, Hook enforcement capability, difficulty of bypassing gates |
| D4 Traceability and Archive | Living spec / ADR | Whether decisions, proposals, changes are persisted to searchable archive |
| D5 Context Management and Anti-corrosion | fresh context / parallel | Context rot resistance, parallel subagent, long-cycle project support |
| D6 Observability and Feedback Loop | canary / postmortem | Post-release monitoring, failure feedback improvement, dogfooding evidence |
| D7 Ecosystem and Documentation | marketplace / documentation | Marketplace discoverability, community ecosystem, documentation completeness, extension mechanism |

#### 5.1.1 Dimension Attribution Disambiguation (Important)

Some capabilities touch multiple dimensions. To avoid double-counting or drift, use following **single attribution rule** — each capability can only earn points in its best-fit dimension; other dimensions only serve as corroboration (no double-scoring):

| Capability | Default Attribution | Rationale |
|------------|---------------------|-----------|
| TDD (Red-Green-Refactor) | **D1** Methodology | Counts as covered SDLC verify phase; D3 only scores when TDD is Hook-enforced |
| TDD Hook Enforcement | **D3** Enforcement | Distinction from above: D1 sees "process coverage", D3 sees "process bypassability" |
| Parallel Subagent | **D5** Context Management | Core value is context rot resistance, not D2 |
| Agents Layer (role subagent) | **D2** Capability Layering | Counts as D2 when subagent used for role play (CEO/QA/Eng) rather than context isolation |
| Real Browser E2E | **D6** Observability | Test coverage belongs to D1 (methodology verify phase), but end-to-end runtime feedback belongs to D6 |
| MCP Tool Integration | **D2** Capability Layering | Tools layer; not D7 (D7 looks at whether harness itself can be hosted by multiple IDEs/tools, unrelated to MCP) |
| Spec Archive vs ADR Archive | **D4** | Both belong to D4; D1 methodology only sees "whether spec is produced", not whether archived |

**General Discrimination Principle**: A capability **exists** → D2; **is enforced** → D3; **is persisted and searchable** → D4; **used for context reset** → D5; **used for runtime feedback** → D6; **supports marketplace/documentation ecosystem** → D7; none of the above, just SDLC phase coverage → D1.

### 5.2 Scoring Anchors (0/2/4/5)

Each dimension has explicit definitions at four anchors: 0, 2, 4, 5; 1 and 3 are judgments between adjacent anchors. **Complete anchor matrix in Appendix A**.

Example (D3 Enforcement and Gates):

- **0 points**: Entirely prompt-based constraints, no mechanical enforcement; TDD/destructive command interception entirely model-dependent.
- **2 points**: Has some PreToolUse or Stop Hook, but covers single scenario (e.g., only protecting .env).
- **4 points**: rigid/flexible explicitly marked in frontmatter; Hooks cover ≥3 events; provides three types of destructive command interception: force-push / DROP TABLE / rm -rf.
- **5 points**: Has "gate observability" — gate bypass attempts logged to audit log; rigid skills have meta-tests verifying enforcement path; Hook failures provide executable fix suggestions.

### 5.3 Scoring Process

```
                  Rubric Scoring Process

     Input: harness@version repository
              │
              ▼
   ┌─────────────────────┐
   │ Step 1: Prepare Evidence Package │  Scan repository to extract "evidence" for each dimension
   └─────────────────────┘  (related file paths, key code snippets, document excerpts)
              │
              ▼
   ┌─────────────────────┐
   │ Step 2: LLM Scorer  │  Use Sonnet/Opus to score against anchors
   └─────────────────────┘  Output 7 dimension scores + cited evidence for each
              │
              ▼
   ┌─────────────────────┐
   │ Step 3: External Reviewer │  Human (non-harness author) reviews
   └─────────────────────┘  Arbitrate dimensions with ≥1 point disagreement
              │
              ▼
   ┌─────────────────────┐
   │ Step 4: Lock Snapshot │  scores.json + evidence/*.md
   └─────────────────────┘  Write to eval-reports/
```

**Mandatory Constraints**:

- Step 2 LLM model must be noted in metadata (scores drift across models; cross-version comparisons require same model).
- Step 3 human reviewer **cannot be the harness author or core maintainer**.
- When LLM score differs from human score by ≥2 points, disagreement reason must be recorded in evidence/dispute.md.

---

## 6. L3 Standard Task Set (Benchmark)

### 6.1 Design Principles

Benchmark does not test LLM problem-solving ability (SWE-bench already does that), but tests **whether this harness improves the same LLM's stability across multi-phase SDLC**.

Each task runs once in two configurations:

- **Baseline**: Naked Claude Code, no harness.
- **Treatment**: With harness installed.

Ultimately care about **Δ = Treatment − Baseline**, the incremental value brought by the harness.

### 6.2 6 Standard Tasks

| ID | Task Name | Difficulty | Key Capability Tested | Time Limit |
|----|-----------|------------|----------------------|------------|
| T1 | Micro Bug Fix | ⭐ | Can maintain scope, no over-implementation | 10 min |
| T2 | Single Feature CRUD | ⭐⭐ | Complete clarify → plan → TDD → verify pipeline | 30 min |
| T3 | Single File Refactoring | ⭐⭐ | Refactoring boundaries, regression protection, clean git history | 30 min |
| T4 | Cross-Service Integration | ⭐⭐⭐ | Design ADR, dependency management, contract testing | 60 min |
| T5 | 5-Feature Mini SaaS | ⭐⭐⭐⭐ | Long-cycle context rot resistance, parallel subagent, archive | 120 min |
| T6 | Production Incident Triage + Postmortem | ⭐⭐⭐⭐ | Incident workflow, rollback, blameless summary | 60 min |

> **v1.1 Roadmap (identified but not included)**: Three tasks below are explicit gaps in current task set, to be introduced in benchmark v2:
>
> - **T7 Security Review Task** — Given PR with SQL injection / credential exposure / privilege escalation, test if harness gives accurate review conclusions; current D3 enforcement runtime verification mainly covered incidentally by T2/T3, coverage weak.
> - **T8 Performance Regression Task** — Given baseline performance data, introduce slow query, test if harness triggers benchmark / canary; current D6 observability measured only by T6 single shot.
> - **T9 Documentation-First Task** — Pure documentation task producing only ADR and design doc, test D4 archive capability; current D4 scoring mainly by T2/T4 byproducts, no independent ground truth.

Complete specifications (task.md / setup.sh / verify.sh / oracle.json / fixtures/) for each task in Appendix B and `eval/benchmarks/v1/T*/` directory (in design).

### 6.3 Metrics per Task

| Metric | Meaning | Value |
|--------|---------|-------|
| `pass` | Whether all verification scripts pass | 0/1 |
| `hands_off` | Whether human intervention needed during completion | 0/1 (1 = fully automated) |
| `tokens_total` | Total token consumption | int |
| `wall_clock_sec` | Total task duration | int |
| `regression_count` | Number of newly failing tests introduced | int (lower better) |
| `artifacts_produced` | Whether spec / ADR / postmortem produced | 0/1 (only relevant tasks) |
| `scope_drift` | Actual changed files / task declared files | float (closer to 1 better) |

### 6.4 Single Task Score Formula

```
task_score = pass × (
    50                                          # Base pass score
  + 20 × hands_off                              # Automation bonus
  + 10 × clamp(1 - regression_count / 3, 0, 1)  # Regression penalty
  + 10 × artifacts_produced                     # Documentation bonus
  + 10 × clamp(2 - scope_drift, 0, 1)           # Scope discipline
)
# token and wall_clock do not affect single task score; go into efficiency score (separate report, not in HES)
```

Failed tasks score 0 directly. Sum 6 task scores → normalize to 0-100.

### 6.5 Anti-Cheating Design

- Task set stored in private repository, only distributed to sandbox during evaluation (prevents harness vendors from pre-storing fixture answers in skills).
- Each task has ≥3 variants (same semantics, different variable names/structures), randomly selected during evaluation, results averaged across variants.
- Benchmark task set itself versioned; when task set v1 → v2, all historical scores rerun to maintain comparability, or explicitly labeled "based on benchmark v1, not directly comparable to v2 scores".

---

## 7. L4 User Feedback and Dogfooding

### 7.1 Data Sources

| Data Source | Measured Item | Weight |
|-------------|--------------|--------|
| GitHub | stars / forks / watchers, monthly growth rate | 25 |
| GitHub | open issues + average close time + bug:feature ratio | 20 |
| GitHub | contributor count + 90-day active PRs | 15 |
| Third-party Mentions | Independent blog / video / public practice shares | 15 |
| Marketplace | Anthropic or third-party marketplace rating (if available) | 10 |
| Dogfooding | Clear evidence of completing ≥3 real projects with this harness | 15 |

### 7.2 Calculation Details

- Stars / monthly growth use logarithmic normalization to avoid large projects dominating: `log10(stars + 1) / log10(10000) × 100`, capped at 100.
- "Average issue close time" has four tiers: <7d / 7-30d / 30-90d / >90d corresponding to 100/75/50/25 points.
- "90-day active PRs" normalized by z-score across all harnesses in current evaluation set (relative metric).

### 7.3 Cold Start Exemption

Harnesses released < 90 days:

- Among L4's 6 data sources, "GitHub three items" and "marketplace rating" can be marked N/A.
- L4 total weight temporarily reduced from 15% to 0%, score redistributed to L3 (weight increased to 55%).
- Evaluation report must explicitly mark `feedback_status: cold_start`.

### 7.4 Anti-Gaming Design

- Star/fork historical data examined as curves, not absolute values — pull 90-day daily increments from GitHub Archive, identify and exclude obvious "batch star" events.
- Third-party mentions must include URL and author identification; own blog, employee blog, paid promotion excluded.
- Dogfooding evidence must be **publicly verifiable** projects (open source repositories or verified private screenshots).

---

## 8. Aggregation Formula and Grades

### 8.1 Formula

```
HES = L1_score × 0.15
    + L2_score × 0.30
    + L3_score × 0.40
    + L4_score × 0.15

Where each layer's score already normalized to 0-100.
```

Cold start harnesses (<90 days old, sparse L4 data):

```
HES_cold = L1 × 0.20   # +5%
         + L2 × 0.40   # +10%
         + L3 × 0.40   # unchanged
         + L4 × 0.00   # marked as cold_start
```

**Why not merge all L4 into L3**: Benchmark scores for cold start harnesses have highest variance (task set may not align with harness design expectations). Putting all 15% weight on L3 would let single points determine grade. Instead, distribute to L1 (factual metrics stable) + L2 (reviews have human calibration), making cold start scores nearly as stable as mature harnesses.

### 8.2 Grade Mapping

| Grade | HES Range | Meaning |
|-------|-----------|---------|
| **S** | 90-100 | Leading across all dimensions; recommended as team default |
| **A** | 80-89 | Strong; may have gaps in specific dimensions, need supplements |
| **B** | 70-79 | Mainstream usable; significant improvement over baseline |
| **C** | 60-69 | Conceptually usable, but engineering immaturity; suitable for early adopters |
| **D** | < 60 | Not recommended for production, or only suitable for specific scenarios (e.g., demos only) |

### 8.3 Dimension Radar Chart

In addition to HES total, report must include **dimension radar chart** showing L2's 7 dimension distribution — two harnesses with same total score may have completely different dimension profiles (e.g., both 80 points, one balanced, one with D3/D4 perfect but D7 missing), radar chart enables selection decisions based on dimensions.

---

## 9. `harness:evaluate` Automated Evaluation Architecture

### 9.1 Design Overview (Not implemented in current phase, only finalized)

```
┌─────────────────────────────────────────────────────────────────┐
│                     harness:evaluate                              │
│                                                                  │
│  Input:  --target <git-url>@<ref>  --benchmark <version>          │
│  Output: eval-reports/<harness>@<version>/{report.md,scores.json} │
│                                                                  │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│   │ 1. Static    │   │ 2. Rubric    │   │ 3. Benchmark │         │
│   │    Scanner   │   │    Evaluator │   │    Runner    │         │
│   │  (no LLM)    │   │  (LLM agent) │   │  (sandbox)   │         │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘         │
│          │                  │                  │                  │
│          └──────────────────┼──────────────────┘                  │
│                             │                                     │
│                ┌────────────▼────────────┐                        │
│                │  4. Feedback Collector  │                        │
│                │  (GitHub API / manual)  │                        │
│                └────────────┬────────────┘                        │
│                             │                                     │
│                ┌────────────▼────────────┐                        │
│                │  5. Aggregator          │                        │
│                │  (formula → HES)        │                        │
│                └────────────┬────────────┘                        │
│                             │                                     │
│                ┌────────────▼────────────┐                        │
│                │  6. Report Generator    │                        │
│                │  (md + json + radar)    │                        │
│                └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Module Responsibilities

#### Module 1: Static Scanner (No LLM)

- Input: Local clone of harness repository.
- Processing: Scan SKILL.md / settings.json / hooks/ / docs/decisions/, calculate all metrics defined in Appendix C.
- Output: `l1.json`, structured metrics + calculated 0-100 score.
- Implementation: Pure Python/shell script, no LLM, results fully reproducible.

#### Module 2: Rubric Evaluator (LLM-driven)

- Input: Harness repository + 7-dimensional anchors from handbook.
- Processing: Two phases:
  - Stage A — Evidence Collection: For each dimension, extract ≤5 evidence fragments (file path + cited code/document) from repository.
  - Stage B — Anchor Matching: Use Sonnet/Opus to compare evidence against anchor definitions, give 0-5 score with rationale.
- Output: `l2.json` + `l2-evidence/<dim>.md`.
- Key Constraint: External human reviewer must arbitrate when disagreement ≥2 points, arbitration result overrides LLM output.

#### Module 3: Benchmark Runner (Sandbox)

- Input: Harness repository + Benchmark task set v1.
- Processing: Each task runs baseline and treatment once in clean docker sandbox (variant random), record all metrics.
- Output: `l3.json` + `l3-traces/<task>/{baseline,treatment}/{transcript.md, diff.patch}`.
- Key Constraints:
  - Sandbox has token budget limit, over budget = task failure.
  - Sandbox outbound network only allows allowlist (git / npm / pip / Anthropic API), prevents task cheating by searching online.
  - Complete transcript for each run, enabling post-hoc audit.

#### Module 4: Feedback Collector

- Input: Harness repository URL + 90-day time window.
- Processing: Call GitHub GraphQL API to pull data; semi-automatic process for third-party mentions / dogfooding (search + human review).
- Output: `l4.json`.
- Key Constraint: Must distinguish "raw data" from "calculated score" — l4.json retains both for easy review.

#### Module 5: Aggregator

- Input: l1 / l2 / l3 / l4 scores.
- Processing: Apply formula → HES + grade.
- Output: `scores.json`.

#### Module 6: Report Generator

- Input: All upstream json + evidence.
- Processing: Render markdown report + radar chart (svg/png) + grade badge.
- Output: `report.md`.

### 9.3 Integration Points with Existing harness-engineering

- New skill: `skills/evaluate/SKILL.md` (using ADR-0001's skill-based architecture).
- New command: `commands/evaluate.md` → `/harness:evaluate`.
- Benchmark task set independent directory: `eval/benchmarks/v1/`.
- Evaluation report archive: `eval/reports/<harness>@<version>/`, following ADR (to be created) archive conventions, git mv preserves history.
- Cross-reference in existing `harness:audit`: When user asks "which harness should I choose", audit guides to evaluate report.

### 9.4 Cost Estimation (Reference)

- Single evaluation:
  - L2 ~200K tokens (7 dimensions × evidence collection + scoring).
  - L3 ~6 tasks × baseline+treatment × **3 variants** (§6.5 anti-cheating requirement) × 50K tokens ≈ **1.8M tokens**.
  - Total single evaluation ≈ 2M tokens.
- Calculation time: L1/L4 < 5 min; L2 ≈ 30 min; L3 ≈ 12-18 hours (including sandbox startup + variant parallel).
- Recommended evaluation frequency: **Once per harness minor version release + quarterly unified evaluation**.
- Throttling strategy: Variant sampling can reduce to 1 (sacrifice anti-cheating), reducing single evaluation to ~600K tokens / 4-6 hours; full evaluation for important releases, sampling for regular health checks.

---

## 10. Report Schema and Examples

### 10.1 scores.json Schema

```json
{
  "harness": "superpowers",
  "version_locator": "v0.5.2",
  "evaluated_at": "2026-05-03T08:00:00Z",
  "benchmark_version": "v1",
  "evaluator_runtime": {
    "L2_rubric_model": "claude-sonnet-4-6",
    "L3_benchmark_model": "claude-sonnet-4-6",
    "note": "Example placeholder, fill actual model string for official evaluation"
  },
  "feedback_status": "active",

  "L1_static": {
    "score": 82,
    "metrics": {
      "skill_atomicity": 14,
      "frontmatter_complete_pct": 100,
      "hook_event_types": 4,
      "...": "..."
    }
  },

  "L2_rubric": {
    "score": 76,
    "dimensions": {
      "D1_methodology": 5,
      "D2_layering": 3,
      "D3_enforcement": 5,
      "D4_traceability": 2,
      "D5_context_hygiene": 4,
      "D6_observability": 3,
      "D7_ecosystem": 5
    },
    "human_reviewer": "external-reviewer-a",
    "llm_human_disputes": 0
  },

  "L3_benchmark": {
    "score": 66,
    "tasks": {
      "T1_bugfix":      {"pass": 1, "hands_off": 1, "regression_count": 0, "scope_drift": 1.0, "artifacts_produced": 0, "score": 90},
      "T2_crud":        {"pass": 1, "hands_off": 1, "regression_count": 0, "scope_drift": 1.2, "artifacts_produced": 0, "score": 88},
      "T3_refactor":    {"pass": 1, "hands_off": 1, "regression_count": 0, "scope_drift": 1.0, "artifacts_produced": 0, "score": 90},
      "T4_integration": {"pass": 1, "hands_off": 0, "regression_count": 0, "scope_drift": 2.5, "artifacts_produced": 0, "score": 60},
      "T5_5feature":    {"pass": 1, "hands_off": 0, "regression_count": 0, "scope_drift": 2.5, "artifacts_produced": 1, "score": 70},
      "T6_incident":    {"pass": 0, "score": 0}
    },
    "_note": "L3.score = mean(task_scores) = (90+88+90+60+70+0)/6 = 66.3"
  },

  "L4_feedback": {
    "score": 88,
    "github": {"stars": 4200, "forks": 310, "issue_close_p50_days": 12},
    "third_party_mentions": 18,
    "dogfooding_evidence": ["url1", "url2", "url3"]
  },

  "HES": 74.7,
  "grade": "B",
  "radar_chart": "report-assets/radar.svg"
}
```

### 10.2 report.md Structure

```markdown
# HEval Report — superpowers@v0.5.2

**Total HES**: 74.7  **Grade**: B
**Evaluated**: 2026-05-03 (benchmark v1, claude-sonnet-4-6)

## One-Sentence Summary
Purest methodology, strictest gates; archive and incident workflow need supplement.

## Dimension Radar
[radar.svg]

## Layer Scores
- L1 Static     82
- L2 Rubric     76
- L3 Benchmark  66
- L4 Feedback   88

Formula Recalculation: 0.15×82 + 0.30×76 + 0.40×66 + 0.15×88 = 12.3 + 22.8 + 26.4 + 13.2 = 74.7

## Key Findings
1. T6 Production Incident task failed: Missing incident workflow skill.
2. D4 Traceability only 2 points: No spec archive mechanism.
3. D7 Ecosystem perfect score: Listed on Anthropic marketplace + complete documentation.

## Recommended References
- Want D3 enforcement perfect capability → Reference superpowers' rigid/flexible frontmatter.
- Don't treat T6 failure as fatal — can combine with gstack's /careful series to supplement.

## Complete Evidence
- [L2 Dimension Evidence](./l2-evidence/)
- [L3 Task Transcripts](./l3-traces/)
```

---

## 11. Evaluator Neutrality and Bias Resistance

HEval directly addresses Harness Engineering Principle 2: **Never let creators independently review their own output**.

### 11.1 Special Rules for Evaluating harness-engineering Itself

- L2 Rubric requires at least 2 external reviewers (non-harness-engineering maintainers), when disagreement ≥1 point, discuss and take average, not highest.
- L3 Benchmark run by other harness vendors on same task set to form comparison baseline, avoiding task set implicit bias toward our own.
- Report must be publicly published in repository, including complete evidence/ and traces/, allowing anyone to rerun and refute.

### 11.2 Neutralization When Evaluating Across Harnesses

- L2 LLM scorer uses same prompt template for all harnesses, only replacing "harness under evaluation" parameter.
- L3 sandbox configuration identical (same LLM, same token budget, same network allowlist, same variant seed).
- L4 data collection pulls same time window for all harnesses simultaneously.

### 11.3 Public Objection Mechanism

Any harness vendor disagreeing with their HEval score can follow "evidence → re-evaluation" process:

1. Submit issue pointing out specific dimension's missing evidence or anchor misjudgment.
2. Handbook maintainer responds within 24h whether re-evaluation needed.
3. If re-evaluated, original report marked superseded, new report references old report in metadata.

---

## 12. Validation Case: Sample Scores for 5 Existing Harnesses

> This section is a dry-run to verify 7 dimensions have discriminative power (not all 5 harnesses get 4 points).
> Data source: This repository `references/four-frameworks-comparison.md` + reading each harness's public repository.
> **Formal scoring must follow complete §3-§9 process**; this section only for design validation, not authoritative ranking.

| Dimension | OpenSpec | Superpowers | gstack | GSD | harness-engineering |
|-----------|----------|-------------|--------|-----|---------------------|
| D1 Methodology Completeness | 3 | 5 | 3 | 4 | 4 |
| D2 Capability Layering | 2 | 4 | 4 | 3 | 4 |
| D3 Enforcement and Gates | 1 | 5 | 4 | 3 | 4 |
| D4 Traceability and Archive | 5 | 1 | 1 | 4 | 3 |
| D5 Context Management | 3 | 3 | 2 | 5 | 4 |
| D6 Observability | 2 | 3 | 5 | 3 | 3 |
| D7 Ecosystem | 3 | 5 | 3 | 2 | 4 |
| **L2 Total (normalized to 100)** | **54** | **74** | **63** | **69** | **74** |

Observations:

- **OpenSpec** scores perfect D4 (living spec archive is its killer feature) but only 1 point D3 (no enforcement hooks), extremely skewed distribution — this is quantitative evidence for four-frameworks-comparison.md's judgment that "OpenSpec needs other frameworks to be complete".
- **Superpowers** perfect in D1/D3/D7, but only 1 point D4 — exactly matching original star matrix's weakness of "no living spec archive".
- **gstack** perfect D6 (exclusive real browser QA + canary + benchmark), but 1 point D4 — typical "strong productization, weak methodology" profile.
- **GSD** perfect D5 (fresh context is its core proposition), D2 only 3 points (weak role/agent layer).
- **harness-engineering** ties Superpowers at 74 points, different distribution — latter sharper in methodology purity (D1/D3/D7), former more balanced in layering (D2) + context management (D5) + archive (D4). harness-engineering has no killer feature by design, needs P1/P2 borrowings from OpenSpec's D4 and gstack's D6 to fill gaps.
- **D2 scoring neutrality check**: harness-engineering gave itself 4 points (not 5) for D2 because although six-layer model is complete, inter-layer dependency rule automation verification (one D2 perfect condition) currently relies on manual review, not mechanical checking. This self-restraint demonstrates §11.1 neutrality rules in action.

**Discriminative Conclusion**: Among 7 dimensions × 5 harnesses = 35 scores, 1-5 points all appear, no single dimension fully scored or under-scored, discriminative power acceptable. Design OK.

---

## 13. Compatibility with four-frameworks-comparison.md

### 13.1 Dimension Mapping

| four-frameworks Old Dimension | HEval New Dimension |
|-------------------------------|---------------------|
| Spec Archive | D4 Traceability and Archive |
| Long-cycle Context Rot Resistance | D5 Context Management |
| TDD Strictness | D3 Enforcement and Gates (partial) + D1 Methodology (partial) |
| Parallel Execution | D5 Context Management (merged) |
| Product/Scope Challenge | D1 Methodology Completeness (covers clarify phase) |
| Real Browser E2E | D6 Observability (merged) |
| Destructive Action Protection | D3 Enforcement and Gates (merged) |
| Production Release & Monitoring | D6 Observability (merged) |
| Methodology Purity | D1 Methodology Completeness |

Old 9 dimensions partially overlapped (e.g., "TDD Strictness" and "Methodology Purity" influenced each other), HEval merged to 7 mutually exclusive dimensions.

### 13.2 Old Document Retention

- `four-frameworks-comparison.md` **retained** as historical context, but top must add deprecation note pointing to this handbook and HEval reports.
- Any external harness selection recommendation must use HEval reports, no longer use old star matrix.
- Old document's Section III "Project Reference Recommendations" P0/P1/P2 roadmap retained, but needs reordering after first HEval reports produced (use dimension gaps instead of intuition).

---

## Appendix A: Complete Rubric Anchor Definitions

> Each dimension gives explicit 0 / 2 / 4 / 5 definitions. Levels 1 and 3 determined by scorer judgment (between adjacent anchors).

### D1 Methodology Completeness

- **0**: No explicit methodology proposition, just tool collection.
- **2**: Covers 2-3 SDLC phases (e.g., only plan + code), no explicit artifacts for other phases.
- **4**: Covers 5+ phases (clarify / design / plan / code / verify), each phase has identifiable entry point (skill / command / document section).
- **5**: Covers complete SDLC (including ship / monitor), with explicit contracts between phases (one phase's output = next phase's input), methodology explicitly stated as philosophical statement in README.

### D2 Capability Layering

> **Important Neutrality Note**: Six-layer model itself is a harness-engineering concept; to avoid D2 anchors directly rewarding "adoption of harness-engineering terminology", this dimension judges "types of capabilities provided" rather than specific layer names. Any harness expressing equivalent capabilities in its own terminology (e.g., superpowers' skill + agent + hook classification) counts toward corresponding layer.

- **0**: Only 1 type of capability (e.g., just prompt templates).
- **2**: Covers 2-3 types of capabilities.
- **4**: Covers 4-5 types of capabilities **or** covers all 6 types but inter-layer dependency rules not explicit.
- **5**: Covers all 6 types (static memory / deterministic rules / on-demand skills / isolated agents / enforcement hooks / tool extensions), **and** has explicit inter-layer dependency rules (which layer cannot depend on which), **and** this rule is automatically verified (not just documented).

### D3 Enforcement and Gates

- **0**: Entirely prompt-based constraints, no mechanical enforcement.
- **2**: Has some PreToolUse or Stop Hook, covering single scenario (e.g., only protecting .env).
- **4**: rigid/flexible explicitly marked in frontmatter; Hooks cover ≥3 event types; provides at least 2 types of destructive command interception (force-push / DROP TABLE / rm -rf etc.).
- **5**: Has "gate observability" — gate bypass attempts logged to audit log; rigid skills have meta-tests verifying enforcement path; Hook failures provide executable fix suggestions.

### D4 Traceability and Archive

- **0**: No persistence mechanism for spec / decisions / progress.
- **2**: Has ADR or progress file, but no archive mechanism (old records directly overwritten).
- **4**: Has spec and ADR archive mechanism (e.g., changes/ → archive/), archive retains git history.
- **5**: Archive mechanism complete and searchable; provides query / dump skills; archive schema explicitly defined; progress file has both machine-readable and human-readable formats.

### D5 Context Management and Anti-corrosion

- **0**: No context management strategy; context naturally grows until overflow.
- **2**: Has trim / clear operations but all manually invoked; no parallel subagent.
- **4**: Has explicit "fresh context per phase" mechanism; provides parallel subagent skill; can restore progress between sessions.
- **5**: Context health continuously monitored (token usage baseline comparison); parallel/serial dependency graph automatically inferred; context rot detection triggers automatic reset.

### D6 Observability and Feedback Loop

- **0**: Ends after release, no post-release monitoring; failures don't feed back to improvement.
- **2**: Has habit of recording failures to ADR / postmortem, but entirely manual.
- **4**: Has automated monitoring for any of canary / benchmark / E2E; postmortem process explicit.
- **5**: Covers all three: canary + benchmark + E2E automated feedback; failure-to-harness-improvement feedback path explicitly documented and dogfooded (has real cases).

### D7 Ecosystem and Documentation

- **0**: Paths hardcoded, no documentation.
- **2**: Documentation exists but scattered; not listed in any marketplace.
- **4**: Listed in ≥1 marketplace; documentation layered (README / handbook / ADR); architecture diagram + ADR system complete.
- **5**: ≥3 naturally growing installs in marketplace; ≥10 community contributors; provides "extend itself" skill (writing-skills or equivalent).

---

## Appendix B: Benchmark Task Specifications

> Complete task.md / setup.sh / verify.sh / oracle.json in `eval/benchmarks/v1/T*/` directory. This appendix gives design intent and verification points for each task.

### T1 — Micro Bug Fix

**Setup**: Given 50-line small service with 1 failing unit test (off-by-one error).
**Task**: Have harness fix it, **must not** modify any code unrelated to the bug.
**Verify**:
- Failed test turns green.
- `git diff` affects ≤ 5 lines and only in original failing function.
- No new files created.

**Tests**: Scope discipline + minimal changes. Most harnesses should score perfect here; failure indicates over-implementation tendency.

### T2 — Single Feature CRUD

**Setup**: Todo app skeleton (user table exists), task is to add "filter by tag" feature.
**Verify**:
- New API matches OpenAPI contract in oracle.json.
- Has corresponding unit + integration tests.
- Produces documentation artifacts like spec / plan (D4 bonus).

**Tests**: Complete SDLC pipeline + archive artifact production.

### T3 — Single File Refactoring

**Setup**: 600-line single-file service, needs splitting into ≥3 modules.
**Verify**:
- All original tests still pass (regression_count = 0).
- Refactoring and feature changes are separate commits in git history.
- Module boundaries and split rationale documented in ADR or design doc.

**Tests**: Refactoring discipline (no feature creep) + decision recording.

### T4 — Cross-Service Integration

**Setup**: Two independent services A and B, need integration via message queue; client calls A first, A asynchronously notifies B.
**Verify**:
- Integration tests cover happy path + 1 failure retry scenario.
- Has ADR recording "why MQ instead of sync HTTP".
- Contract tests (what A sends, what B receives) exist separately.

**Tests**: Cross-boundary design + ADR process.

### T5 — 5-Feature Mini SaaS (Long-Cycle)

**Setup**: From scratch, fully develop according to 5-feature spec list: user registration, login, posting, liking, notifications.
**Verify**:
- All 5 features pass end-to-end tests.
- No feature missed due to context overflow during task.
- Has progress persistence file allowing task to resume from midpoint after interruption.
- Parallel doesn't block dependencies (liking depends on posting, but posting and login can run parallel).

**Tests**: Long-cycle context rot resistance, parallel subagent, archive mechanism — this best distinguishes harness engineering depth.

### T6 — Production Incident Triage + Postmortem

**Setup**: Given "launched" service (simulated by script), oracle injects production incident (database connection pool exhaustion causing 5xx spike).
**Verify**:
- Complete triage: identify root cause, locate code position.
- Complete fix: connection pool configuration or code-level fix.
- Complete postmortem: blameless documentation + action items + harness improvement items.

**Tests**: Whether incident workflow is covered, whether can close loop to harness improvement.

---

## Appendix C: Complete Static Metric Formulas

```
# Skill Atomicity (full 15 points)
skill_count = COUNT(skills/**/SKILL.md)
avg_skill_lines = AVG(LINES(skills/**/SKILL.md))
score_atomicity = clamp(
  (skill_count / 10) * 0.5 + (1 - clamp(avg_skill_lines / 200, 0, 1)) * 0.5,
  0, 1
) * 15

# Frontmatter Completeness (full 10 points)
fm_complete = COUNT(skills with name+description+trigger phrase) / skill_count
score_frontmatter = fm_complete * 10

# Hook Event Type Coverage (full 15 points)
hook_event_types = UNIQUE(event field in settings.json hooks.*)
score_hook_coverage = clamp(LEN(hook_event_types) / 4, 0, 1) * 15

# Hook Silent Success (full 5 points)
score_hook_silent = (all hooks have no stdout on success path in dry-run) ? 5 : 0

# ADR Count and Freshness (full 10 points)
adr_count = COUNT(docs/decisions/0*.md)
recent_adr = COUNT(docs/decisions/*.md WHERE mtime > now - 180d)
score_adr = clamp(adr_count / 5, 0, 1) * 5 + clamp(recent_adr, 0, 1) * 5

# Documentation Density (full 10 points)
doc_words = WORDCOUNT(docs/**, references/**)
code_lines = LINES(skills/**, hooks/**, scripts/**)
score_doc_density = clamp((doc_words / max(code_lines, 1)) / 0.5, 0, 1) * 10

# Self-test (full 10 points)
score_selftest = (EXISTS(self-test.sh) AND PASSES) ? 10 : 0

# Marketplace Discoverability (full 5 points)
score_marketplace = (listed in ≥1 marketplace) ? 5 : 0

# Dependency Hygiene (full 5 points)
non_dev_deps = COUNT(package.json/dependencies + equivalent)
licenses_ok = ALL(deps WHERE license IN allowlist)
score_deps = (non_dev_deps <= 5 AND licenses_ok) ? 5 : 0

# Meta-tests (full 5 points)
score_meta_tests = (≥1 skill category has tests) ? 5 : 0

# L1 Total Score (0-100)
L1_score = SUM(all score_*)
```

---

## Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-05-03 | v1.0 | Initial release; 7 dimensions + 6 tasks + 4-layer evaluation framework finalized |

> Any modification to dimension anchors, task set, or aggregation weights must leave changelog entry here, and update "next review trigger condition" in ADR-0006.