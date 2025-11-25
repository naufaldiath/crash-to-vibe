# 🔥 Firebase Crashlytics to {{KANBAN_SYSTEM}} - AI-Powered Automation Workflow

## 🎯 EXECUTE THIS COMPREHENSIVE WORKFLOW

You are a Firebase Crashlytics and {{KANBAN_SYSTEM}} automation specialist. Execute this complete workflow to fetch Firebase crash data (both FATAL and NON-FATAL) and create corresponding detailed tasks for the {{PROJECT_NAME}} {{PLATFORM}} project. This workflow covers both fatal crashes that cause app termination and non-fatal issues that impact user experience.

**🤖 AI Integration**: Tasks created through this workflow can be automatically executed by AI agents (Claude Code, Codex, Gemini CLI, Amp) for immediate problem resolution without manual intervention.

## 📋 STEP-BY-STEP EXECUTION

### STEP 1: SETUP FIREBASE ENVIRONMENT
```
1. Use mcp_firebase_firebase_update_environment to set:
   - project_dir: "{{PROJECT_DIR}}"
   - active_project: "{{FIREBASE_PROJECT_ID}}"

2. Verify setup with mcp_firebase_firebase_get_environment

3. If firebase.json missing, run mcp_firebase_firebase_init with empty features: {}
```

### STEP 2: FETCH COMPREHENSIVE CRASHLYTICS DATA

#### Phase A: List Top Issues
```
1. Get FATAL crashes (Current tool limitation: ~7-8 day period):
   - Use mcp_firebase_crashlytics_list_top_issues
   - app_id: "{{APP_ID}}"
   - issue_count: 15 (reasonable limit for fatal crashes - API max is 100 per call)
   - issue_type: "FATAL"

2. Get NON-FATAL issues:
   - Use mcp_firebase_crashlytics_list_top_issues
   - app_id: "{{APP_ID}}"
   - issue_count: 10 (reasonable limit for non-fatal issues)
   - issue_type: "NON-FATAL"

3. Extract from each issue in the list:
   - Issue ID (required for detailed fetching)
   - Issue title
   - Event count and impacted users
   - Error type and subtitle (FATAL or NON-FATAL)
   - Firebase Console URI
   - Version range (firstSeenVersion to lastSeenVersion)
   - Any signals (repetitive, fresh, regressed, early)
   - Crash trend over the available period
```

#### Phase B: Fetch Detailed Issue Information
```
For EACH issue fetched in Phase A (prioritize top 5-10 most critical):

1. Get detailed issue information:
   - Use mcp_firebase_crashlytics_get_issue_details
   - app_id: "{{APP_ID}}"
   - issue_id: [Issue ID from Phase A]

   Extract additional details:
   - Complete stacktrace
   - Affected devices and OS versions
   - Crash-free users percentage
   - Impact trends
   - Custom keys and logs
   - Session duration before crash

2. Get sample crash report:
   - Use mcp_firebase_crashlytics_get_sample_crash_for_issue
   - app_id: "{{APP_ID}}"
   - issue_id: [Issue ID from Phase A]

   Extract crash sample details:
   - **CRITICAL: Full exception stacktrace with line numbers** - This MUST be included in the task description
   - Device information (model, OS version, orientation)
   - Memory usage at crash time
   - User activity before crash
   - Custom log messages
   - Thread information
   - Application state

   ⚠️ IMPORTANT: The actual stacktrace text from this API response MUST be copied into the task description.
   Do NOT use placeholders like "[Full stacktrace here]" - include the real stacktrace data.

3. Identify "Fresh Issues":
   - Check if firstSeenVersion == lastSeenVersion (new to current version)
   - Look for "fresh" signal in issue metadata
   - Compare firstSeenTime with app version release date
   - Flag issues that only appear in the latest version
```

#### Phase C: Compile Comprehensive Crash Data
```
For each issue, compile a complete crash profile:

1. Basic Information (from Phase A):
   - Issue ID, title, type (FATAL/NON-FATAL)
   - Event count, user count, crash-free percentage
   - Signals: fresh, regressed, early, repetitive

2. Detailed Analysis (from Phase B):
   - **ACTUAL stacktrace text** (not placeholder - copy the real stacktrace from API response)
   - Root cause file and line number
   - Affected device models and OS versions
   - Memory/performance patterns
   - User journey before crash
   - Related custom keys/logs

3. Priority Classification:
   - Apply threshold rules (CRITICAL/HIGH/MEDIUM/LOW)
   - Consider "Fresh Issue" status for higher priority
   - Factor in crash-free users percentage impact
   - Evaluate user experience severity

4. Notes:
   - Tool limitation: ~7-8 day period for trends
   - For 30-day analysis, use Firebase Console links
   - For pagination, use nextPageToken if available
   - Detailed fetching recommended for top 5-10 issues to avoid rate limits
```

### STEP 3: IDENTIFY TARGET PROJECT ({{KANBAN_SYSTEM}})

