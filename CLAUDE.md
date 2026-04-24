# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CLI tool that installs AI-powered Firebase Crashlytics → Jira automation as [Agent Skills](https://agentskills.io). Two modes:

- **Per-project** (v2): bakes Firebase + Jira config into skill at install time
- **Zero-config global** (v2.1): static global skill, reads `crash-to-vibe.json` from project root at runtime

Uses **Jira** (via Atlassian MCP) as the only task management system.

## Key Commands

```bash
# Development
npm start                              # Run locally
node generate-crash-analyzer.js        # Direct invocation

# Global install for testing
npm link                               # Create global symlink
crash-to-vibe                          # Test globally
npm unlink -g crash-to-vibe            # Remove symlink

# CLI flags — zero-config mode
crash-to-vibe --zero-config            # Install global static skill to ~/.agents/skills/
crash-to-vibe --init-project           # Create crash-to-vibe.json in current project

# CLI flags — per-project mode
crash-to-vibe --use-last-config        # Reuse saved config, skip prompts
crash-to-vibe --config team.json       # Load predefined team config
crash-to-vibe --global                 # Install to ~/.agents/skills/ (all projects)
crash-to-vibe --force                  # Overwrite existing installation
crash-to-vibe --dry-run                # Preview files, no writes
crash-to-vibe --also-claude            # Also install to .claude/skills/
crash-to-vibe --also-gemini            # Also install to .gemini/skills/
crash-to-vibe --help
```

## Architecture

Single-file tool: all logic in `generate-crash-analyzer.js` (CrashAnalyzerGenerator class). AI executor classes in `ai-executors.js` (kept for future use). Source templates in `templates/skill/` (per-project) and `templates/skill-zero-config/` (zero-config, static).

### Output: Agent Skills directory

