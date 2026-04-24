# Task Templates

Use these templates for STEP 6. Always copy the ACTUAL stacktrace from
`mcp_firebase_crashlytics_get_report` — never leave placeholder text.

**Config values to substitute at runtime** (from `crash-to-vibe.json`):
- `[JIRA_CLOUD_ID]` → `jira.cloudId`
- `[JIRA_PROJECT_KEY]` → `jira.projectKey`
- `[JIRA_ISSUE_TYPE]` → `jira.issueType` (default: `Bug`)
- `[JIRA_LABELS]` → `jira.labels` (default: `crash-to-vibe`)

---

## CRITICAL Task Template

**Title format**: `🔥 CRITICAL [append "[FRESH ISSUE]" if fresh signal]: [Error Class/Method] ([N] crashes)`

**Description**:

```
**Priority**: CRITICAL - Fix this week [append "⚠️ NEW IN LATEST VERSION" if fresh signal]

**🤖 AI Agent Recommendations**:
- Best Agent: Claude Code (complex logic) or Codex (file editing)
- Execution Type: Automated with human review
- Expected Resolution Time: 2–4 hours

**Issue Summary**:
- Issue ID: [Firebase Issue ID]
- Error: [Full error class path]
- Exception: [Complete exception message from sample crash]
- Impact: [X] crashes affecting [Y] users (~8-day period)
- Crash-Free Users: [XX.XX%] (Target: >99.5%)
- Versions: [firstSeenVersion] → [lastSeenVersion]
- Signals: [include applicable: 🆕 Fresh | 🔄 Regressed | 🔁 Repetitive | ⚡ Early Crash]
- Firebase Link: [Complete Console URI]
- Crash Trend: [Increasing/Stable/Decreasing]

**Detailed Stacktrace** (from sample crash):
[PASTE ACTUAL STACKTRACE HERE — exception type, message, complete call stack with file:line]

**Crash Context**:
- Affected Devices: [Top 3–5 device models]
- Affected OS Versions: [Versions with highest impact]
- Memory at Crash: [Memory usage if available]
- Session Duration: [Time before crash]
- User Activity: [Last known action before crash]

**Custom Logs & Keys** (if available):
- [Relevant key-value pairs and log messages before crash]

**Root Cause Analysis**:
- Primary cause: [NullPointerException / IndexOutOfBounds / etc.]
- Triggering condition: [What causes this]
- Code location: [File:Line from stacktrace]
- Contributing factors: [Memory pressure, thread issues, timing]

**AI-Executable Action Items**:
1. Code Analysis: Examine stacktrace at [File:Line]; check device/OS compatibility
2. Fix Generation: Add null safety, defensive coding, proper error handling
3. Test Creation: Unit tests for crash scenario; integration tests for user flow
4. PR Creation: Detailed PR with stacktrace reference and before/after metrics

**Files to Investigate**:
- [File:Line from stacktrace]
- [Related module/feature paths]
- [Base classes or parent components]

**Acceptance Criteria**:
- [ ] Crash rate reduced by 90%+
- [ ] Root cause addressed at [File:Line]
- [ ] Null safety / defensive coding added
- [ ] Unit tests added for edge cases
- [ ] Integration tests cover user flow before crash
- [ ] Crash-free users % improved to >99.5%
- [ ] Firebase monitoring confirms fix deployment

**🚀 Ready for AI Execution**: Complete crash context, stacktrace, and device data included.
```

**Create Jira issue**:
```
mcp_atlassian_createJiraIssue:
- cloudId: "[JIRA_CLOUD_ID]"
- projectKey: "[JIRA_PROJECT_KEY]"
- issueTypeName: "[JIRA_ISSUE_TYPE]"
- summary: [title above]
- description: [description above — Markdown format]
- additional_fields: {
    "priority": { "name": "Highest" },
    "labels": ["crash-to-vibe", "[JIRA_LABELS]", "crashlytics", "critical", "ai-ready"]
  }
```

**Before starting work — create branch**:
```
Branch format: bugfix/[JIRA_PROJECT_KEY]-[ISSUE-NUMBER]_[brief-description]
Source: develop

git checkout develop && git pull origin develop
git checkout -b bugfix/[JIRA_PROJECT_KEY]-[ISSUE-NUMBER]_[brief-description]
```

**Commit convention**: `[JIRA_PROJECT_KEY]-[ISSUE-NUMBER] [present-tense description]`
Example: `[JIRA_PROJECT_KEY]-1234 fix crash on base activity getBinding`

