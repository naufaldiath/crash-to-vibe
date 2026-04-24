---
name: crash-to-vibe
description: >
  Analyzes Firebase Crashlytics crash reports for mobile apps (Android, iOS, Flutter)
  and creates prioritized Jira issues. Auto-activates when you mention: Firebase crashes,
  Crashlytics, mobile crash analysis, triage crash reports, app crash, crash-free users,
  or "analyze my crashes". Discovers Firebase project via MCP at runtime. Reads Jira config
  from crash-to-vibe.json in project root. Creates Jira issues with real stacktraces.
---

# crash-to-vibe: Firebase Crashlytics → Jira

Zero-config skill — no baked-in values. Discovers everything at runtime.

## Prerequisites

- Firebase MCP server connected and authenticated (`firebase login`)
- Atlassian MCP server connected
- `crash-to-vibe.json` in the project root (run `crash-to-vibe --init-project` to create)
- This skill installed globally via `crash-to-vibe --zero-config` (writes to `~/.claude/skills/`, `~/.gemini/skills/`, `~/.agents/skills/`)

---

## STEP 1: Load Project Config

Walk up from CWD to find `crash-to-vibe.json`:

```
1. Check [CWD]/crash-to-vibe.json
2. Check [CWD]/../crash-to-vibe.json
3. Continue up to filesystem root
4. If not found: tell user to run `crash-to-vibe --init-project` in their project root, then stop.
```

Extract from `crash-to-vibe.json`:
- `jira.cloudId` — Atlassian cloud domain (e.g. `company.atlassian.net`)
- `jira.projectKey` — Jira project key (e.g. `PROJ`)
- `jira.issueType` — issue type (default: `Bug`)
- `jira.labels` — comma-separated labels (default: `crash-to-vibe`)
- `thresholds` — optional, use defaults if absent:
  - critical: >800 crashes OR >600 users
  - high: >400 crashes OR >300 users
  - medium: >100 crashes OR >50 users
- `bitbucket` — optional, only used if present

---

## STEP 2: Detect Firebase Project & App

```
1. mcp_firebase_firebase_get_environment
   - Check active_project field

2. If no active project:
   - mcp_firebase_firebase_list_projects
   - Show project list to user, ask which to use
   - mcp_firebase_firebase_update_environment with chosen project_id

3. mcp_firebase_firebase_list_apps
   - List all apps in the active project
   - If only one app: use it automatically
   - If multiple apps: show list, ask user to select (or select Android by default for Android projects)
   - Extract app_id for use in STEP 3
```

---

## STEP 3: Detect Platform

```
Look for these files (search up to 5 levels deep, skip node_modules/.git/build/Pods):

- google-services.json → Android (or Flutter with Android)
- GoogleService-Info.plist → iOS (or Flutter with iOS)
- Both present → Flutter

Use detected platform in STEP 5 (platform-specific focus areas).
Load references/platform-patterns.md for the detected platform's section.
```

---

## STEP 4: Fetch Crash Data (FATAL + NON-FATAL)

### Phase A: List Top Issues
```
1. FATAL crashes:
   mcp_firebase_crashlytics_list_top_issues
   - app_id: [app_id from STEP 2]
   - issue_count: 15
   - issue_type: "FATAL"

2. NON-FATAL issues:
   mcp_firebase_crashlytics_list_top_issues
   - app_id: [app_id from STEP 2]
   - issue_count: 10
   - issue_type: "NON-FATAL"

Extract per issue: ID, title, event count, user count, type, Firebase Console URI,
version range (firstSeenVersion → lastSeenVersion), signals (fresh/regressed/repetitive/early).
```

### Phase B: Fetch Issue Details (top 5–10 by priority)
```
For each priority issue:

1. mcp_firebase_crashlytics_get_issue
   - app_id: [app_id from STEP 2]
   - issue_id: [Issue ID]

2. mcp_firebase_crashlytics_get_report (sample crash)
   - app_id: [app_id from STEP 2]
   - issue_id: [Issue ID]

   CRITICAL: Copy the ACTUAL full stacktrace with file names and line numbers.
   Do NOT use placeholders — include the real stacktrace from the API response.

3. Identify "Fresh Issues":
   - firstSeenVersion == lastSeenVersion → new to current version
   - Look for "fresh" signal in metadata
```

### Phase C: Compile Crash Profile Per Issue
```
- Basic: ID, title, type, event count, user count, crash-free %, signals
- Detail: actual stacktrace, root cause file:line, affected devices/OS, memory data
- Priority: apply threshold rules (STEP 5), boost fresh/regressed issues
- Note: ~8-day reporting window; use Firebase Console links for 30-day analysis
```

---

## STEP 5: Prioritize Issues

```
Use thresholds from crash-to-vibe.json (or defaults if absent):

🔥 CRITICAL: >800 crashes OR >600 users (or config values)
   → Boost for "fresh" signal (new to latest version)
   → Maintain crash-free users >99.5%

🔥 HIGH: >400 crashes OR >300 users (or config values)
   → Flag "regressed" issues (previously fixed, now returned)

⚡ MEDIUM: >100 crashes OR >50 users (or config values)
   → Consider "repetitive" (multiple crashes per user) and "early" (within 5s)

📊 LOW: below medium thresholds — include for pattern detection
```

Apply platform-specific focus areas from `references/platform-patterns.md`.

---

## STEP 6: Create Jira Issues

Load `references/task-templates.md` for CRITICAL, HIGH, and PERFORMANCE issue formats
including stacktrace structure, acceptance criteria, and branch/commit conventions.

Use `mcp_atlassian_createJiraIssue` for each issue:
- cloudId: [jira.cloudId from crash-to-vibe.json]
- projectKey: [jira.projectKey from crash-to-vibe.json]
- issueTypeName: [jira.issueType from crash-to-vibe.json]
- summary: [from template]
- description: [from template — include ACTUAL stacktrace, not placeholders]
- additional_fields: priority + labels (jira.labels from crash-to-vibe.json)

---

## STEP 7: Summary Report

After all issues created, output:

```
## Firebase → Jira Summary

Project: [Firebase project ID]
App: [app_id] ([platform])
Jira: [jira.cloudId] / [jira.projectKey]

Issues Created: [X] total
  🔥 Critical: [X] — fix this week
  🔥 High:     [X] — fix this sprint
  ⚡ Medium:   [X] — next sprint
  📊 Low:      [X] — monitoring

Top 3 Critical Issues:
1. [title] — [X] crashes, [Y] users
2. [title] — [X] crashes, [Y] users
3. [title] — [X] crashes, [Y] users

AI Agent Guide:
- Critical: Claude Code (complex analysis) → immediate
- Performance: Gemini CLI (optimization) → automated benchmarking
- Refactoring: Codex → bulk improvements
- Testing: Amp → comprehensive test suites

Firebase Console links included in all issues for 30-day investigation.
Target: crash-free users >99.5%
```

**Post-execution**: Open Jira → project [jira.projectKey] → assign and triage created issues.

If `bitbucket` is present in `crash-to-vibe.json`, load `references/pr-workflow.md` after AI completes each fix.

---

## Config Reference

`crash-to-vibe.json` minimal example:
```json
{
  "jira": {
    "cloudId": "your-company.atlassian.net",
    "projectKey": "PROJ",
    "issueType": "Bug",
    "labels": "crash-to-vibe"
  }
}
```

Run `crash-to-vibe --init-project` to create this file interactively.