v2 generates an [Agent Skills](https://agentskills.io) directory instead of a flat `.md` file:

```
.agents/skills/crash-to-vibe/        # cross-client (default)
~/.agents/skills/crash-to-vibe/      # --global flag
.claude/skills/crash-to-vibe/        # --also-claude flag
.gemini/skills/crash-to-vibe/        # --also-gemini flag
```

Each install writes:
```
crash-to-vibe/
├── SKILL.md                          # ~220 lines: frontmatter + lean workflow
└── references/
    ├── task-templates.md             # CRITICAL/HIGH/PERFORMANCE task templates
    ├── platform-patterns.md          # Android/iOS/Flutter crash patterns
    └── pr-workflow.md               # Bitbucket PR workflow (only if bitbucket configured)
```

### Zero-config path (`--zero-config` / `--init-project`)

`--zero-config`: copies `templates/skill-zero-config/` (all 4 files) to `~/.agents/skills/crash-to-vibe/`. No placeholder resolution — files are static. AI discovers Firebase via MCP at runtime; reads Jira config from `crash-to-vibe.json` found by walking up from CWD.

`--init-project`: interactive prompts create `crash-to-vibe.json` in CWD. Minimal schema:
```json
{
  "jira": { "cloudId": "", "projectKey": "", "issueType": "Bug", "labels": "crash-to-vibe" },
  "bitbucket": { ... },   // optional
  "thresholds": { ... }   // optional
}
```
See `crash-to-vibe.example.json` for full reference.

### CrashAnalyzerGenerator responsibilities

1. **Project detection** (`detectProjectInfo`, `findFirebaseConfigFiles`) — recursive search up to 10 levels, skips node_modules/.git/build/Pods, parses google-services.json (JSON) and GoogleService-Info.plist (regex on XML)

2. **Firebase integration** (`getFirebaseInfoFromCLI`, `listFirebaseProjects`) — queries `firebase projects:list` and `firebase apps:list`, falls back to manual entry

3. **Configuration collection** (`collectConfiguration`) — interactive prompts with auto-detection defaults; multi-environment and multi-app selection

4. **Skill generation** (`generateSkillFiles`) — pure function, returns `Map<relativePath, content>`. Calls `resolveConditionals` then `resolvePlaceholders` on each template file.

5. **Zero-config skill generation** (`generateZeroConfigSkillFiles`) — pure function, static copy of `templates/skill-zero-config/`, no token resolution.

6. **Project init** (`initProject`) — interactive prompts, writes `crash-to-vibe.json` to CWD.

7. **Conditional resolution** (`resolveConditionals`) — processes `{{#if (eq VAR "VALUE")}}...{{/if}}` at generation time using `TEMPLATE_VAR_MAP`. Bare `{{#if signal}}` blocks (runtime signals) are left as prose in templates.

8. **Placeholder resolution** (`resolvePlaceholders`) — replaces `{{TOKEN}}` tokens with config values

9. **Skill installation** (`installSkill`, `buildTargetDirs`) — writes skill directory to target paths; throws if exists without `--force`

### Source templates

`templates/skill/` — per-project, processed at generation time:

| File | Content |
|---|---|
| `SKILL.md.tmpl` | Frontmatter + lean workflow (~250 lines) |
| `references/task-templates.md.tmpl` | CRITICAL/HIGH/PERFORMANCE/MONITORING task templates |
| `references/platform-patterns.md.tmpl` | Android/iOS/Flutter crash pattern guide |
| `references/pr-workflow.md.tmpl` | Bitbucket PR creation + merge workflow |

`templates/skill-zero-config/` — static files, copied as-is for `--zero-config`:

| File | Content |
|---|---|
| `SKILL.md` | Runtime discovery workflow (reads crash-to-vibe.json, uses Firebase MCP) |
| `references/task-templates.md` | Same templates with `[JIRA_PROJECT_KEY]`-style runtime placeholders |
| `references/platform-patterns.md` | All 3 platforms listed; AI picks based on detected files |
| `references/pr-workflow.md` | PR workflow with runtime placeholders |

### Template tokens

Key `{{TOKEN}}` placeholders — add to `resolvePlaceholders()` and use in template files:

| Placeholder | Source |
|---|---|
| `{{PROJECT_NAME}}` | config.project.name |
| `{{PLATFORM}}` | config.project.platform |
| `{{FIREBASE_PROJECT_ID}}` | config.firebase.projectId |
| `{{APP_ID}}` | config.firebase.appId |
| `{{JIRA_CLOUD_ID}}` | config.jira.cloudId |
| `{{JIRA_PROJECT_KEY}}` | config.jira.projectKey |
| `{{JIRA_LABELS}}` | config.jira.labels (default: `crash-to-vibe`) |
| `{{BITBUCKET_WORKSPACE}}` | config.bitbucket.workspace |
| `{{BITBUCKET_ENABLED}}` | `'enabled'` if bitbucket.workspace set, else `'disabled'` |

Config-time conditionals resolved by `resolveConditionals` (using `TEMPLATE_VAR_MAP`):
- `{{#if (eq PLATFORM "android")}}` / `ios` / `flutter`
- `{{#if (eq BITBUCKET_ENABLED "enabled")}}`

### Configuration schema

```javascript
{
  project: {
    directory: string,   // absolute path
    name: string,
    platform: string     // 'android' | 'ios' | 'flutter'
  },
  firebase: {
    projectId: string,
    appId: string,       // format: 1:number:platform:hash
    configFile: string,
    environment: string  // 'Production' | 'Development' | 'Staging' | etc.
  },
  jira: {
    cloudId: string,     // e.g. 'your-company.atlassian.net'
    projectKey: string,
    issueType: string,   // 'Bug' | 'Task' | 'Story'
    labels: string       // comma-separated, default: 'crash-to-vibe'
  },
  bitbucket: {
    workspace: string,
    repoSlug: string,
    targetBranch: string,
    reviewers: string[]
  },
  thresholds: {
    critical: { crashes: 800, users: 600 },
    high:     { crashes: 400, users: 300 },
    medium:   { crashes: 100, users: 50 }
  },
  aiAgents: ['claude', 'codex', 'gemini', 'amp']
}
```

### Output files

| File | Location | Purpose |
|---|---|---|
| `.agents/skills/crash-to-vibe/` | `process.cwd()` | Installed skill (default) |
| `~/.agents/skills/crash-to-vibe/` | Home dir | Global skill install (`--global`) |
| `~/.crash-analyzer-config.json` | Home dir | Config when globally installed |
| `./last-config.json` | Script dir | Config when run locally |

## Common Modifications

**New platform**: update `detectProjectInfo`, add config parse method, add section to `templates/skill/references/platform-patterns.md.tmpl`.

**New placeholder**: add to `resolvePlaceholders()` replacement map, add `{{PLACEHOLDER}}` to relevant template files, set value in `collectConfiguration`.

**New AI CLI**: add executor class in `ai-executors.js` extending `AIExecutor`, register in `AIExecutorFactory`.

**Upgrading from v1**: v1 generated `crashAnalyzer.md`; v2 generates `.agents/skills/crash-to-vibe/`. Pin to `crash-to-vibe@1.3.0` for v1 behavior.

**Thresholds**: change defaults in `CrashAnalyzerGenerator` constructor.

## Team Configuration

Share a JSON file (see `team-config.example.json`) based on `config.example.json` with pre-filled values. Team members run:

```bash
crash-to-vibe --config team-config.json
```

No interactive prompts for pre-filled fields.

## Git Workflow

- Main branch: `main`
- Test globally (`npm link`) before publishing
- Update `package.json` version following semver
- Update this file and `.github/copilot-instructions.md` when adding features
