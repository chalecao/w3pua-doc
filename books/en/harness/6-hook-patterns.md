# Hook Design Pattern Reference

## Hook Event Types

| Event | Trigger Timing | Typical Use Case |
|-------|---------------|------------------|
| PreToolUse | Before tool call, can intercept or modify parameters | Block dangerous commands, restrict file access scope |
| PostToolUse | Immediately after tool completes | Auto-formatting, telemetry recording |
| Stop | After main Agent completes response | Type checking, test coverage reporting |
| UserPromptSubmit | Before user submits Prompt | Inject additional context, injection detection |
| SessionStart | At session start | Environment check, state loading, greeting message |
| SessionEnd | At session end | Save progress, send notifications, cleanup temporary files |
| SubagentStop | When Subagent completes | Trigger progress sync, record subtask cost |
| FileChanged | When file changes | Trigger incremental testing |

## Exit Code Conventions

```
exit 0   → Success, continue (completely silent)
exit 2   → Failure, feedback error to Agent, Agent continues to fix
exit other → Failure, no feedback to Agent (non-blocking, silent failure)
```

**Key Principle**: Success is always silent. 4000 lines of pass logs cause Agent to lose task focus and start discussing test files instead of completing the task.

## 4 Handler Types

| Type | Suitable Scenario | Characteristics |
|------|------------------|----------------|
| Command (Shell) | Deterministic operations: formatting, type checking, permission validation | Fast execution, deterministic results, easy debugging, lowest cost |
| Prompt (LLM) | Semantic judgment: code quality evaluation, subtle violation detection | Understands semantics, but high cost, slow |
| Agent (Child Agent) | Complex verification: multi-step, needs to read multiple files | Full tool access, can explore autonomously, credible results |
| HTTP (External Service) | System integration: trigger CI, notify Slack, update Jira | Integration with enterprise systems |

**Selection Decision Tree**:
```
Need "semantic understanding"?
  → Yes: Use Prompt or Agent type
  → No: Use Command type (faster and cheaper)

Need to read multiple files or execute multiple steps?
  → Yes: Use Agent type
  → No: Use Prompt type

Need to trigger external systems?
  → Yes: Use HTTP type
```

## Choosing Hooks by Failure Type

| Common Team Failures | Corresponding Hook Event | Handler Type | Priority |
|---------------------|-------------------------|--------------|----------|
| Type errors committed | Stop | Command (tsc / mypy / go vet) | ⭐⭐⭐ Immediate |
| .env file modified | PreToolUse | Command (file path check) | ⭐⭐⭐ Immediate |
| Inconsistent code formatting | PostToolUse | Command (lint:fix) | ⭐⭐⭐ Immediate |
| Architecture violations not detected | PostToolUse | Agent (architecture constraint check) | ⭐⭐ This Week |
| Agent finishes early | Stop | Command (check progress.json) | ⭐⭐ This Week |
| Sub-agent didn't record progress | SubagentStop | HTTP (trigger progress sync) | ⭐ This Month |
| Session ended without committing progress | SessionEnd | Command (git commit progress) | ⭐ This Month |

## settings.json Configuration Example

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "hooks": [
        { "type": "command", "command": ".claude/hooks/stop-typecheck.sh" }
      ]
    }],
    "PreToolUse": [{
      "matcher": "Bash|Edit|Write",
      "hooks": [
        { "type": "command", "command": ".claude/hooks/pre-protect-env.sh" }
      ]
    }],
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [
        { "type": "command", "command": ".claude/hooks/post-format.sh" }
      ]
    }]
  }
}
```

## Minimum Viable Hook Set (Day 1)

Top three highest ROI Hooks:

1. **Stop Hook — Type Checking**: Ensure code is type-correct every time Agent completes
2. **PostToolUse Hook — Auto Formatting**: Ensure consistent code style, completely silent on success
3. **PreToolUse Hook — Protect Sensitive Files**: Prevent access to .env, secret, etc.

These three Hooks cover 80% of common quality issues and are the fastest way to establish a Harness.