{{#if (eq KANBAN_SYSTEM "vibe")}}
#### VIBE KANBAN SETUP
```
1. Use mcp_vibe_kanban_list_projects to get available projects

2. Find "{{KANBAN_PROJECT_NAME}}" project and extract project_id
   - Expected project_id format: UUID string (e.g., 7a5de88c-ff9c-4388-8992-d291e77c6982)
   - Project name should match: "{{KANBAN_PROJECT_NAME}}"

3. Note: Vibe Kanban supports AI agent execution for automated task resolution
   - AI agents can analyze crashes and generate fixes automatically
   - Supported agents: Claude Code, Codex, Gemini CLI, Amp
   - Tasks will be ready for immediate AI execution after creation
```
{{/if}}

{{#if (eq KANBAN_SYSTEM "jira")}}
#### JIRA SETUP
```
1. Get Jira user info:
   Use mcp_atlassian_atlassianUserInfo to verify authentication

2. Get accessible Atlassian resources:
   Use mcp_atlassian_getAccessibleAtlassianResources
   - Verify cloudId: "{{JIRA_CLOUD_ID}}"
   - If cloudId not found, use the site URL to resolve it

3. Verify Jira project:
   Use mcp_atlassian_getVisibleJiraProjects
   - cloudId: "{{JIRA_CLOUD_ID}}"
   - action: "create" (to see projects where you can create issues)
   - Find project with key: "{{JIRA_PROJECT_KEY}}"

4. Get issue type metadata:
   Use mcp_atlassian_getJiraProjectIssueTypesMetadata
   - cloudId: "{{JIRA_CLOUD_ID}}"
   - projectIdOrKey: "{{JIRA_PROJECT_KEY}}"
   - Verify issue type "{{JIRA_ISSUE_TYPE}}" is available

5. Note: Jira issues will contain all crash details and can be linked to PRs
   - Issues include full stacktraces and device information
   - Can be assigned to team members for resolution
   - Supports custom fields and workflows
```
{{/if}}

### STEP 4: ANALYZE AND PRIORITIZE ISSUES
```
Priority Classification (~8-day period):
- 🔥 CRITICAL: >{{CRITICAL_CRASHES}} crashes OR >{{CRITICAL_USERS}} users affected (~8-day period)
  - Boost priority for "Fresh Issue" signal (new to latest version)
  - Consider crash-free users % drop (target: maintain >99.5%)
- 🔥 HIGH: >{{HIGH_CRASHES}} crashes OR >{{HIGH_USERS}} users affected (~8-day period)
  - Prioritize "Regressed" issues (previously fixed, now returned)
  - Factor in device/OS version distribution
- ⚡ MEDIUM: >{{MEDIUM_CRASHES}} crashes OR >{{MEDIUM_USERS}} users affected (~8-day period) OR high event volume (>500K)
  - Consider "Repetitive" signal (multiple crashes per user)
  - Evaluate "Early" signal (crashes within first 5 seconds)
- 📊 LOW: <{{MEDIUM_CRASHES}} crashes OR monitoring/prevention tasks
  - Include for comprehensive tracking
  - Useful for pattern detection

Focus Areas for {{PLATFORM}} Projects:
{{#if (eq PLATFORM "android")}}
- ViewBinding/Fragment lifecycle crashes (both fatal and non-fatal)
- Activity lifecycle management errors
- Permission handling issues (SCHEDULE_EXACT_ALARM, etc.)
- Target SDK compatibility issues
- Background execution limitations
- Memory management and OutOfMemoryError prevention
- Threading and concurrency problems
{{/if}}
{{#if (eq PLATFORM "ios")}}
- UIViewController lifecycle crashes
- Auto Layout constraint conflicts
- Memory management and retain cycles
- App Transport Security issues
- iOS version compatibility problems
- Background app refresh limitations
- Core Data threading issues
{{/if}}
{{#if (eq PLATFORM "flutter")}}
- Flutter engine lifecycle management
- Platform channel communication errors
- Widget lifecycle and state management
- Platform-specific integration issues
- Dart VM crashes and exceptions
- Plugin compatibility problems
- Performance bottlenecks in bridge communication
{{/if}}
- Network connectivity and API integration issues
- Performance issues (network, UI, memory)
- Location/GPS related problems
- Third-party SDK integration problems

Note: For 30-day trend analysis, use Firebase Console links in created tasks
```

### STEP 5: CREATE DETAILED TASKS

{{#if (eq KANBAN_SYSTEM "vibe")}}
For each significant issue, use `mcp_vibe_kanban_create_task` with this detailed structure optimized for AI agent execution:
{{/if}}

{{#if (eq KANBAN_SYSTEM "jira")}}
For each significant issue, use `mcp_atlassian_createJiraIssue` with this detailed structure:
{{/if}}

#### CRITICAL TASK TEMPLATE (AI-Ready with Detailed Crash Data):
```
Title: 🔥 CRITICAL{{#if fresh}} [FRESH ISSUE]{{/if}}: [Error Class/Method] ([Event Count] crashes)

Description:
**Priority**: CRITICAL - Fix this week{{#if fresh}} ⚠️ NEW IN LATEST VERSION{{/if}}

**🤖 AI Agent Recommendations**:
- **Best Agent**: Claude Code (for complex logic) or Codex (for file editing)
- **Execution Type**: Automated with human review
- **Expected Resolution Time**: 2-4 hours

**Issue Summary**: [Detailed technical description]
- **Issue ID**: [Firebase Issue ID]
- **Error**: [Full error class path]
- **Exception**: [Complete exception message from sample crash]
- **Impact**: [X] crashes affecting [Y] users (~8-day period)
- **Crash-Free Users**: [XX.XX%] (Target: >99.5%)
- **Versions**: [firstSeenVersion] → [lastSeenVersion]
- **Signals**: {{#if fresh}}🆕 Fresh Issue{{/if}}{{#if regressed}}🔄 Regressed{{/if}}{{#if repetitive}}🔁 Repetitive{{/if}}{{#if early}}⚡ Early Crash{{/if}}
- **Firebase Link**: [Complete Console URI]
- **Crash Trend**: [Increasing/Stable/Decreasing over available period]

**Detailed Stacktrace** (from sample crash):
```
IMPORTANT: Insert the ACTUAL full stacktrace from mcp_firebase_crashlytics_get_sample_crash_for_issue here.
Do NOT leave this as a placeholder - include the complete stacktrace with file names and line numbers.

Example format (replace with actual stacktrace):
  at com.example.app.MyClass.myMethod(MyClass.kt:123)
  at com.example.app.BaseClass.onCreate(BaseClass.kt:45)
  at android.app.Activity.performCreate(Activity.java:8000)
  ...

The stacktrace should show:
- Exception type and message
- Complete call stack with file:line references
- All frames from crash point to app entry point
```

**Crash Context** (from detailed issue data):
- **Affected Devices**: [Top 3-5 device models]
- **Affected OS Versions**: [Android/iOS versions with highest impact]
- **Device Orientation**: [Portrait/Landscape if relevant]
- **Memory at Crash**: [Memory usage data if available]
- **Session Duration**: [Time before crash occurred]
- **User Activity**: [Last known user action before crash]

**Custom Logs & Keys** (if available):
- [Relevant custom key-value pairs]
- [Custom log messages before crash]
- [User flow/navigation before crash]

**Root Cause Analysis**:
[Technical analysis based on stacktrace and crash context]
- Primary cause: [e.g., NullPointerException, IndexOutOfBounds, etc.]
- Triggering condition: [What causes this to happen]
- Code location: [File:Line from stacktrace]
- Contributing factors: [Memory pressure, thread issues, timing, etc.]

**AI-Executable Action Items**:
1. **Code Analysis**:
   - Examine stacktrace at [File:Line]
   - Review affected devices/OS versions for compatibility issues
   - Analyze memory patterns if OutOfMemory related

2. **Fix Generation**:
   - Add null safety checks at identified locations
   - Implement defensive coding for edge cases
   - Add proper error handling and graceful degradation

3. **Test Creation**:
   - Generate unit tests covering crash scenario
   - Add integration tests for affected user flows
   - Create test cases for specific device/OS combinations

4. **Code Review & PR Creation**:
   - Prepare detailed PR with stacktrace reference
   - Include before/after crash rate metrics
   - Document fix rationale and testing approach
   - **Create Pull Request** (if Bitbucket enabled):
     ```
     Use create_pull_request (Bitbucket MCP):
     - workspace: "{{BITBUCKET_WORKSPACE}}"
     - repository: "{{BITBUCKET_REPO_SLUG}}"
     - title: "{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] Fix: [Issue Title]"
     - description: Include Firebase link, Jira task link, stacktrace, root cause, solution, and testing checklist
     - source_branch: "[AI-created branch name]"
     - destination_branch: "{{BITBUCKET_TARGET_BRANCH}}"
     - reviewers: [{{BITBUCKET_REVIEWERS}}]
     
     Create PR in repository: {{BITBUCKET_WORKSPACE}}/{{BITBUCKET_REPO_SLUG}}
     ```

5. **Regression Prevention**:
   - Add monitoring for similar patterns
   - Implement crash-prevention validation
   - Create alerts if crash rate exceeds threshold

**Files to Investigate** (for AI agents):
- [Specific file:line from stacktrace]
- [Related module/feature paths]
- [Test file locations]
- [Base classes or parent components]

**Acceptance Criteria** (AI-verifiable):
- [ ] Crash rate reduced by 90%+ (measurable via Firebase)
- [ ] Root cause addressed at [File:Line]
- [ ] Defensive coding/null checks added
- [ ] Unit tests added for edge cases (test execution)
- [ ] Integration tests cover user flow before crash
{{#if (eq PLATFORM "android")}}
- [ ] Tested on affected Android versions: [specific versions from crash data]
- [ ] Tested on top affected devices: [specific models from crash data]
{{/if}}
{{#if (eq PLATFORM "ios")}}
- [ ] Tested on affected iOS versions: [specific versions from crash data]
- [ ] Tested on top affected devices: [specific models from crash data]
{{/if}}
- [ ] Code review completed (PR creation)
- [ ] Crash-free users % improved to >99.5%
- [ ] Firebase monitoring confirms fix deployment

**🚀 Ready for AI Execution**: This task contains complete crash context, stacktrace, and device data for autonomous AI agent resolution.
```

{{#if (eq KANBAN_SYSTEM "vibe")}}
**Vibe Kanban Task Creation**:
```
Use mcp_vibe_kanban_create_task:
- project_id: [UUID from STEP 3]
- title: [Title from template above]
- description: [Complete description from template above]
```
{{/if}}

{{#if (eq KANBAN_SYSTEM "jira")}}
**Jira Issue Creation**:
```
Use mcp_atlassian_createJiraIssue:
- cloudId: "{{JIRA_CLOUD_ID}}"
- projectKey: "{{JIRA_PROJECT_KEY}}"
- issueTypeName: "{{JIRA_ISSUE_TYPE}}"
- summary: [Title from template above]
- description: [Complete description from template above - in Markdown format]
- additional_fields: {
    "priority": { "name": "Highest" },  // For CRITICAL issues
    "labels": ["crash-to-vibe", "crashlytics"]
  }

Optional: Assign to team member
- assignee_account_id: [Use mcp_atlassian_lookupJiraAccountId to find user by email/name]
```

**Before Starting Work - Create Bugfix Branch**:
```
IMPORTANT: Before executing this ticket, create a new branch following the bugfix naming convention:

Branch naming format: bugfix/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]
Source branch: develop

Example: bugfix/{{JIRA_PROJECT_KEY}}-1234_fix-crash-on-base-activity

Steps:
1. Ensure you're on develop branch: git checkout develop
2. Pull latest changes: git pull origin develop
3. Create new bugfix branch: git checkout -b bugfix/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]
4. Now proceed with the crash fix implementation

Note: Replace [ISSUE-NUMBER] with the actual Jira issue number created above
      Replace [brief-description] with a short kebab-case description (e.g., fix-crash-on-viewbinding)
```

**Commit Message Convention**:
```
All commits in this branch MUST follow this format:

Format: {{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] [brief description of change]

Examples:
- {{JIRA_PROJECT_KEY}}-1234 fix crash on BaseVbActivity getBinding
- {{JIRA_PROJECT_KEY}}-1234 add null safety checks to ViewBinding
- {{JIRA_PROJECT_KEY}}-1234 add unit tests for binding lifecycle

Key points:
- Always start with the ticket number ({{JIRA_PROJECT_KEY}}-XXXX)
- Use lowercase for the description
- Keep description concise and clear
- Use present tense (fix, add, update, not fixed, added, updated)
```

**Testing Guidelines**:
```
Unit Test Requirements:

1. **Logic/Business Classes**: REQUIRED
   - Add comprehensive unit tests
   - Cover all edge cases and crash scenarios
   - Test both success and failure paths
   - Aim for 80%+ code coverage

2. **UI/View Classes**: OPTIONAL
   - UI tests (Espresso/UI Automator) are preferred over unit tests
   - If changes are purely UI-related (layouts, view logic), unit tests may be skipped
   - Document why unit tests were skipped in the PR description
   - Examples of UI/View classes:
     * Activity classes (MainActivity, BaseActivity, etc.)
     * Fragment classes (HomeFragment, DetailFragment, etc.)
     * Custom View classes (CustomButton, ChartView, etc.)
     * Adapter classes (RecyclerView.Adapter implementations)
     * ViewHolder classes

3. **Mixed Logic/UI Classes**: REQUIRED
   - If an Activity/Fragment contains business logic, test the logic
   - Extract testable logic to ViewModel/Presenter/UseCase when possible
   - Add unit tests for the extracted logic classes

Note: Even if unit tests are skipped for UI classes, manual testing is MANDATORY.
Document all manual test scenarios in the PR description.
```
{{/if}}

#### HIGH PRIORITY TASK TEMPLATE (AI-Ready with Detailed Crash Data):
```
Title: 🔥 HIGH{{#if regressed}} [REGRESSED]{{/if}}: [Error Summary] ([Event Count] crashes)

Description:
**Priority**: HIGH - Fix this sprint{{#if regressed}} 🔄 PREVIOUSLY FIXED, NOW RETURNED{{/if}}

**🤖 AI Agent Recommendations**:
- **Best Agent**: Codex (for refactoring) or Gemini CLI (for performance)
- **Execution Type**: Automated with periodic check-ins
- **Expected Resolution Time**: 4-8 hours

**Issue Summary**: [Detailed technical description]
- **Issue ID**: [Firebase Issue ID]
- **Error**: [Full error class path]
- **Exception**: [Exception message from sample crash]
- **Impact**: [X] crashes affecting [Y] users (~8-day period)
- **Crash-Free Users**: [XX.XX%]
- **Versions**: [firstSeenVersion] → [lastSeenVersion]
- **Signals**: {{#if regressed}}🔄 Regressed{{/if}}{{#if repetitive}}🔁 Repetitive{{/if}}{{#if early}}⚡ Early Crash{{/if}}
- **Firebase Link**: [Console URI]

**Detailed Stacktrace** (from sample crash):
```
IMPORTANT: Insert the ACTUAL full stacktrace from mcp_firebase_crashlytics_get_sample_crash_for_issue here.
Do NOT leave this as a placeholder - include the complete stacktrace with file names and line numbers.

The stacktrace should show:
- Exception type and message
- Complete call stack with file:line references
- All frames from crash point to app entry point
```

**Crash Context**:
- **Affected Devices**: [Top device models]
- **Affected OS Versions**: [OS versions with highest impact]
- **Memory/Session Data**: [Available context]

**Root Cause Analysis**:
[Based on stacktrace and detailed issue data]

**AI-Executable Action Items**:
1. **Code Analysis**: Review stacktrace and identify pattern
2. **Refactoring**: Improve code structure if needed
3. **Fix Implementation**: Address root cause with proper error handling
4. **Testing**: Create comprehensive test coverage
5. **PR Creation & Monitoring**: 
   - Set up alerts for regression
   - **Create Pull Request** (if Bitbucket enabled):
     ```
     Use create_pull_request (Bitbucket MCP):
     - workspace: "{{BITBUCKET_WORKSPACE}}"
     - repository: "{{BITBUCKET_REPO_SLUG}}"
{{#if (eq KANBAN_SYSTEM "jira")}}
     - title: "{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] Fix: [Issue Title]"
{{else}}
     - title: "Fix: [Issue Title] - #[Firebase Issue ID]"
{{/if}}
     - description: Include Firebase link, task link, stacktrace, root cause, solution, and testing checklist
     - source_branch: "[AI-created branch name]"
     - destination_branch: "{{BITBUCKET_TARGET_BRANCH}}"
     - reviewers: [{{BITBUCKET_REVIEWERS}}]
     
     Create PR in repository: {{BITBUCKET_WORKSPACE}}/{{BITBUCKET_REPO_SLUG}}
     ```

**Files to Investigate**:
- [File:Line from stacktrace]
- [Related components]

**Acceptance Criteria**:
- [ ] Crash rate reduced by 85%+
- [ ] Root cause fixed at [File:Line]
- [ ] Tests prevent regression
- [ ] Device/OS compatibility verified
- [ ] Crash-free users % improved

**🚀 Ready for AI Execution**: Complete crash data included for automated resolution.
```

{{#if (eq KANBAN_SYSTEM "vibe")}}
**Vibe Kanban Task Creation**:
```
Use mcp_vibe_kanban_create_task:
- project_id: [UUID from STEP 3]
- title: [Title from template above]
- description: [Complete description from template above]
```
{{/if}}

{{#if (eq KANBAN_SYSTEM "jira")}}
**Jira Issue Creation**:
```
Use mcp_atlassian_createJiraIssue:
- cloudId: "{{JIRA_CLOUD_ID}}"
- projectKey: "{{JIRA_PROJECT_KEY}}"
- issueTypeName: "{{JIRA_ISSUE_TYPE}}"
- summary: [Title from template above]
- description: [Complete description from template above - in Markdown format]
- additional_fields: {
    "priority": { "name": "High" },  // For HIGH issues
    "labels": ["crash-to-vibe", "{{JIRA_LABELS}}", "crashlytics", "high-priority", "ai-ready"]
  }
```

**Before Starting Work - Create Bugfix Branch**:
```
IMPORTANT: Before executing this ticket, create a new branch following the bugfix naming convention:

Branch naming format: bugfix/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]
Source branch: develop

Example: bugfix/{{JIRA_PROJECT_KEY}}-1235_fix-regressed-error

Steps:
1. Ensure you're on develop branch: git checkout develop
2. Pull latest changes: git pull origin develop
3. Create new bugfix branch: git checkout -b bugfix/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]
4. Now proceed with the crash fix implementation

Note: Replace [ISSUE-NUMBER] with the actual Jira issue number created above
      Replace [brief-description] with a short kebab-case description
```

**Commit Message Convention**:
```
All commits in this branch MUST follow this format:

Format: {{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] [brief description of change]

Examples:
- {{JIRA_PROJECT_KEY}}-1235 fix regressed crash on lifecycle
- {{JIRA_PROJECT_KEY}}-1235 add defensive coding for edge cases
- {{JIRA_PROJECT_KEY}}-1235 add regression tests

Key points:
- Always start with the ticket number ({{JIRA_PROJECT_KEY}}-XXXX)
- Use lowercase for the description
- Keep description concise and clear
- Use present tense (fix, add, update, not fixed, added, updated)
```

**Testing Guidelines**:
```
Unit Test Requirements:

1. **Logic/Business Classes**: REQUIRED
   - Add comprehensive unit tests
   - Cover all edge cases and crash scenarios
   - Test both success and failure paths
   - Aim for 80%+ code coverage

2. **UI/View Classes**: OPTIONAL
   - UI tests (Espresso/UI Automator) are preferred over unit tests
   - If changes are purely UI-related (layouts, view logic), unit tests may be skipped
   - Document why unit tests were skipped in the PR description
   - Examples of UI/View classes:
     * Activity classes (MainActivity, BaseActivity, etc.)
     * Fragment classes (HomeFragment, DetailFragment, etc.)
     * Custom View classes (CustomButton, ChartView, etc.)
     * Adapter classes (RecyclerView.Adapter implementations)
     * ViewHolder classes

3. **Mixed Logic/UI Classes**: REQUIRED
   - If an Activity/Fragment contains business logic, test the logic
   - Extract testable logic to ViewModel/Presenter/UseCase when possible
   - Add unit tests for the extracted logic classes

Note: Even if unit tests are skipped for UI classes, manual testing is MANDATORY.
Document all manual test scenarios in the PR description.
```
{{/if}}

#### PERFORMANCE TASK TEMPLATE (AI-Optimized with Detailed Data):
```
Title: ⚡ PERFORMANCE{{#if repetitive}} [REPETITIVE]{{/if}}{{#if early}} [EARLY]{{/if}}: [Performance Issue] ([Event Count] events)

Description:
**Priority**: MEDIUM - Performance optimization{{#if repetitive}} 🔁 MULTIPLE OCCURRENCES PER USER{{/if}}{{#if early}} ⚡ CRASHES IN FIRST 5 SECONDS{{/if}}

**🤖 AI Agent Recommendations**:
- **Best Agent**: Gemini CLI (performance specialist) or Claude Code (analysis)
- **Execution Type**: Automated optimization with benchmarking
- **Expected Resolution Time**: 6-12 hours

**Issue Summary**: [Performance problem description]
- **Issue ID**: [Firebase Issue ID]
- **Error**: [Performance-related error]
- **Impact**: [Event volume] affecting [user count] users
- **Performance Impact**: [Specific degradation - ANR, slow frames, memory pressure]
- **Versions**: [firstSeenVersion] → [lastSeenVersion]
- **Signals**: {{#if repetitive}}🔁 Repetitive{{/if}}{{#if early}}⚡ Early Crash{{/if}}
- **Firebase Link**: [Console URI]

**Performance Context** (from detailed issue data):
- **Affected Devices**: [Devices with most performance issues]
- **Affected OS Versions**: [OS versions with highest impact]
- **Memory Patterns**: [Memory usage at time of issue]
- **Thread Information**: [Main thread blocking, background threads]
- **Session Duration**: [When in session the issue occurs]

**Stacktrace/ANR Trace** (from sample crash):
```
IMPORTANT: Insert the ACTUAL full stacktrace/trace from mcp_firebase_crashlytics_get_sample_crash_for_issue here.
Do NOT leave this as a placeholder - include the complete trace showing the performance bottleneck.

The trace should show:
- Exception/ANR type and message
- Complete call stack with file:line references
- Thread information (main thread, background threads)
- All frames showing where the bottleneck occurs
```

**Root Cause Analysis**:
[Performance bottleneck analysis based on trace and metrics]
- Bottleneck location: [File:Line]
- Contributing factors: [UI thread blocking, memory allocation, I/O operations]
- Pattern: [When does this occur - app launch, specific feature, background]

**AI-Executable Optimization Items**:
1. **Performance Profiling**:
   - Analyze memory/CPU usage at [File:Line]
   - Identify expensive operations
   - Review thread usage patterns

2. **Algorithm Optimization**:
   - Improve inefficient code paths
   - Add async/parallel processing where appropriate
   - Optimize data structures and queries

3. **Resource Management**:
   - Optimize memory allocation and cleanup
   - Implement caching strategies
   - Add lazy loading where appropriate

4. **PR Creation & Monitoring Enhancement**:
   - Add performance metrics and alerts
   - Implement trace markers for profiling
   - Set up ANR/slow frame monitoring
   - **Create Pull Request** (if Bitbucket enabled):
     ```
     Use create_pull_request (Bitbucket MCP):
     - workspace: "{{BITBUCKET_WORKSPACE}}"
     - repository: "{{BITBUCKET_REPO_SLUG}}"
{{#if (eq KANBAN_SYSTEM "jira")}}
     - title: "{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] Perf: [Issue Title]"
{{else}}
     - title: "Perf: [Issue Title] - #[Firebase Issue ID]"
{{/if}}
     - description: Include Firebase link, task link, performance analysis, optimization approach, and benchmarks
     - source_branch: "[AI-created branch name]"
     - destination_branch: "{{BITBUCKET_TARGET_BRANCH}}"
     - reviewers: [{{BITBUCKET_REVIEWERS}}]
     
     Create PR in repository: {{BITBUCKET_WORKSPACE}}/{{BITBUCKET_REPO_SLUG}}
     ```

**Files to Investigate**:
- [File:Line from trace]
- [Related performance-critical components]

**Acceptance Criteria** (AI-measurable):
- [ ] Event volume reduced by 80%+ (Firebase metrics)
- [ ] Performance bottleneck resolved at [File:Line]
- [ ] Memory/CPU usage optimized (profiling tools)
- [ ] ANR rate reduced (if applicable)
- [ ] Frame rendering improved (if UI-related)
- [ ] User experience enhanced (performance monitoring)
- [ ] Device/OS compatibility maintained

**🚀 Ready for AI Execution**: Complete performance data and traces included for automated optimization.
```

{{#if (eq KANBAN_SYSTEM "vibe")}}
**Vibe Kanban Task Creation**:
```
Use mcp_vibe_kanban_create_task:
- project_id: [UUID from STEP 3]
- title: [Title from template above]
- description: [Complete description from template above]
```
{{/if}}

{{#if (eq KANBAN_SYSTEM "jira")}}
**Jira Issue Creation**:
```
Use mcp_atlassian_createJiraIssue:
- cloudId: "{{JIRA_CLOUD_ID}}"
- projectKey: "{{JIRA_PROJECT_KEY}}"
- issueTypeName: "Task"  // Performance tasks can be "Task" type
- summary: [Title from template above]
- description: [Complete description from template above - in Markdown format]
- additional_fields: {
    "priority": { "name": "Medium" },  // For PERFORMANCE issues
    "labels": ["crash-to-vibe", "{{JIRA_LABELS}}", "crashlytics", "performance", "optimization", "ai-ready"]
  }
```

**Before Starting Work - Create Performance Branch**:
```
IMPORTANT: Before executing this ticket, create a new branch:

Branch naming format: performance/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]
Source branch: develop

Example: performance/{{JIRA_PROJECT_KEY}}-1236_optimize-anr-issue

Steps:
1. Ensure you're on develop branch: git checkout develop
2. Pull latest changes: git pull origin develop
3. Create new performance branch: git checkout -b performance/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]
4. Now proceed with the performance optimization implementation

Note: Replace [ISSUE-NUMBER] with the actual Jira issue number created above
      Replace [brief-description] with a short kebab-case description
```

**Commit Message Convention**:
```
All commits in this branch MUST follow this format:

Format: {{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] [brief description of change]

Examples:
- {{JIRA_PROJECT_KEY}}-1236 optimize memory allocation in main thread
- {{JIRA_PROJECT_KEY}}-1236 add async processing for heavy operations
- {{JIRA_PROJECT_KEY}}-1236 add performance benchmarks

Key points:
- Always start with the ticket number ({{JIRA_PROJECT_KEY}}-XXXX)
- Use lowercase for the description
- Keep description concise and clear
- Use present tense (optimize, add, update, not optimized, added, updated)
```

**Testing Guidelines**:
```
Performance Test Requirements:

1. **Logic/Business Classes**: REQUIRED
   - Add unit tests for optimized code paths
   - Add performance benchmarks if applicable
   - Cover edge cases and stress scenarios
   - Verify optimization doesn't break functionality

2. **UI/View Classes**: OPTIONAL
   - UI performance tests (frame rate, jank metrics) are preferred
   - If changes are purely UI rendering optimizations, unit tests may be skipped
   - Profile with Android Profiler to verify improvements
   - Document performance metrics (before/after) in PR description

3. **Critical Performance Paths**: REQUIRED
   - Add benchmark tests for performance-critical code
   - Measure and document execution time improvements
   - Test on low-end devices if optimization targets device performance

Note: Always include performance metrics (memory, CPU, execution time) in the PR description.
Manual performance testing is MANDATORY - use Android Profiler or similar tools.
```
{{/if}}

### STEP 6: CREATE SPECIFIC TASKS FOR COMMON {{PLATFORM}} ISSUES (AI-Optimized)

{{#if (eq PLATFORM "android")}}
#### A. ViewBinding/Fragment Lifecycle Issues (Claude Code Recommended):
- Focus on BaseVbFragment, MVP lifecycle
- Include null safety, lifecycle state validation
- Cover fragment transaction edge cases
- **AI Capability**: Excellent for complex lifecycle analysis and defensive coding

#### B. Activity Lifecycle Management (Codex Recommended):
- Activity state restoration issues
- Configuration change handling
- Background/foreground transitions
- **AI Capability**: Specialized in lifecycle refactoring and state management

#### C. Android API Compatibility Issues (Gemini CLI Recommended):
- Permission handling (SCHEDULE_EXACT_ALARM, etc.)
- Target SDK compatibility issues
- Background execution limitations
- **AI Capability**: Strong in API compliance and compatibility analysis
{{/if}}

{{#if (eq PLATFORM "ios")}}
#### A. UIViewController Lifecycle Issues (Claude Code Recommended):
- View lifecycle management
- Memory management and retain cycles
- Navigation controller issues
- **AI Capability**: Excellent for complex iOS lifecycle analysis

#### B. Auto Layout and UI Issues (Codex Recommended):
- Constraint conflicts and ambiguous layouts
- Dynamic type and accessibility
- Safe area handling
- **AI Capability**: Specialized in UI code refactoring

#### C. iOS API Compatibility Issues (Gemini CLI Recommended):
- iOS version compatibility
- App Transport Security compliance
- Background app refresh limitations
- **AI Capability**: Strong in iOS API compliance analysis
{{/if}}

{{#if (eq PLATFORM "flutter")}}
#### A. Flutter Engine Lifecycle Issues (Claude Code Recommended):
- Engine initialization and disposal
- Platform channel communication
- Widget lifecycle management
- **AI Capability**: Excellent for complex Flutter architecture analysis

#### B. Platform Integration Issues (Codex Recommended):
- Native platform channel errors
- Plugin compatibility problems
- Platform-specific implementations
- **AI Capability**: Specialized in cross-platform integration

#### C. Flutter Performance Issues (Gemini CLI Recommended):
- Widget rebuild optimization
- Memory management in Dart
- Bridge communication performance
- **AI Capability**: Strong in Flutter performance optimization
{{/if}}

#### Performance Optimization Issues (Gemini CLI + Claude Code):
- Network request optimization
- UI rendering performance
- Memory leak prevention
- **AI Capability**: Performance profiling and algorithmic improvements

#### Memory and Resource Issues (Codex + Claude Code):
- OutOfMemoryError prevention
- Resource leak detection
- Memory allocation optimization
- Large asset handling
- **AI Capability**: Resource management and memory optimization

#### Threading and Concurrency Issues (Claude Code Recommended):
- Main thread violations
- Race condition prevention
- Deadlock prevention
- Background thread exceptions
- **AI Capability**: Complex concurrency analysis and thread-safe implementations

#### Monitoring and Prevention Task (Setup Script + AI Monitoring):
```
Title: 📊 MONITORING: AI-Enhanced Firebase Crashlytics Alerts & Prevention

Description:
**Priority**: LOW - Monitoring setup

**🤖 AI Agent Recommendations**: 
- **Best Agent**: Setup Script (for configuration) + Claude Code (for implementation)
- **Execution Type**: Automated setup with AI-generated monitoring code
- **Expected Resolution Time**: 3-6 hours

**Purpose**: Implement AI-enhanced proactive monitoring to prevent future critical issues

**AI-Executable Setup Items**:
1. **Crashlytics Alerts Configuration**:
   - Auto-configure alerts when crashes > 100 events/day
   - Set up alerts when crash-free users % < 99.5%
   - Create alerts for new crash types with AI classification
   - Implement AI-powered crash trend analysis over available periods

2. **AI Error Boundary Implementation**:
   - Generate defensive coding in base classes
   - Create AI-monitored error boundaries
   - Add AI-validated validation checks before critical operations
   - Implement global exception handlers with AI pattern recognition

3. **Automated Testing Checklist Creation**:
{{#if (eq PLATFORM "android")}}
   - Generate ViewBinding lifecycle testing suites
   - Create Activity lifecycle testing automation
   - Build permission handling testing with AI validation
{{/if}}
{{#if (eq PLATFORM "ios")}}
   - Generate UIViewController lifecycle testing suites
   - Create Auto Layout constraint testing automation
   - Build iOS API compatibility testing with AI validation
{{/if}}
{{#if (eq PLATFORM "flutter")}}
   - Generate Flutter widget lifecycle testing suites
   - Create platform channel communication testing automation
   - Build Flutter performance testing with AI validation
{{/if}}
   - Implement memory pressure testing with AI analysis
   - Create performance regression testing with AI benchmarking

**Acceptance Criteria** (AI-verifiable):
- [ ] Crashlytics alerts configured with AI enhancement
- [ ] Error boundary documentation created automatically
- [ ] Testing checklist implemented with AI validation
- [ ] Monthly crash report automation with AI insights
- [ ] Performance monitoring implemented with AI analysis

**🚀 Ready for AI Execution**: Fully automated monitoring setup with AI intelligence.
```

### STEP 7: GENERATE COMPREHENSIVE SUMMARY REPORT

After creating all tasks, provide:

```
## 🎯 FIREBASE TO {{KANBAN_SYSTEM}} AUTOMATION SUMMARY

### 📊 Tasks Created: [X] total tasks

#### 🔥 Critical Priority: [X] tasks
- [List critical task titles with impact numbers]

#### 🔥 High Priority: [X] tasks  
- [List high priority task titles]

#### ⚡ Performance/Medium: [X] tasks
- [List performance optimization tasks]

#### 📊 Monitoring/Prevention: [X] tasks
- [List monitoring and prevention tasks]

### 🚨 IMMEDIATE ACTION REQUIRED:
1. **This Week**: [Critical tasks requiring immediate attention - ready for Claude Code execution]
2. **This Sprint**: [High priority tasks for current sprint - ready for Codex/Gemini execution]
3. **Next Sprint**: [Medium priority and performance tasks - ready for automated AI optimization]

### 🎯 TOP 3 MOST CRITICAL ISSUES:
1. [Highest impact issue with user/crash numbers over available period - AI execution recommended]
2. [Second highest impact issue - AI execution recommended]
3. [Third highest impact issue - AI execution recommended]

### 📈 NEXT STEPS:
1. **AI Execution**: Start critical tasks with Claude Code for immediate automated fixes
2. **Human Oversight**: Set up daily standups to monitor AI agent progress
3. **Automated Monitoring**: Let AI agents implement monitoring tasks to prevent future issues
4. **AI Code Review**: Schedule review sessions for AI-generated fixes
5. **Testing Strategy**: Use AI agents to plan and execute testing for each priority level

### 🤖 AI AGENT EXECUTION GUIDE:
- **Critical Issues**: Claude Code (complex analysis) → Immediate execution
- **Performance Issues**: Gemini CLI (optimization specialist) → Automated benchmarking
- **File Editing**: Codex (refactoring expert) → Bulk code improvements
- **Testing Tasks**: Amp (collaborative debugging) → Comprehensive test suites

### 🔗 FIREBASE CONSOLE ACCESS:
- All tasks include direct Firebase Console links for AI agent analysis
- Use sample event IDs for detailed stacktrace analysis by AI agents
- Review device/OS distribution for AI-targeted fixes
- Monitor crash-free user percentage improvements via AI dashboards (target: >99.5%)
```

## ⚡ EXECUTION PARAMETERS
- **Task Management System**: {{KANBAN_SYSTEM}}
{{#if (eq KANBAN_SYSTEM "vibe")}}
- **Target Project**: {{KANBAN_PROJECT_NAME}} (Vibe Kanban)
{{/if}}
{{#if (eq KANBAN_SYSTEM "jira")}}
- **Jira Cloud ID**: {{JIRA_CLOUD_ID}}
- **Jira Project Key**: {{JIRA_PROJECT_KEY}}
- **Default Issue Type**: {{JIRA_ISSUE_TYPE}}
- **Default Labels**: {{JIRA_LABELS}}
{{/if}}
- **Firebase Project**: {{FIREBASE_PROJECT_ID}}
- **Firebase Environment**: {{FIREBASE_ENVIRONMENT}}
- **Firebase Config**: {{FIREBASE_CONFIG_FILE}}
- **App ID**: {{APP_ID}}
- **Platform**: {{PLATFORM}}
- **Bitbucket Integration**: {{BITBUCKET_ENABLED}}
- **Bitbucket Workspace**: {{BITBUCKET_WORKSPACE}}
- **Bitbucket Repository**: {{BITBUCKET_REPO_SLUG}}
- **Target Branch**: {{BITBUCKET_TARGET_BRANCH}}
- **Date Range**: ~8-day reporting period (tool limitation - for 30-day analysis use Console links)
- **Crash Types**: Both FATAL and NON-FATAL issues
- **Task Limit**: 15-25 tasks (focus on highest impact issues, API max 100 issues per call)
- **Priority Focus**: Critical and High priority issues first
- **🤖 AI Execution**: All tasks optimized for Claude Code, Codex, Gemini CLI, and Amp agents
- **Automation Level**: Immediate AI execution for Critical/High, automated monitoring for Medium/Low

## ✅ SUCCESS CRITERIA
- [ ] Firebase environment properly configured
- [ ] **Phase A**: Top issues retrieved from both FATAL and NON-FATAL (~8-day period)
- [ ] **Phase B**: Detailed crash information fetched for top 5-10 critical issues using:
  - [ ] `mcp_firebase_crashlytics_get_issue_details` for comprehensive issue data
  - [ ] `mcp_firebase_crashlytics_get_sample_crash_for_issue` for full stacktraces
- [ ] **Phase C**: Fresh issues identified by comparing firstSeenVersion with current version
- [ ] All issues >{{MEDIUM_CRASHES}} events have corresponding tasks
- [ ] Tasks contain complete technical details including:
  - [ ] Full stacktraces with file:line references
  - [ ] Affected devices and OS version distributions
  - [ ] Memory/performance context
  - [ ] Custom logs and keys
  - [ ] Signal indicators (fresh, regressed, repetitive, early)
- [ ] Clear priority hierarchy with timeline recommendations
  - [ ] Fresh issues prioritized appropriately
  - [ ] Regressed issues flagged for urgent attention
- [ ] Firebase Console links included for 30-day investigation
- [ ] Actionable next steps provided for sprint planning
- [ ] Monitoring task created for prevention
- [ ] Target crash-free user percentage >99.5%
- [ ] **🤖 AI-Ready Tasks**: All tasks optimized for immediate AI agent execution with:
  - [ ] Complete crash context and stacktraces
  - [ ] Device/OS-specific testing guidance
  - [ ] Root cause analysis based on detailed data
- [ ] **Agent Recommendations**: Specific AI agent suggestions for each task type
- [ ] **Automated Execution**: Critical issues ready for autonomous AI resolution with full context
- [ ] **Bitbucket Integration** (if enabled):
  - [ ] Draft PRs created with comprehensive crash context
  - [ ] PR descriptions include Firebase Console and Vibe task links
  - [ ] Testing checklists included in PR descriptions
  - [ ] Reviewers assigned as configured
  - [ ] PRs linked to crash issue IDs for traceability

---

**🚀 EXECUTE NOW**: Run this complete AI-powered workflow with enhanced crash detail fetching:

1. **List top issues** (FATAL and NON-FATAL) using `mcp_firebase_crashlytics_list_top_issues`
2. **Fetch detailed crash data** for top 5-10 critical issues using:
   - `mcp_firebase_crashlytics_get_issue_details` - Get comprehensive issue information
   - `mcp_firebase_crashlytics_get_sample_crash_for_issue` - Get full stacktraces and crash context
3. **Identify fresh issues** by analyzing firstSeenVersion and signals
4. **Create rich tasks** with complete stacktraces, device data, and root cause analysis:
{{#if (eq KANBAN_SYSTEM "vibe")}}
   - Use `mcp_vibe_kanban_create_task` for each issue
{{/if}}
{{#if (eq KANBAN_SYSTEM "jira")}}
   - Use `mcp_atlassian_createJiraIssue` for each issue
{{/if}}
5. **Create pull requests** (if Bitbucket enabled) using `mcp_bitbucket_create_pull_request` after AI fixes

Handle any authentication or configuration issues, and create comprehensive, AI-executable tasks for the {{PROJECT_NAME}} {{PLATFORM}} development team. Focus on overall app stability and user experience improvements through intelligent automation with detailed crash insights.

{{#if (eq KANBAN_SYSTEM "vibe")}}
**🤖 POST-EXECUTION (Vibe Kanban)**: Once tasks are created, they can be immediately executed by AI agents:
1. Open Vibe Kanban
2. Navigate to "{{KANBAN_PROJECT_NAME}}" project
3. Click "Start" on any critical task for AI execution
4. Monitor real-time AI agent progress and generated fixes
5. Review AI-generated draft pull requests in Bitbucket (if enabled)
6. Publish draft PRs after team review and approval
{{/if}}

{{#if (eq KANBAN_SYSTEM "jira")}}
**🤖 POST-EXECUTION (Jira)**: Once issues are created:
1. Open Jira at {{JIRA_CLOUD_ID}}
2. Navigate to project "{{JIRA_PROJECT_KEY}}"
3. Review created issues with complete crash context
4. Assign issues to team members as needed
5. Issues contain all necessary details for AI-assisted resolution
6. Monitor progress through Jira workflows
7. Review AI-generated draft pull requests in Bitbucket (if enabled)
8. Publish draft PRs after team review and approval
{{/if}}

### STEP 7: CREATE PULL REQUEST (Bitbucket Integration)

**Status**: {{BITBUCKET_ENABLED}}

After AI agent completes the crash fix, create a pull request for team review:

```
Use create_pull_request (Bitbucket MCP):

Parameters:
- workspace: "{{BITBUCKET_WORKSPACE}}"
- repository: "{{BITBUCKET_REPO_SLUG}}"
{{#if (eq KANBAN_SYSTEM "jira")}}
- title: "{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] Fix: [Crash Title]"
{{else}}
- title: "Fix: [Crash Title] - Issue #[Firebase Issue ID]"
{{/if}}
- description: """
## 🔥 Crash Fix: [Issue Title]

{{#if (eq KANBAN_SYSTEM "jira")}}
### 🎫 Related Ticket
- **Jira**: {{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]
- **Branch**: bugfix/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]
{{/if}}

### 📊 Crash Context
- **Firebase Issue**: [Firebase Console Link]
{{#if (eq KANBAN_SYSTEM "vibe")}}
- **Vibe Task**: [Vibe Kanban Task Link]
{{/if}}
{{#if (eq KANBAN_SYSTEM "jira")}}
- **Jira Ticket**: [Jira Ticket Link]
{{/if}}
- **Crash Type**: FATAL / NON-FATAL
- **Impact**: [X] crashes affecting [Y] users ([Z]% crash-free rate)
- **Affected Versions**: [Version range]
- **Affected Devices**: [Device models and OS versions]

### 🐛 Root Cause Analysis
[AI-generated analysis of the crash cause]

**Stacktrace Summary**:
```
[Key stacktrace lines showing crash location]
```

### ✅ Solution Implemented
[Detailed description of the fix approach]

### 🧪 Testing Performed
- [ ] Unit tests added/updated: [Test file paths] OR "N/A - UI/View class changes only"
- [ ] Manual testing completed: [Test scenarios] - MANDATORY
- [ ] Regression testing: [Scope covered]
- [ ] Performance impact: [Memory/CPU measurements]
- [ ] Crash reproduction verified: [Steps tested]

{{#if (eq KANBAN_SYSTEM "jira")}}
**Unit Test Exclusion Note** (if applicable):
If unit tests were skipped because changes are in UI/View classes (Activity, Fragment, Adapter, ViewHolder, Custom Views):
- [ ] Changes are purely UI/View-related
- [ ] Manual testing documented above covers all scenarios
- [ ] UI/Espresso tests added (if applicable)
{{/if}}

### 📈 Expected Impact
- Target crash-free percentage: >99.5%
- Resolution confidence: [High/Medium based on testing]

{{#if (eq KANBAN_SYSTEM "jira")}}
### 📝 Commit Convention
All commits follow the format: `{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] [description]`

Example commits in this PR:
- {{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] fix crash on [component]
- {{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] add null safety checks
- {{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER] add unit tests (if applicable)
{{/if}}

### 🤖 AI Agent Information
- **Generated by**: [Claude Code / Copilot / Gemini / Codex]
- **Execution time**: [Duration]
- **Files modified**: [List of changed files]

---
**⚠️ AI-Generated Fix**: Please review thoroughly before merging.
"""
{{#if (eq KANBAN_SYSTEM "jira")}}
- source_branch: "bugfix/{{JIRA_PROJECT_KEY}}-[ISSUE-NUMBER]_[brief-description]"
{{else}}
- source_branch: "[AI-created branch name, e.g., fix/crash-issue-123]"
{{/if}}
- destination_branch: "{{BITBUCKET_TARGET_BRANCH}}"
- reviewers: [{{BITBUCKET_REVIEWERS}}]

Expected Result:
- PR created in Bitbucket
- Team notified for review
{{#if (eq KANBAN_SYSTEM "jira")}}
- PR title includes Jira ticket number
- Branch follows bugfix naming convention
{{/if}}
- PR linked to both Firebase issue and task management system
- Testing checklist ready for verification
```

**Note**: Review the created PR before merging to {{BITBUCKET_TARGET_BRANCH}}.

**To merge PR after review**:
```
Use merge_pull_request (Bitbucket MCP):
- workspace: "{{BITBUCKET_WORKSPACE}}"
- repository: "{{BITBUCKET_REPO_SLUG}}"
- pull_request_id: [PR ID from creation response]
- merge_strategy: "merge_commit" or "squash" or "fast_forward"
- close_source_branch: true
```

---
