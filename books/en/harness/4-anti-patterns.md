# Harness Anti-Patterns and Fixes Guide

## Anti-Pattern 1: Overly Bloated CLAUDE.md

**Symptoms**: Rules exceed 100 lines; Claude starts ignoring some rules
**Causes**: Putting all conventions in one file, mixing "should follow" and "must execute"
**Fix**:
- Trim to <60 lines
- Delete rules Claude already executes correctly (reduce token consumption)
- Move complex rules to Hooks (deterministic enforcement)
- Move detailed explanations to docs/ subdirectory, link from CLAUDE.md

**Diagnosis**: For each rule ask—"If I remove this, will Agent make mistakes? Has it in the last 4 weeks?"

---

## Anti-Pattern 2: MCP Overuse

**Symptoms**: 20+ MCP Servers connected; Agent frequently chooses wrong tools; baseline token consumption too high
**Causes**: Using MCP for every tool, including those Agent already has built-in knowledge of (each MCP Server injects ~3000-9000 tokens)
**Fix**:
- Before connecting each tool ask "Can this task be completed without it?"
- Use CLI directly for model-known tools (git, npm, docker, gh)
- Tools with only 3 operations → Write CLI wrapper + CLAUDE.md explanation (~100 tokens)
- Tools with 20+ operations → Use MCP Server

---

## Anti-Pattern 3: Full Test Output

**Symptoms**: 4000 lines of logs on test success; Agent starts discussing test files instead of continuing task
**Causes**: No silent-on-success logic in Hooks, or directly piping `pnpm test` output to Agent
**Fix**:
```bash
# Wrong approach
TEST_OUTPUT=$(pnpm test 2>&1)
echo "$TEST_OUTPUT"  # Output all 4000 lines

# Correct approach
TEST_OUTPUT=$(pnpm test 2>&1)
if [ $? -ne 0 ]; then
  echo "Test failed:" >&2
  echo "$TEST_OUTPUT" | head -50 >&2
  exit 2
fi
# Success = completely silent, no output
```

---

## Anti-Pattern 4: Over-Customized Subagents

**Symptoms**: Define Specialist for every task type; Agent can't reason holistically across domains; modifying API endpoints doesn't consider downstream consumers
**Causes**: Lead-Specialist architecture is too rigid—Specialists only see their own context
**Fix**:
- Use Master-Clone architecture instead (Master Agent clones itself with `Task(...)`)
- Cloned Agents contain full CLAUDE.md, enabling cross-domain reasoning
- Only use pre-defined Specialists for security-sensitive tasks requiring permission isolation

---

## Anti-Pattern 5: "Giant" Single Session

**Symptoms**: Handling 10+ features in one session; output quality degrades after context exceeds 100k; Agent starts prematurely declaring "done"
**Causes**: Context anxiety—models learn to "tidy up and finish" when approaching context limits
**Fix**:
- One feature per session
- Use `/harness:dump` to save progress to claude-progress.json
- Read progress file at new session startup to rebuild state
- "Context reset > context compression"—new Agent has no awareness of "having worked long"

---

## Anti-Pattern 6: Relying on Compaction for Memory

**Symptoms**: Agent starts guessing "what was done last time" across windows; wrong decisions appear mid-long task
**Causes**: Compaction summarizes earlier conversation history, but Agent still "knows" it's been working a long time—anxiety persists
**Fix**:
- Use structured progress files instead (claude-progress.json)
- Agent actively reads progress file on startup, doesn't rely on conversation history
- Use JSON format—Agent respects structured data significantly more than plain text

---

## Anti-Pattern 7: All Conventions in CLAUDE.md

**Symptoms**: "Must" behaviors in CLAUDE.md get occasionally ignored; critical quality checks depend on Agent understanding and judgment
**Causes**: Confusing soft constraints (guidance) with hard constraints (enforcement)
**Fix**:
```
"Must execute regardless of Claude's judgment" → Hook (deterministic enforcement)
"Should follow, explains why" → CLAUDE.md (guidance)
"Deterministic system configuration" → settings.json (Agent-judgment-independent)
```

**All three working together provide complete protection**: CLAUDE.md alone is soft; Hooks alone are hard but lack context; combination is optimal.

---

## Anti-Pattern 8: ADRs Only Write Conclusions, Not Rejected Options

**Symptoms**: Agent "helpfully" rewrites code in ways it thinks are better, breaking intentional design
**Causes**: ADR only recorded "we chose Redis" but not "why not JWT"
**Fix**:
- ADR must list all rejected options and their reasons
- Use "❌ Forbidden X, must use Y" format in "Consequences" section
- Keep "deprecated" ADRs, don't delete—let Agent know "this path was tried and abandoned"

---

## Anti-Pattern 9: Too Many Rules on Day One

**Symptoms**: CLAUDE.md fully populated on day one, but rules are hypothetical, not based on real failures
**Causes**: Trying to cover every case upfront
**Fix**:
- Run Agent on real work for two weeks first, record every manual intervention
- Build constraints around actually observed failure patterns
- "Observe first, constrain later"—hypothetical failure patterns cost more than real ones

**Core advice from San Francisco engineering leaders field research (April 2026)**: Don't standardize on day one. Observe first, then constrain.