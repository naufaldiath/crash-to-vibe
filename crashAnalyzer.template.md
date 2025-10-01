# 🔥 Firebase Crashlytics to Vibe Kanban - AI-Powered Automation Workflow

## 🎯 EXECUTE THIS COMPREHENSIVE WORKFLOW

You are a Firebase Crashlytics and Vibe Kanban automation specialist. Execute this complete workflow to fetch Firebase crash data (both FATAL and NON-FATAL) and create corresponding detailed Kanban tasks for the {{PROJECT_NAME}} {{PLATFORM}} project. This workflow covers both fatal crashes that cause app termination and non-fatal issues that impact user experience.

**🤖 AI Integration**: Tasks created through this workflow can be automatically executed by AI agents in Vibe Kanban (Claude Code, Aider, Gemini CLI, Amp) for immediate problem resolution without manual intervention.

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
   - Full exception stacktrace with line numbers
   - Device information (model, OS version, orientation)
   - Memory usage at crash time
   - User activity before crash
   - Custom log messages
   - Thread information
   - Application state

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

### STEP 3: IDENTIFY VIBE KANBAN PROJECT
```
1. Use mcp_vibe_kanban_list_projects to get available projects

2. Find "{{KANBAN_PROJECT_NAME}}" project and extract project_id
   - Expected project_id format: UUID string (e.g., 7a5de88c-ff9c-4388-8992-d291e77c6982)
   - Project name should match: "{{KANBAN_PROJECT_NAME}}"

3. Note: Vibe Kanban supports AI agent execution for automated task resolution
   - AI agents can analyze crashes and generate fixes automatically
   - Supported agents: Claude Code, Aider, Gemini CLI, Amp
   - Tasks will be ready for immediate AI execution after creation
```

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

### STEP 5: CREATE DETAILED KANBAN TASKS

For each significant issue, use `mcp_vibe_kanban_create_task` with this detailed structure optimized for AI agent execution:

#### CRITICAL TASK TEMPLATE (AI-Ready with Detailed Crash Data):
```
Title: 🔥 CRITICAL{{#if fresh}} [FRESH ISSUE]{{/if}}: [Error Class/Method] ([Event Count] crashes)

Description:
**Priority**: CRITICAL - Fix this week{{#if fresh}} ⚠️ NEW IN LATEST VERSION{{/if}}

**🤖 AI Agent Recommendations**:
- **Best Agent**: Claude Code (for complex logic) or Aider (for file editing)
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
[Full exception stacktrace with file names and line numbers]
Example:
  at com.example.app.MyClass.myMethod(MyClass.kt:123)
  at com.example.app.BaseClass.onCreate(BaseClass.kt:45)
  ...
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

4. **Code Review**:
   - Prepare detailed PR with stacktrace reference
   - Include before/after crash rate metrics
   - Document fix rationale and testing approach

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

#### HIGH PRIORITY TASK TEMPLATE (AI-Ready with Detailed Crash Data):
```
Title: 🔥 HIGH{{#if regressed}} [REGRESSED]{{/if}}: [Error Summary] ([Event Count] crashes)

Description:
**Priority**: HIGH - Fix this sprint{{#if regressed}} 🔄 PREVIOUSLY FIXED, NOW RETURNED{{/if}}

**🤖 AI Agent Recommendations**:
- **Best Agent**: Aider (for refactoring) or Gemini CLI (for performance)
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
[Full stacktrace with file:line references]
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
5. **Monitoring**: Set up alerts for regression

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
[Full trace showing performance bottleneck]
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

4. **Monitoring Enhancement**:
   - Add performance metrics and alerts
   - Implement trace markers for profiling
   - Set up ANR/slow frame monitoring

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

### STEP 6: CREATE SPECIFIC TASKS FOR COMMON {{PLATFORM}} ISSUES (AI-Optimized)

{{#if (eq PLATFORM "android")}}
#### A. ViewBinding/Fragment Lifecycle Issues (Claude Code Recommended):
- Focus on BaseVbFragment, MVP lifecycle
- Include null safety, lifecycle state validation
- Cover fragment transaction edge cases
- **AI Capability**: Excellent for complex lifecycle analysis and defensive coding

#### B. Activity Lifecycle Management (Aider Recommended):
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

#### B. Auto Layout and UI Issues (Aider Recommended):
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

#### B. Platform Integration Issues (Aider Recommended):
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

#### Memory and Resource Issues (Aider + Claude Code):
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
## 🎯 FIREBASE TO VIBE KANBAN AUTOMATION SUMMARY

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
2. **This Sprint**: [High priority tasks for current sprint - ready for Aider/Gemini execution]
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
- **File Editing**: Aider (refactoring expert) → Bulk code improvements
- **Testing Tasks**: Amp (collaborative debugging) → Comprehensive test suites

### 🔗 FIREBASE CONSOLE ACCESS:
- All tasks include direct Firebase Console links for AI agent analysis
- Use sample event IDs for detailed stacktrace analysis by AI agents
- Review device/OS distribution for AI-targeted fixes
- Monitor crash-free user percentage improvements via AI dashboards (target: >99.5%)
```

## ⚡ EXECUTION PARAMETERS
- **Target Project**: {{KANBAN_PROJECT_NAME}} (Vibe Kanban)
- **Firebase Project**: {{FIREBASE_PROJECT_ID}}
- **Firebase Environment**: {{FIREBASE_ENVIRONMENT}}
- **Firebase Config**: {{FIREBASE_CONFIG_FILE}}
- **App ID**: {{APP_ID}}
- **Platform**: {{PLATFORM}}
- **Date Range**: ~8-day reporting period (tool limitation - for 30-day analysis use Console links)
- **Crash Types**: Both FATAL and NON-FATAL issues
- **Task Limit**: 15-25 tasks (focus on highest impact issues, API max 100 issues per call)
- **Priority Focus**: Critical and High priority issues first
- **🤖 AI Execution**: All tasks optimized for Claude Code, Aider, Gemini CLI, and Amp agents
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

---

**🚀 EXECUTE NOW**: Run this complete AI-powered workflow with enhanced crash detail fetching:

1. **List top issues** (FATAL and NON-FATAL) using `mcp_firebase_crashlytics_list_top_issues`
2. **Fetch detailed crash data** for top 5-10 critical issues using:
   - `mcp_firebase_crashlytics_get_issue_details` - Get comprehensive issue information
   - `mcp_firebase_crashlytics_get_sample_crash_for_issue` - Get full stacktraces and crash context
3. **Identify fresh issues** by analyzing firstSeenVersion and signals
4. **Create rich Kanban tasks** with complete stacktraces, device data, and root cause analysis

Handle any authentication or configuration issues, and create comprehensive, AI-executable Kanban tasks for the {{PROJECT_NAME}} {{PLATFORM}} development team. Focus on overall app stability and user experience improvements through intelligent automation with detailed crash insights.

**🤖 POST-EXECUTION**: Once tasks are created, they can be immediately executed by AI agents in Vibe Kanban:
1. Open Vibe Kanban
2. Navigate to "{{KANBAN_PROJECT_NAME}}" project
3. Click "Start" on any critical task for AI execution
4. Monitor real-time AI agent progress and generated fixes
5. Review and approve AI-generated pull requests