**Unit test requirements**:
- Logic/business classes: REQUIRED (80%+ coverage, all edge cases)
- UI/View classes (Activity, Fragment, Adapter, ViewHolder, CustomView): OPTIONAL — UI/Espresso tests preferred; document skip reason in PR
- Mixed logic+UI classes: REQUIRED — extract to ViewModel/UseCase, test the logic
- Manual testing: MANDATORY for all changes

---

## HIGH Priority Task Template

**Title format**: `🔥 HIGH [append "[REGRESSED]" if regressed signal]: [Error Summary] ([N] crashes)`

**Description**:

```
**Priority**: HIGH - Fix this sprint [append "🔄 PREVIOUSLY FIXED, NOW RETURNED" if regressed]

**🤖 AI Agent Recommendations**:
- Best Agent: Codex (refactoring) or Gemini CLI (performance)
- Execution Type: Automated with periodic check-ins
- Expected Resolution Time: 4–8 hours

**Issue Summary**:
- Issue ID: [Firebase Issue ID]
- Error: [Full error class path]
- Exception: [Exception message from sample crash]
- Impact: [X] crashes affecting [Y] users (~8-day period)
- Crash-Free Users: [XX.XX%]
- Versions: [firstSeenVersion] → [lastSeenVersion]
- Signals: [include applicable: 🔄 Regressed | 🔁 Repetitive | ⚡ Early Crash]
- Firebase Link: [Console URI]

**Detailed Stacktrace** (from sample crash):
[PASTE ACTUAL STACKTRACE HERE — exception type, complete call stack with file:line]

**Crash Context**:
- Affected Devices: [Top device models]
- Affected OS Versions: [OS versions with highest impact]
- Memory/Session Data: [Available context]

**Root Cause Analysis**:
[Based on stacktrace and detailed issue data]

**AI-Executable Action Items**:
1. Code Analysis: Review stacktrace, identify pattern
2. Refactoring: Improve code structure if needed
3. Fix Implementation: Address root cause with proper error handling
4. Testing: Create comprehensive test coverage
5. PR Creation: Set up alerts for regression

**Acceptance Criteria**:
- [ ] Crash rate reduced by 85%+
- [ ] Root cause fixed at [File:Line]
- [ ] Tests prevent regression
- [ ] Device/OS compatibility verified
- [ ] Crash-free users % improved

**🚀 Ready for AI Execution**: Complete crash data included for automated resolution.
```

**Create Jira issue**:
```
mcp_atlassian_createJiraIssue:
- cloudId: "[JIRA_CLOUD_ID]"
- projectKey: "[JIRA_PROJECT_KEY]"
- issueTypeName: "[JIRA_ISSUE_TYPE]"
- summary: [title above]
- description: [description above — Markdown format]
- additional_fields: {
    "priority": { "name": "High" },
    "labels": ["crash-to-vibe", "[JIRA_LABELS]", "crashlytics", "high-priority", "ai-ready"]
  }
```

**Before starting work — create branch**:
```
Branch format: bugfix/[JIRA_PROJECT_KEY]-[ISSUE-NUMBER]_[brief-description]
Source: develop

git checkout develop && git pull origin develop
git checkout -b bugfix/[JIRA_PROJECT_KEY]-[ISSUE-NUMBER]_[brief-description]
```

**Commit convention**: `[JIRA_PROJECT_KEY]-[ISSUE-NUMBER] [present-tense description]`

**Unit test requirements**: Same as CRITICAL above.

---

## PERFORMANCE / MEDIUM Task Template

**Title format**: `⚡ PERFORMANCE [append "[REPETITIVE]" if repetitive, "[EARLY]" if early signal]: [Issue] ([N] events)`

**Description**:

```
**Priority**: MEDIUM - Performance optimization
[append "🔁 MULTIPLE OCCURRENCES PER USER" if repetitive]
[append "⚡ CRASHES IN FIRST 5 SECONDS" if early]

**🤖 AI Agent Recommendations**:
- Best Agent: Gemini CLI (performance) or Claude Code (analysis)
- Execution Type: Automated with benchmarking
- Expected Resolution Time: 6–12 hours

**Issue Summary**:
- Issue ID: [Firebase Issue ID]
- Error: [Performance-related error]
- Impact: [N] events affecting [Y] users
- Performance Impact: [ANR / slow frames / memory pressure]
- Versions: [firstSeenVersion] → [lastSeenVersion]
- Signals: [include applicable: 🔁 Repetitive | ⚡ Early Crash]
- Firebase Link: [Console URI]

**Performance Context**:
- Affected Devices: [Devices with most issues]
- Affected OS Versions: [Highest impact versions]
- Memory Patterns: [Memory usage at time of issue]
- Thread Information: [Main thread blocking, background threads]
- Session Timing: [When in session the issue occurs]

**Stacktrace / ANR Trace** (from sample crash):
[PASTE ACTUAL STACKTRACE/TRACE HERE — shows the performance bottleneck with file:line]

**Root Cause Analysis**:
- Bottleneck location: [File:Line]
- Contributing factors: [UI thread blocking / memory / I/O]
- Pattern: [app launch / specific feature / background]

**AI-Executable Optimization Items**:
1. Performance Profiling: Analyze memory/CPU at [File:Line]; identify expensive operations
2. Algorithm Optimization: Improve inefficient code paths; add async processing
3. Resource Management: Optimize memory allocation; implement caching / lazy loading
4. Monitoring: Add performance metrics; implement trace markers; set up ANR alerts

**Acceptance Criteria** (AI-measurable):
- [ ] Event volume reduced by 80%+
- [ ] Bottleneck resolved at [File:Line]
- [ ] Memory/CPU usage optimized (profiling confirmed)
- [ ] ANR rate reduced (if applicable)
- [ ] Frame rendering improved (if UI-related)
- [ ] Device/OS compatibility maintained

**🚀 Ready for AI Execution**: Complete performance data and traces included.
```

**Create Jira issue**:
```
mcp_atlassian_createJiraIssue:
- cloudId: "[JIRA_CLOUD_ID]"
- projectKey: "[JIRA_PROJECT_KEY]"
- issueTypeName: "Task"
- summary: [title above]
- description: [description above — Markdown format]
- additional_fields: {
    "priority": { "name": "Medium" },
    "labels": ["crash-to-vibe", "[JIRA_LABELS]", "crashlytics", "performance", "optimization", "ai-ready"]
  }
```

**Before starting work — create branch**:
```
Branch format: performance/[JIRA_PROJECT_KEY]-[ISSUE-NUMBER]_[brief-description]
Source: develop

git checkout develop && git pull origin develop
git checkout -b performance/[JIRA_PROJECT_KEY]-[ISSUE-NUMBER]_[brief-description]
```

**Commit convention**: `[JIRA_PROJECT_KEY]-[ISSUE-NUMBER] [present-tense description]`
Example: `[JIRA_PROJECT_KEY]-1236 optimize memory allocation in main thread`

**Performance test requirements**:
- Logic/business classes: REQUIRED — unit tests + benchmarks; verify optimization doesn't break functionality
- UI/View classes: OPTIONAL — profile with Profiler tools; document before/after metrics
- Critical performance paths: REQUIRED — benchmark tests; measure execution time improvements; test low-end devices
- Manual performance testing: MANDATORY — use Profiler tools; include metrics in PR description

---

## MONITORING Task Template

**Title**: `📊 MONITORING: Firebase Crashlytics Alerts & Prevention`

**Create Jira issue**:
```
mcp_atlassian_createJiraIssue:
- cloudId: "[JIRA_CLOUD_ID]"
- projectKey: "[JIRA_PROJECT_KEY]"
- issueTypeName: "Task"
- summary: "📊 MONITORING: Firebase Crashlytics Alerts & Prevention"
- description: [see below]
- additional_fields: {
    "priority": { "name": "Low" },
    "labels": ["crash-to-vibe", "[JIRA_LABELS]", "crashlytics", "monitoring"]
  }
```

**Description**:

```
**Priority**: LOW - Monitoring setup

**🤖 AI Agent Recommendations**:
- Best Agent: Setup Script + Claude Code
- Execution Type: Automated setup
- Expected Resolution Time: 3–6 hours

**Purpose**: Implement proactive monitoring to prevent future critical issues

**AI-Executable Setup Items**:
1. Crashlytics Alerts:
   - Alert when crashes > 100 events/day
   - Alert when crash-free users % < 99.5%
   - Alert for new crash types

2. Error Boundary Implementation:
   - Defensive coding in base classes
   - Global exception handlers with pattern recognition
   - AI-validated checks before critical operations

3. Automated Testing Checklist

**Acceptance Criteria**:
- [ ] Crashlytics alerts configured
- [ ] Error boundary documentation created
- [ ] Monthly crash report automation set up
- [ ] Performance monitoring implemented
```
